import { NextRequest } from 'next/server'
import { ConversationStorage } from '@/app/lib/storage'

const storage = ConversationStorage.getInstance()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = await storage.getConversation(params.id)
    
    if (!conversation) {
      return Response.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }
    
    return Response.json({ conversation })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}