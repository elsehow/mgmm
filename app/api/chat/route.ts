import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ConversationStorage } from '@/app/lib/storage'
import { messagesToAnthropicFormat } from '@/app/lib/types/conversation'
import { API_CONFIG } from '@/app/config/constants'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const storage = ConversationStorage.getInstance()

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, userId = API_CONFIG.USERS.DEFAULT_USER_ID } = await request.json()

    if (!message) {
      return new Response('Message is required', { status: 400 })
    }

    let conversation
    if (conversationId) {
      conversation = await storage.getConversation(conversationId)
      if (!conversation) {
        return new Response('Conversation not found', { status: 404 })
      }
    } else {
      conversation = await storage.createConversation(userId)
    }

    await storage.addMessage(conversation.id, 'user', message)

    const updatedConversation = await storage.getConversation(conversation.id)
    if (!updatedConversation) {
      return new Response('Error retrieving conversation', { status: 500 })
    }

    const anthropicMessages = messagesToAnthropicFormat(updatedConversation.messages)

    const stream = await anthropic.messages.create({
      max_tokens: 1024,
      messages: anthropicMessages,
      model: API_CONFIG.MODELS.CLAUDE_SONNET,
      stream: true,
    })

    let assistantResponse = ''
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'conversation_id',
            conversationId: conversation.id,
          })}\n\n`))

          for await (const messageStreamEvent of stream) {
            if (messageStreamEvent.type === 'content_block_delta') {
              const text = (messageStreamEvent.delta as any).text || ''
              assistantResponse += text
              
              const chunk = encoder.encode(
                `data: ${JSON.stringify({
                  type: messageStreamEvent.type,
                  delta: messageStreamEvent.delta,
                })}\n\n`
              )
              controller.enqueue(chunk)
            }
          }
          
          await storage.addMessage(conversation.id, 'assistant', assistantResponse)
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error in chat route:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}