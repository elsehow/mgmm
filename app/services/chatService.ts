import { API_CONFIG, STREAM_EVENTS, ERROR_MESSAGES, CONSOLE_MESSAGES, STREAMING_CONFIG } from '@/app/config/constants'
import { Conversation } from '@/app/lib/types/conversation'

export interface ChatRequest {
  message: string
  date?: string
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
        date: request.date,
        userId: request.userId || API_CONFIG.USERS.DEFAULT_USER_ID,
      }),
    })

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.HTTP_ERROR(response.status))
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error(ERROR_MESSAGES.NO_READER_AVAILABLE)
    }

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split(STREAMING_CONFIG.LINE_SEPARATOR)

        for (const line of lines) {
          if (line.startsWith(STREAM_EVENTS.DATA_PREFIX)) {
            const data = line.slice(STREAMING_CONFIG.DATA_SLICE_INDEX)
            
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
              console.error(CONSOLE_MESSAGES.ERRORS.ERROR_PARSING_SSE_DATA, e)
            }
          }
        }
      }
    } catch (error) {
      handlers.onError?.(error as Error)
    }
  }


  async getConversationByDate(date: string, userId: string = API_CONFIG.USERS.DEFAULT_USER_ID): Promise<Conversation | null> {
    try {
      const response = await fetch(`/api/conversations/by-date/${date}?userId=${userId}`)
      
      if (!response.ok) {
        return null
      }

      const { conversation } = await response.json()
      return conversation
    } catch (error) {
      console.error(CONSOLE_MESSAGES.ERRORS.ERROR_FETCHING_CONVERSATION, error)
      return null
    }
  }

  async getAvailableDates(userId: string = API_CONFIG.USERS.DEFAULT_USER_ID): Promise<string[]> {
    try {
      const response = await fetch(`/api/conversations/dates?userId=${userId}`)
      
      if (!response.ok) {
        return []
      }

      const { dates } = await response.json()
      return dates
    } catch (error) {
      console.error(CONSOLE_MESSAGES.ERRORS.ERROR_FETCHING_CONVERSATIONS, error)
      return []
    }
  }
}