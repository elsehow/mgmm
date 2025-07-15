import { Message } from './types/conversation'

export function createPendingMessage(content: string): Message {
  return {
    id: `pending-${Date.now()}`,
    role: 'user',
    content,
    timestamp: new Date(),
    pending: true,
    localOnly: true
  }
}

export function createStreamingMessage(content: string): Message {
  return {
    id: 'streaming',
    role: 'assistant',
    content,
    timestamp: new Date()
  }
}