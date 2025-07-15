import { NextRequest } from 'next/server'
import { ConversationStorage } from '@/app/lib/storage'
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES, CONSOLE_MESSAGES } from '@/app/config/constants'

const storage = ConversationStorage.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || API_CONFIG.USERS.DEFAULT_USER_ID

    const dates = await storage.getAvailableDates(userId)
    
    return Response.json({ dates })
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERRORS.ERROR_FETCHING_CONVERSATIONS, error)
    return Response.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}