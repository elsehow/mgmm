import { NextRequest } from 'next/server'
import { ConversationStorage } from '@/app/lib/storage'
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES, CONSOLE_MESSAGES } from '@/app/config/constants'

const storage = ConversationStorage.getInstance()

export async function GET(request: NextRequest) {
  try {
    const conversations = await storage.getAllConversations()
    
    return Response.json({ conversations })
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERRORS.ERROR_FETCHING_CONVERSATIONS, error)
    return Response.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}