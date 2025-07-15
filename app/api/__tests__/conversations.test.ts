import { NextRequest } from 'next/server'
import { HTTP_STATUS } from '@/app/config/constants'

// Mock the storage module
const mockStorage = {
  getUserConversations: jest.fn(),
}

jest.mock('@/app/lib/storage', () => ({
  ConversationStorage: {
    getInstance: jest.fn(() => mockStorage),
  },
}))

// Import after mocking
import { GET } from '../conversations/route'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('/api/conversations', () => {
  describe('GET', () => {
    it('should return conversations for default user', async () => {
      const mockConversations = [
        {
          id: '2024-01-15',
          userId: 'default-user',
          lastMessage: 'Hello',
          messageCount: 2,
          createdAt: new Date('2024-01-15T10:00:00.000Z'),
          updatedAt: new Date('2024-01-15T10:30:00.000Z'),
        },
      ]
      mockStorage.getUserConversations.mockResolvedValue(mockConversations)

      const request = new NextRequest('http://localhost:3000/api/conversations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(data).toEqual({ 
        conversations: mockConversations.map(conv => ({
          ...conv,
          createdAt: conv.createdAt.toISOString(),
          updatedAt: conv.updatedAt.toISOString(),
        }))
      })
      expect(mockStorage.getUserConversations).toHaveBeenCalledWith('default-user')
    })

    it('should return conversations for specific user', async () => {
      const mockConversations = [
        {
          id: '2024-01-15',
          userId: 'test-user',
          lastMessage: 'Hello',
          messageCount: 1,
          createdAt: new Date('2024-01-15T10:00:00.000Z'),
          updatedAt: new Date('2024-01-15T10:00:00.000Z'),
        },
      ]
      mockStorage.getUserConversations.mockResolvedValue(mockConversations)

      const request = new NextRequest('http://localhost:3000/api/conversations?userId=test-user')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(data).toEqual({ 
        conversations: mockConversations.map(conv => ({
          ...conv,
          createdAt: conv.createdAt.toISOString(),
          updatedAt: conv.updatedAt.toISOString(),
        }))
      })
      expect(mockStorage.getUserConversations).toHaveBeenCalledWith('test-user')
    })

    it('should return empty array when no conversations exist', async () => {
      mockStorage.getUserConversations.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/conversations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(data).toEqual({ conversations: [] })
    })

    it('should handle storage errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      mockStorage.getUserConversations.mockRejectedValue(new Error('Storage error'))

      const request = new NextRequest('http://localhost:3000/api/conversations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      expect(data.error).toBe('Internal server error')
      expect(consoleErrorSpy).toHaveBeenCalled()
      
      consoleErrorSpy.mockRestore()
    })
  })
})