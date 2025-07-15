import { NextRequest } from 'next/server'
import { ConversationStorage } from '@/app/lib/storage'

const storage = ConversationStorage.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default-user'

    const conversations = await storage.getUserConversations(userId)
    
    return Response.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}