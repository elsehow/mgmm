import { MessageParam } from '@anthropic-ai/sdk/resources/messages'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  pending?: boolean
  error?: boolean
  localOnly?: boolean
}

export interface Conversation {
  id: string
  userId: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface ConversationSummary {
  id: string
  userId: string
  lastMessage?: string
  messageCount: number
  createdAt: Date
  updatedAt: Date
}

export function messagesToAnthropicFormat(messages: Message[]): MessageParam[] {
  return messages
    .filter(msg => !msg.localOnly && !msg.pending && !msg.error)
    .map(msg => ({
      role: msg.role,
      content: msg.content
    }))
}