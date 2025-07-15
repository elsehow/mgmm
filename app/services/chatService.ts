import { API_CONFIG, STREAM_EVENTS } from '@/app/config/constants'
import { Conversation } from '@/app/lib/types/conversation'

export interface ChatRequest {
  message: string
  conversationId?: string
  userId?: string
}

export interface StreamHandlers {
  onConversationId?: (conversationId: string) => void
  onContentDelta?: (text: string) => void
  onDone?: () => void
  onError?: (error: Error) => void
}

export class ChatService {
  async sendMessage(request: ChatRequest, handlers: StreamHandlers): Promise<void> {
    const response = await fetch(API_CONFIG.ENDPOINTS.CHAT, {
      method: 'POST',
      headers: {
        [API_CONFIG.HEADERS.CONTENT_TYPE]: API_CONFIG.HEADERS.APPLICATION_JSON,
      },
      body: JSON.stringify({
        message: request.message,
        conversationId: request.conversationId,
        userId: request.userId || API_CONFIG.USERS.DEFAULT_USER_ID,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('No reader available')
    }

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === STREAM_EVENTS.DONE) {
              handlers.onDone?.()
              return
            }

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.type === STREAM_EVENTS.CONVERSATION_ID) {
                handlers.onConversationId?.(parsed.conversationId)
              } else if (parsed.type === STREAM_EVENTS.CONTENT_BLOCK_DELTA && parsed.delta?.text) {
                handlers.onContentDelta?.(parsed.delta.text)
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      handlers.onError?.(error as Error)
    }
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.CONVERSATION_BY_ID(conversationId))
      
      if (!response.ok) {
        return null
      }

      const { conversation } = await response.json()
      return conversation
    } catch (error) {
      console.error('Error fetching conversation:', error)
      return null
    }
  }
}