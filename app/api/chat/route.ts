import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ConversationStorage } from '@/app/lib/storage'
import { messagesToAnthropicFormat } from '@/app/lib/types/conversation'
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES, STREAMING_CONFIG } from '@/app/config/constants'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const storage = ConversationStorage.getInstance()

export async function POST(request: NextRequest) {
  try {
    const { message, date, userId = API_CONFIG.USERS.DEFAULT_USER_ID } = await request.json()

    if (!message) {
      return new Response(ERROR_MESSAGES.MESSAGE_REQUIRED, { status: HTTP_STATUS.BAD_REQUEST })
    }

    let conversation
    const targetDate = date ? new Date(date + 'T00:00:00.000Z') : new Date()
    
    conversation = await storage.getConversationByDate(userId, targetDate)
    if (!conversation) {
      conversation = await storage.createConversationForDate(userId, targetDate)
    }
    await storage.addMessageToDateConversation(userId, targetDate, 'user', message)
    conversation = await storage.getConversationByDate(userId, targetDate)

    if (!conversation) {
      return new Response(ERROR_MESSAGES.ERROR_RETRIEVING_CONVERSATION, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR })
    }

    const anthropicMessages = messagesToAnthropicFormat(conversation.messages)

    const stream = await anthropic.messages.create({
      max_tokens: API_CONFIG.LIMITS.MAX_TOKENS,
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
          
          // Add assistant response to the conversation
          await storage.addMessageToDateConversation(userId, targetDate, 'assistant', assistantResponse)
          
          controller.enqueue(encoder.encode(STREAMING_CONFIG.DONE_EVENT))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: STREAMING_CONFIG.RESPONSE_HEADERS,
    })
  } catch (error) {
    console.error('Error in chat route:', error)
    return new Response(
      JSON.stringify({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }),
      { 
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        headers: { [API_CONFIG.HEADERS.CONTENT_TYPE]: API_CONFIG.HEADERS.APPLICATION_JSON },
      }
    )
  }
}