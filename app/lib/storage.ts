import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { Conversation, Message, ConversationSummary } from './types/conversation'
import { STORAGE_CONFIG, CONSOLE_MESSAGES } from '@/app/config/constants'

const STORAGE_DIR = path.join(process.cwd(), STORAGE_CONFIG.DIRECTORY, STORAGE_CONFIG.SUBDIRECTORY)

export class ConversationStorage {
  private static instance: ConversationStorage
  
  private constructor() {}
  
  static getInstance(): ConversationStorage {
    if (!ConversationStorage.instance) {
      ConversationStorage.instance = new ConversationStorage()
    }
    return ConversationStorage.instance
  }

  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.access(STORAGE_DIR)
    } catch {
      await fs.mkdir(STORAGE_DIR, { recursive: true })
    }
  }

  private getConversationPath(conversationId: string): string {
    return path.join(STORAGE_DIR, `${conversationId}${STORAGE_CONFIG.FILE_EXTENSION}`)
  }

  async createConversation(userId: string): Promise<Conversation> {
    await this.ensureStorageDir()
    
    const conversation: Conversation = {
      id: randomUUID(),
      userId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const filePath = this.getConversationPath(conversation.id)
    await fs.writeFile(filePath, JSON.stringify(conversation, null, STORAGE_CONFIG.JSON_SPACING))
    
    return conversation
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const filePath = this.getConversationPath(conversationId)
      const data = await fs.readFile(filePath, STORAGE_CONFIG.ENCODING)
      const conversation = JSON.parse(data) as Conversation
      
      conversation.createdAt = new Date(conversation.createdAt)
      conversation.updatedAt = new Date(conversation.updatedAt)
      conversation.messages = conversation.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
      
      return conversation
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === STORAGE_CONFIG.ERROR_CODES.FILE_NOT_FOUND) {
        return null
      }
      throw error
    }
  }

  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
    const conversation = await this.getConversation(conversationId)
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`)
    }

    const message: Message = {
      id: randomUUID(),
      role,
      content,
      timestamp: new Date()
    }

    conversation.messages.push(message)
    conversation.updatedAt = new Date()

    const filePath = this.getConversationPath(conversationId)
    await fs.writeFile(filePath, JSON.stringify(conversation, null, STORAGE_CONFIG.JSON_SPACING))
    
    return message
  }

  async getUserConversations(userId: string): Promise<ConversationSummary[]> {
    await this.ensureStorageDir()
    
    try {
      const files = await fs.readdir(STORAGE_DIR)
      const summaries: ConversationSummary[] = []

      for (const file of files) {
        if (file.endsWith(STORAGE_CONFIG.FILE_EXTENSION)) {
          try {
            const filePath = path.join(STORAGE_DIR, file)
            const data = await fs.readFile(filePath, STORAGE_CONFIG.ENCODING)
            const conversation = JSON.parse(data) as Conversation
            
            if (conversation.userId === userId) {
              summaries.push({
                id: conversation.id,
                userId: conversation.userId,
                lastMessage: conversation.messages[conversation.messages.length - 1]?.content,
                messageCount: conversation.messages.length,
                createdAt: new Date(conversation.createdAt),
                updatedAt: new Date(conversation.updatedAt)
              })
            }
          } catch (error) {
            console.error(`Error reading conversation file ${file}:`, error)
          }
        }
      }

      return summaries.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    } catch (error) {
      console.error(CONSOLE_MESSAGES.ERRORS.ERROR_READING_CONVERSATIONS_DIR, error)
      return []
    }
  }
}