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


  private getDateBasedPath(date: string): string {
    return path.join(STORAGE_DIR, `${date}${STORAGE_CONFIG.FILE_EXTENSION}`)
  }

  private formatDateForStorage(date: Date): string {
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  }




  async getConversationByDate(date: Date): Promise<Conversation | null> {
    const dateStr = this.formatDateForStorage(date)
    const filePath = this.getDateBasedPath(dateStr)
    
    try {
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

  async createConversationForDate(date: Date): Promise<Conversation> {
    await this.ensureStorageDir()
    
    const dateStr = this.formatDateForStorage(date)
    const conversation: Conversation = {
      id: dateStr, // Use date as ID for date-based conversations
      messages: [],
      createdAt: date,
      updatedAt: date
    }

    const filePath = this.getDateBasedPath(dateStr)
    await fs.writeFile(filePath, JSON.stringify(conversation, null, STORAGE_CONFIG.JSON_SPACING))
    
    return conversation
  }

  async getAvailableDates(): Promise<string[]> {
    await this.ensureStorageDir()
    
    try {
      const files = await fs.readdir(STORAGE_DIR)
      const dates: string[] = []

      for (const file of files) {
        if (file.endsWith(STORAGE_CONFIG.FILE_EXTENSION)) {
          const fileName = file.replace(STORAGE_CONFIG.FILE_EXTENSION, '')
          
          // Check if it's a date-based file (YYYY-MM-DD format)
          if (/^\d{4}-\d{2}-\d{2}$/.test(fileName)) {
            try {
              const filePath = path.join(STORAGE_DIR, file)
              const data = await fs.readFile(filePath, STORAGE_CONFIG.ENCODING)
              const conversation = JSON.parse(data) as Conversation
              
              if (conversation.messages.length > 0) {
                dates.push(fileName)
              }
            } catch (error) {
              console.error(`Error reading conversation file ${file}:`, error)
            }
          }
        }
      }

      return dates.sort().reverse() // Most recent first
    } catch (error) {
      console.error(CONSOLE_MESSAGES.ERRORS.ERROR_READING_CONVERSATIONS_DIR, error)
      return []
    }
  }

  async addMessageToDateConversation(date: Date, role: 'user' | 'assistant', content: string): Promise<Message> {
    let conversation = await this.getConversationByDate(date)
    
    if (!conversation) {
      conversation = await this.createConversationForDate(date)
    }

    const message: Message = {
      id: randomUUID(),
      role,
      content,
      timestamp: new Date()
    }

    conversation.messages.push(message)
    conversation.updatedAt = new Date()

    const dateStr = this.formatDateForStorage(date)
    const filePath = this.getDateBasedPath(dateStr)
    await fs.writeFile(filePath, JSON.stringify(conversation, null, STORAGE_CONFIG.JSON_SPACING))
    
    return message
  }

  async getAllConversations(): Promise<ConversationSummary[]> {
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
            
            summaries.push({
              id: conversation.id,
              lastMessage: conversation.messages[conversation.messages.length - 1]?.content,
              messageCount: conversation.messages.length,
              createdAt: new Date(conversation.createdAt),
              updatedAt: new Date(conversation.updatedAt)
            })
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