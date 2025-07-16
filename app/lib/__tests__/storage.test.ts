import { promises as fs } from 'fs'
import { ConversationStorage } from '../storage'

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    readdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}))

// Mock crypto module
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid-12345'),
}))

const mockFs = fs as jest.Mocked<typeof fs>

describe('ConversationStorage', () => {
  let storage: ConversationStorage
  const testDate = new Date('2024-01-15T00:00:00.000Z')
  const testDateString = '2024-01-15'

  beforeEach(() => {
    storage = ConversationStorage.getInstance()
    jest.clearAllMocks()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ConversationStorage.getInstance()
      const instance2 = ConversationStorage.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Date-based Operations', () => {
    describe('getConversationByDate', () => {
      it('should return null for non-existent conversation', async () => {
        mockFs.readFile.mockRejectedValue({ code: 'ENOENT' })

        const result = await storage.getConversationByDate(testDate)
        
        expect(result).toBeNull()
        expect(mockFs.readFile).toHaveBeenCalledWith(
          expect.stringContaining('2024-01-15.json'),
          'utf8'
        )
      })

      it('should return conversation for existing date', async () => {
        const mockConversation = global.createMockConversation(testDateString, testDate, [
          global.createMockMessage('msg1', 'user', 'Hello', testDate),
          global.createMockMessage('msg2', 'assistant', 'Hi there!', testDate),
        ])

        mockFs.readFile.mockResolvedValue(JSON.stringify(mockConversation))

        const result = await storage.getConversationByDate(testDate)
        
        expect(result).toBeDefined()
        expect(result?.id).toBe(testDateString)
        expect(result?.messages).toHaveLength(2)
        expect(result?.messages[0].content).toBe('Hello')
        expect(result?.messages[1].content).toBe('Hi there!')
      })

      it('should properly parse dates from JSON', async () => {
        const mockConversation = global.createMockConversation(testDateString, testDate, [
          global.createMockMessage('msg1', 'user', 'Hello', testDate),
        ])

        mockFs.readFile.mockResolvedValue(JSON.stringify(mockConversation))

        const result = await storage.getConversationByDate(testDate)
        
        expect(result?.createdAt).toBeInstanceOf(Date)
        expect(result?.updatedAt).toBeInstanceOf(Date)
        expect(result?.messages[0].timestamp).toBeInstanceOf(Date)
      })

      it('should throw error for other file system errors', async () => {
        mockFs.readFile.mockRejectedValue(new Error('Permission denied'))

        await expect(storage.getConversationByDate(testDate))
          .rejects
          .toThrow('Permission denied')
      })
    })

    describe('createConversationForDate', () => {
      it('should create new conversation with date as ID', async () => {
        mockFs.access.mockRejectedValue(new Error('Directory not found'))

        const result = await storage.createConversationForDate(testDate)
        
        expect(result.id).toBe(testDateString)
        expect(result.messages).toEqual([])
        expect(result.createdAt).toBe(testDate)
        expect(result.updatedAt).toBe(testDate)
        expect(mockFs.mkdir).toHaveBeenCalled()
        expect(mockFs.writeFile).toHaveBeenCalledWith(
          expect.stringContaining('2024-01-15.json'),
          expect.stringContaining(testDateString),
          'utf8'
        )
      })

      it('should create directory if it doesn\\'t exist', async () => {
        mockFs.access.mockRejectedValue(new Error('Directory not found'))

        await storage.createConversationForDate(testDate)

        expect(mockFs.mkdir).toHaveBeenCalledWith(
          expect.stringContaining('conversations'),
          { recursive: true }
        )
      })

      it('should not create directory if it exists', async () => {
        mockFs.access.mockResolvedValue(undefined)

        await storage.createConversationForDate(testDate)

        expect(mockFs.mkdir).not.toHaveBeenCalled()
      })
    })

    describe('getAvailableDates', () => {
      it('should return empty array for empty directory', async () => {
        mockFs.readdir.mockResolvedValue([])

        const result = await storage.getAvailableDates()
        
        expect(result).toEqual([])
      })

      it('should return sorted dates with conversations', async () => {
        mockFs.readdir.mockResolvedValue(['2024-01-15.json', '2024-01-16.json'])
        
        const mockConversation1 = global.createMockConversation('2024-01-15', testDate, [
          global.createMockMessage('msg1', 'user', 'Hello', testDate),
        ])
        const mockConversation2 = global.createMockConversation('2024-01-16', testDate, [
          global.createMockMessage('msg2', 'user', 'Hi', testDate),
        ])

        mockFs.readFile
          .mockResolvedValueOnce(JSON.stringify(mockConversation1))
          .mockResolvedValueOnce(JSON.stringify(mockConversation2))

        const result = await storage.getAvailableDates()
        
        expect(result).toEqual(['2024-01-16', '2024-01-15']) // Most recent first
      })

      it('should exclude conversations with no messages', async () => {
        mockFs.readdir.mockResolvedValue(['2024-01-15.json'])
        
        const emptyConversation = global.createMockConversation('2024-01-15', testDate, [])
        mockFs.readFile.mockResolvedValue(JSON.stringify(emptyConversation))

        const result = await storage.getAvailableDates()
        
        expect(result).toEqual([])
      })

      it('should only include date-format files', async () => {
        mockFs.readdir.mockResolvedValue(['2024-01-15.json', 'invalid-name.json', 'uuid-12345.json'])
        
        mockFs.readFile
          .mockResolvedValueOnce(JSON.stringify(global.createMockConversation('2024-01-16', testDate, [
            global.createMockMessage('msg1', 'user', 'Hello', testDate),
          ])))

        const result = await storage.getAvailableDates()
        
        expect(result).toEqual(['2024-01-16'])
      })

      it('should handle file reading errors gracefully', async () => {
        mockFs.readdir.mockResolvedValue(['2024-01-15.json'])
        mockFs.readFile.mockRejectedValue(new Error('File error'))

        const result = await storage.getAvailableDates()
        
        expect(result).toEqual([])
      })
    })

    describe('addMessageToDateConversation', () => {
      it('should add message to existing conversation', async () => {
        const existingConversation = global.createMockConversation(testDateString, testDate, [
          global.createMockMessage('msg1', 'user', 'Hello', testDate),
        ])
        
        mockFs.readFile.mockResolvedValue(JSON.stringify(existingConversation))

        const result = await storage.addMessageToDateConversation(
          testDate,
          'user',
          'New message'
        )
        
        expect(result).toBeDefined()
        expect(result.id).toBe('mock-uuid-12345')
        expect(result.role).toBe('user')
        expect(result.content).toBe('New message')
        expect(result.timestamp).toBeInstanceOf(Date)
        
        const writeCall = mockFs.writeFile.mock.calls[0]
        const writtenData = JSON.parse(writeCall[1] as string)
        expect(writtenData.messages).toHaveLength(2)
        expect(writtenData.messages[1].content).toBe('New message')
      })

      it('should create new conversation if none exists', async () => {
        const originalDate = new Date('2024-01-15T10:00:00.000Z')
        const existingConversation = global.createMockConversation(testDateString, originalDate)
        
        mockFs.readFile
          .mockRejectedValueOnce({ code: 'ENOENT' })
          .mockResolvedValueOnce(JSON.stringify(existingConversation))

        const result = await storage.addMessageToDateConversation(
          testDate,
          'user',
          'First message'
        )
        
        expect(result).toBeDefined()
        expect(result.role).toBe('user')
        expect(result.content).toBe('First message')
        
        // Should call writeFile twice: once for creating, once for adding message
        expect(mockFs.writeFile).toHaveBeenCalledTimes(2)
      })
    })

    describe('getAllConversations', () => {
      it('should return all conversation summaries', async () => {
        mockFs.readdir.mockResolvedValue(['2024-01-15.json', '2024-01-16.json'])
        
        const conv1 = global.createMockConversation('2024-01-15', testDate, [
          global.createMockMessage('msg1', 'user', 'Hello', testDate),
        ])
        const conv2 = global.createMockConversation('2024-01-16', testDate, [
          global.createMockMessage('msg2', 'user', 'Hi', testDate),
        ])

        mockFs.readFile
          .mockResolvedValueOnce(JSON.stringify(conv1))
          .mockResolvedValueOnce(JSON.stringify(conv2))

        const result = await storage.getAllConversations()
        
        expect(result).toHaveLength(2)
        expect(result[0].id).toBe('2024-01-16')
        expect(result[1].id).toBe('2024-01-15')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid date formats', async () => {
      const invalidDate = new Date('invalid')
      
      await expect(storage.createConversationForDate(invalidDate))
        .rejects
        .toThrow()
    })

    it('should handle file system errors during creation', async () => {
      mockFs.writeFile.mockRejectedValue(new Error('Disk full'))
      
      await expect(storage.createConversationForDate(testDate))
        .rejects
        .toThrow('Disk full')
    })

    it('should handle directory creation errors', async () => {
      mockFs.access.mockRejectedValue(new Error('No access'))
      mockFs.mkdir.mockRejectedValue(new Error('Permission denied'))
      
      await expect(storage.createConversationForDate(testDate))
        .rejects
        .toThrow('Permission denied')
    })
  })
})