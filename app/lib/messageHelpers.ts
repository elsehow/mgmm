import { Message } from './types/conversation'
import { MESSAGE_ROLES } from '@/app/config/constants'

export function createPendingMessage(content: string): Message {
  return {
    id: `pending-${Date.now()}`,
    role: MESSAGE_ROLES.USER,
    content,
    timestamp: new Date(),
    pending: true,
    localOnly: true
  }
}

export function createStreamingMessage(content: string): Message {
  return {
    id: 'streaming',
    role: MESSAGE_ROLES.ASSISTANT,
    content,
    timestamp: new Date()
  }
}