import { NextRequest } from 'next/server'
import { HTTP_STATUS } from '@/app/config/constants'

// Mock the storage module
const mockStorage = {
  getConversationByDate: jest.fn(),
}

jest.mock('@/app/lib/storage', () => ({
  ConversationStorage: {
    getInstance: jest.fn(() => mockStorage),
  },
}))

// Import after mocking
import { GET } from '../conversations/by-date/[date]/route'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('/api/conversations/by-date/[date]', () => {
  describe('GET', () => {
    it('should return conversation for valid date', async () => {
      const mockConversation = {
        id: '2024-01-15',
        userId: 'default-user',
        messages: [
          { id: 'msg1', role: 'user', content: 'Hello', timestamp: new Date() },
          { id: 'msg2', role: 'assistant', content: 'Hi there!', timestamp: new Date() },
        ],
        createdAt: new Date('2024-01-15T10:00:00.000Z'),
        updatedAt: new Date('2024-01-15T10:30:00.000Z'),
      }
      mockStorage.getConversationByDate.mockResolvedValue(mockConversation)

      const request = new NextRequest('http://localhost:3000/api/conversations/by-date/2024-01-15')
      const response = await GET(request, { params: { date: '2024-01-15' } })
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(data).toEqual({ 
        conversation: {
          ...mockConversation,
          createdAt: mockConversation.createdAt.toISOString(),
          updatedAt: mockConversation.updatedAt.toISOString(),
          messages: mockConversation.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString(),
          }))
        }
      })
      expect(mockStorage.getConversationByDate).toHaveBeenCalledWith('default-user', new Date('2024-01-15T00:00:00.000Z'))
    })

    it('should return conversation for specific user', async () => {
      const mockConversation = {
        id: '2024-01-15',
        userId: 'test-user',
        messages: [],
        createdAt: new Date('2024-01-15T10:00:00.000Z'),
        updatedAt: new Date('2024-01-15T10:00:00.000Z'),
      }
      mockStorage.getConversationByDate.mockResolvedValue(mockConversation)

      const request = new NextRequest('http://localhost:3000/api/conversations/by-date/2024-01-15?userId=test-user')
      const response = await GET(request, { params: { date: '2024-01-15' } })
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(data).toEqual({ 
        conversation: {
          ...mockConversation,
          createdAt: mockConversation.createdAt.toISOString(),
          updatedAt: mockConversation.updatedAt.toISOString(),
          messages: mockConversation.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString(),
          }))
        }
      })
      expect(mockStorage.getConversationByDate).toHaveBeenCalledWith('test-user', new Date('2024-01-15T00:00:00.000Z'))
    })

    it('should return 404 when conversation not found', async () => {
      mockStorage.getConversationByDate.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/conversations/by-date/2024-01-15')
      const response = await GET(request, { params: { date: '2024-01-15' } })
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND)
      expect(data.error).toBe('No conversation found for this date')
    })

    it('should validate date format - invalid format', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/by-date/invalid-date')
      const response = await GET(request, { params: { date: 'invalid-date' } })
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      expect(data.error).toBe('Invalid date format. Use YYYY-MM-DD.')
      expect(mockStorage.getConversationByDate).not.toHaveBeenCalled()
    })

    it('should validate date format - partial date', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/by-date/2024-01')
      const response = await GET(request, { params: { date: '2024-01' } })
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      expect(data.error).toBe('Invalid date format. Use YYYY-MM-DD.')
    })

    it('should validate date format - too many digits', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/by-date/2024-01-154')
      const response = await GET(request, { params: { date: '2024-01-154' } })
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      expect(data.error).toBe('Invalid date format. Use YYYY-MM-DD.')
    })

    it('should handle storage errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      mockStorage.getConversationByDate.mockRejectedValue(new Error('Storage error'))

      const request = new NextRequest('http://localhost:3000/api/conversations/by-date/2024-01-15')
      const response = await GET(request, { params: { date: '2024-01-15' } })
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      expect(data.error).toBe('Internal server error')
      expect(consoleErrorSpy).toHaveBeenCalled()
      
      consoleErrorSpy.mockRestore()
    })
  })
})