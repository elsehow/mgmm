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
  const testUserId = 'test-user-123'
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

        const result = await storage.getConversationByDate(testUserId, testDate)
        
        expect(result).toBeNull()
        expect(mockFs.readFile).toHaveBeenCalledWith(
          expect.stringContaining('2024-01-15.json'),
          'utf8'
        )
      })

      it('should return conversation for existing date', async () => {
        const mockConversation = global.createMockConversation(testDateString, testUserId, testDate, [
          global.createMockMessage('msg1', 'user', 'Hello', testDate),
          global.createMockMessage('msg2', 'assistant', 'Hi there!', testDate),
        ])

        mockFs.readFile.mockResolvedValue(JSON.stringify(mockConversation))

        const result = await storage.getConversationByDate(testUserId, testDate)
        
        expect(result).toBeDefined()
        expect(result?.id).toBe(testDateString)
        expect(result?.userId).toBe(testUserId)
        expect(result?.messages).toHaveLength(2)
        expect(result?.messages[0].content).toBe('Hello')
        expect(result?.messages[1].content).toBe('Hi there!')
      })

      it('should return null for wrong user', async () => {
        const mockConversation = global.createMockConversation(testDateString, 'other-user', testDate)
        mockFs.readFile.mockResolvedValue(JSON.stringify(mockConversation))

        const result = await storage.getConversationByDate(testUserId, testDate)
        
        expect(result).toBeNull()
      })

      it('should properly parse dates from JSON', async () => {
        const mockConversation = global.createMockConversation(testDateString, testUserId, testDate, [
          global.createMockMessage('msg1', 'user', 'Hello', testDate),
        ])

        mockFs.readFile.mockResolvedValue(JSON.stringify(mockConversation))

        const result = await storage.getConversationByDate(testUserId, testDate)
        
        expect(result?.createdAt).toBeInstanceOf(Date)
        expect(result?.updatedAt).toBeInstanceOf(Date)
        expect(result?.messages[0].timestamp).toBeInstanceOf(Date)
      })

      it('should handle corrupted JSON gracefully', async () => {
        mockFs.readFile.mockResolvedValue('invalid json{')

        await expect(storage.getConversationByDate(testUserId, testDate))
          .rejects.toThrow()
      })
    })

    describe('createConversationForDate', () => {
      beforeEach(() => {
        mockFs.access.mockRejectedValue({ code: 'ENOENT' })
        mockFs.mkdir.mockResolvedValue(undefined)
        mockFs.writeFile.mockResolvedValue(undefined)
      })

      it('should create new conversation with correct structure', async () => {
        const result = await storage.createConversationForDate(testUserId, testDate)
        
        expect(result.id).toBe(testDateString)
        expect(result.userId).toBe(testUserId)
        expect(result.messages).toHaveLength(0)
        expect(result.createdAt).toEqual(testDate)
        expect(result.updatedAt).toEqual(testDate)
      })

      it('should ensure storage directory exists', async () => {
        await storage.createConversationForDate(testUserId, testDate)
        
        expect(mockFs.mkdir).toHaveBeenCalledWith(
          expect.stringContaining('data/conversations'),
          { recursive: true }
        )
      })

      it('should write conversation to correct file path', async () => {
        await storage.createConversationForDate(testUserId, testDate)
        
        expect(mockFs.writeFile).toHaveBeenCalledWith(
          expect.stringContaining('2024-01-15.json'),
          expect.stringContaining(testDateString)
        )
      })

      it('should not create directory if it already exists', async () => {
        mockFs.access.mockResolvedValue(undefined)
        
        await storage.createConversationForDate(testUserId, testDate)
        
        expect(mockFs.mkdir).not.toHaveBeenCalled()
      })
    })

    describe('getAvailableDates', () => {
      it('should return empty array for no conversations', async () => {
        mockFs.readdir.mockResolvedValue([])

        const result = await storage.getAvailableDates(testUserId)
        
        expect(result).toEqual([])
      })

      it('should filter date-based files only', async () => {
        mockFs.readdir.mockResolvedValue([
          '2024-01-15.json',
          '2024-01-16.json',
          'some-uuid-123.json',
          'invalid-file.txt',
        ] as any)

        // Mock conversations with messages
        const mockConversation1 = global.createMockConversation('2024-01-15', testUserId, testDate, [
          global.createMockMessage('msg1', 'user', 'Hello', testDate),
        ])
        const mockConversation2 = global.createMockConversation('2024-01-16', testUserId, testDate, [
          global.createMockMessage('msg2', 'user', 'Hi', testDate),
        ])

        mockFs.readFile
          .mockResolvedValueOnce(JSON.stringify(mockConversation1))
          .mockResolvedValueOnce(JSON.stringify(mockConversation2))

        const result = await storage.getAvailableDates(testUserId)
        
        expect(result).toEqual(['2024-01-16', '2024-01-15']) // Most recent first
      })

      it('should filter by user ID', async () => {
        mockFs.readdir.mockResolvedValue(['2024-01-15.json', '2024-01-16.json'] as any)

        const userConversation = global.createMockConversation('2024-01-15', testUserId, testDate, [
          global.createMockMessage('msg1', 'user', 'Hello', testDate),
        ])
        const otherUserConversation = global.createMockConversation('2024-01-16', 'other-user', testDate, [
          global.createMockMessage('msg2', 'user', 'Hi', testDate),
        ])

        mockFs.readFile
          .mockResolvedValueOnce(JSON.stringify(userConversation))
          .mockResolvedValueOnce(JSON.stringify(otherUserConversation))

        const result = await storage.getAvailableDates(testUserId)
        
        expect(result).toEqual(['2024-01-15'])
      })

      it('should exclude conversations with no messages', async () => {
        mockFs.readdir.mockResolvedValue(['2024-01-15.json'] as any)

        const emptyConversation = global.createMockConversation('2024-01-15', testUserId, testDate, [])
        mockFs.readFile.mockResolvedValue(JSON.stringify(emptyConversation))

        const result = await storage.getAvailableDates(testUserId)
        
        expect(result).toEqual([])
      })

      it('should handle file read errors gracefully', async () => {
        mockFs.readdir.mockResolvedValue(['2024-01-15.json', '2024-01-16.json'] as any)
        mockFs.readFile
          .mockRejectedValueOnce(new Error('File read error'))
          .mockResolvedValueOnce(JSON.stringify(global.createMockConversation('2024-01-16', testUserId, testDate, [
            global.createMockMessage('msg1', 'user', 'Hello', testDate),
          ])))

        const result = await storage.getAvailableDates(testUserId)
        
        expect(result).toEqual(['2024-01-16'])
      })

      it('should handle directory read errors', async () => {
        mockFs.readdir.mockRejectedValue(new Error('Directory read error'))

        const result = await storage.getAvailableDates(testUserId)
        
        expect(result).toEqual([])
      })
    })

    describe('addMessageToDateConversation', () => {
      it('should add message to existing conversation', async () => {
        const existingConversation = global.createMockConversation(testDateString, testUserId, testDate, [
          global.createMockMessage('msg1', 'user', 'Hello', testDate),
        ])

        mockFs.readFile.mockResolvedValue(JSON.stringify(existingConversation))
        mockFs.writeFile.mockResolvedValue(undefined)

        const result = await storage.addMessageToDateConversation(
          testUserId,
          testDate,
          'assistant',
          'Hi there!'
        )
        
        expect(result.content).toBe('Hi there!')
        expect(result.role).toBe('assistant')
        expect(result.id).toBe('mock-uuid-12345')
        expect(result.timestamp).toBeInstanceOf(Date)
      })

      it('should create new conversation if none exists', async () => {
        mockFs.readFile.mockRejectedValue({ code: 'ENOENT' })
        mockFs.access.mockRejectedValue({ code: 'ENOENT' })
        mockFs.mkdir.mockResolvedValue(undefined)
        mockFs.writeFile.mockResolvedValue(undefined)

        const result = await storage.addMessageToDateConversation(
          testUserId,
          testDate,
          'user',
          'Hello'
        )
        
        expect(result.content).toBe('Hello')
        expect(result.role).toBe('user')
        expect(mockFs.writeFile).toHaveBeenCalledTimes(2) // Once for conversation, once for message
      })

      it('should update conversation timestamps', async () => {
        const originalDate = new Date('2024-01-15T10:00:00.000Z')
        const existingConversation = global.createMockConversation(testDateString, testUserId, originalDate)

        mockFs.readFile.mockResolvedValue(JSON.stringify(existingConversation))
        mockFs.writeFile.mockResolvedValue(undefined)

        await storage.addMessageToDateConversation(
          testUserId,
          testDate,
          'user',
          'Hello'
        )
        
        expect(mockFs.writeFile).toHaveBeenCalledWith(
          expect.stringContaining('2024-01-15.json'),
          expect.stringContaining('"updatedAt"')
        )
      })
    })
  })

  describe('File System Error Handling', () => {
    it('should handle permission errors', async () => {
      mockFs.access.mockRejectedValue({ code: 'ENOENT' })
      const permissionError = new Error('Permission denied') as any
      permissionError.code = 'EACCES'
      mockFs.mkdir.mockRejectedValue(permissionError)

      await expect(storage.createConversationForDate(testUserId, testDate))
        .rejects.toThrow('Permission denied')
    })

    it('should handle disk space errors', async () => {
      mockFs.access.mockRejectedValue({ code: 'ENOENT' })
      mockFs.mkdir.mockResolvedValue(undefined)
      const diskSpaceError = new Error('No space left on device') as any
      diskSpaceError.code = 'ENOSPC'
      mockFs.writeFile.mockRejectedValue(diskSpaceError)

      await expect(storage.createConversationForDate(testUserId, testDate))
        .rejects.toThrow('No space left on device')
    })

    it('should handle directory creation failures', async () => {
      mockFs.access.mockRejectedValue({ code: 'ENOENT' })
      mockFs.mkdir.mockRejectedValue(new Error('Failed to create directory'))

      await expect(storage.createConversationForDate(testUserId, testDate))
        .rejects.toThrow('Failed to create directory')
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid date formats', async () => {
      const invalidDate = new Date('invalid')
      
      await expect(storage.getConversationByDate(testUserId, invalidDate))
        .rejects.toThrow()
    })

    it('should handle empty user ID', async () => {
      // Reset mocks for clean state
      mockFs.access.mockResolvedValue(undefined)
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.readdir.mockResolvedValue(['2024-01-15.json'] as any)
      const mockConversation = global.createMockConversation('2024-01-15', '', testDate, [
        global.createMockMessage('msg1', 'user', 'Hello', testDate),
      ])
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockConversation))

      const result = await storage.getAvailableDates('')
      
      expect(result).toEqual(['2024-01-15'])
    })

    it('should handle very long file names', async () => {
      const longUserId = 'a'.repeat(1000)
      mockFs.access.mockRejectedValue({ code: 'ENOENT' })
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.writeFile.mockResolvedValue(undefined)

      await expect(storage.createConversationForDate(longUserId, testDate))
        .resolves.toBeDefined()
    })
  })
})