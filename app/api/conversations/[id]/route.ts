import { NextRequest } from 'next/server'
import { ConversationStorage } from '@/app/lib/storage'
import { HTTP_STATUS, ERROR_MESSAGES, CONSOLE_MESSAGES } from '@/app/config/constants'

const storage = ConversationStorage.getInstance()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = await storage.getConversation(params.id)
    
    if (!conversation) {
      return Response.json(
        { error: ERROR_MESSAGES.CONVERSATION_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      )
    }
    
    return Response.json({ conversation })
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERRORS.ERROR_FETCHING_CONVERSATION, error)
    return Response.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}