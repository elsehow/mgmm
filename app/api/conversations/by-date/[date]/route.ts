import { NextRequest } from 'next/server'
import { ConversationStorage } from '@/app/lib/storage'
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES, CONSOLE_MESSAGES } from '@/app/config/constants'

const storage = ConversationStorage.getInstance()

export async function GET(request: NextRequest, { params }: { params: { date: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || API_CONFIG.USERS.DEFAULT_USER_ID
    const { date } = params

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Response.json(
        { error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const dateObj = new Date(date + 'T00:00:00.000Z')
    const conversation = await storage.getConversationByDate(userId, dateObj)
    
    if (!conversation) {
      return Response.json(
        { error: 'No conversation found for this date' },
        { status: HTTP_STATUS.NOT_FOUND }
      )
    }

    return Response.json({ conversation })
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERRORS.ERROR_FETCHING_CONVERSATIONS, error)
    return Response.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}