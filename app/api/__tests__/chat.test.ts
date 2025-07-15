import { NextRequest } from 'next/server'
import { HTTP_STATUS } from '@/app/config/constants'

// Mock the storage module
const mockStorage = {
  getConversationByDate: jest.fn(),
  createConversationForDate: jest.fn(),
  addMessageToDateConversation: jest.fn(),
}

jest.mock('@/app/lib/storage', () => ({
  ConversationStorage: {
    getInstance: jest.fn(() => mockStorage),
  },
}))

// Mock the Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn(),
      },
    })),
  }
})

// Mock the conversation types
jest.mock('@/app/lib/types/conversation', () => ({
  messagesToAnthropicFormat: jest.fn((messages) => messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }))),
}))

// Import after mocking
import { POST } from '../chat/route'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('/api/chat', () => {
  describe('POST', () => {
    it('should require message parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      const response = await POST(request)

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      expect(await response.text()).toBe('Message is required')
    })

    it('should require non-empty message', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: '' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST)
      expect(await response.text()).toBe('Message is required')
    })

    it('should call storage methods correctly for new conversation', async () => {
      const mockConversation = {
        id: '2024-01-15',
        userId: 'default-user',
        messages: [
          { id: 'msg1', role: 'user', content: 'Hello', timestamp: new Date() },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockStorage.getConversationByDate.mockResolvedValueOnce(null) // First call returns null
      mockStorage.createConversationForDate.mockResolvedValue(mockConversation)
      mockStorage.addMessageToDateConversation.mockResolvedValue({})
      mockStorage.getConversationByDate.mockResolvedValueOnce(mockConversation) // Second call returns conversation

      // Mock the Anthropic stream to reject for this test (focus on storage logic)
      const Anthropic = require('@anthropic-ai/sdk').default
      const mockAnthropic = new Anthropic()
      mockAnthropic.messages.create.mockRejectedValue(new Error('Stream error'))

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      })
      const response = await POST(request)

      // This will be 500 due to the stream error, but we can verify the storage calls
      expect(mockStorage.getConversationByDate).toHaveBeenCalledWith('default-user', expect.any(Date))
      expect(mockStorage.createConversationForDate).toHaveBeenCalled()
      expect(mockStorage.addMessageToDateConversation).toHaveBeenCalledWith(
        'default-user',
        expect.any(Date),
        'user',
        'Hello'
      )
    })

    it('should use existing conversation if available', async () => {
      const mockConversation = {
        id: '2024-01-15',
        userId: 'default-user',
        messages: [
          { id: 'msg1', role: 'user', content: 'Previous message', timestamp: new Date() },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockStorage.getConversationByDate.mockResolvedValue(mockConversation)
      mockStorage.addMessageToDateConversation.mockResolvedValue({})

      // Mock the Anthropic stream
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'content_block_delta', delta: { text: 'Response' } }
        },
      }

      const Anthropic = require('@anthropic-ai/sdk').default
      const mockAnthropic = new Anthropic()
      mockAnthropic.messages.create.mockResolvedValue(mockStream)

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(mockStorage.createConversationForDate).not.toHaveBeenCalled()
      expect(mockStorage.addMessageToDateConversation).toHaveBeenCalledWith(
        'default-user',
        expect.any(Date),
        'user',
        'Hello'
      )
    })

    it('should handle custom date parameter', async () => {
      const customDate = '2024-01-10'
      const mockConversation = {
        id: '2024-01-10',
        userId: 'default-user',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockStorage.getConversationByDate.mockResolvedValue(mockConversation)
      mockStorage.addMessageToDateConversation.mockResolvedValue({})

      // Mock the Anthropic stream
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'content_block_delta', delta: { text: 'Response' } }
        },
      }

      const Anthropic = require('@anthropic-ai/sdk').default
      const mockAnthropic = new Anthropic()
      mockAnthropic.messages.create.mockResolvedValue(mockStream)

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello', date: customDate }),
      })
      const response = await POST(request)

      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(mockStorage.getConversationByDate).toHaveBeenCalledWith(
        'default-user',
        new Date('2024-01-10T00:00:00.000Z')
      )
    })

    it('should handle custom userId parameter', async () => {
      const customUserId = 'test-user'
      const mockConversation = {
        id: '2024-01-15',
        userId: customUserId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockStorage.getConversationByDate.mockResolvedValue(mockConversation)
      mockStorage.addMessageToDateConversation.mockResolvedValue({})

      // Mock the Anthropic stream
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'content_block_delta', delta: { text: 'Response' } }
        },
      }

      const Anthropic = require('@anthropic-ai/sdk').default
      const mockAnthropic = new Anthropic()
      mockAnthropic.messages.create.mockResolvedValue(mockStream)

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello', userId: customUserId }),
      })
      const response = await POST(request)

      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(mockStorage.getConversationByDate).toHaveBeenCalledWith(
        customUserId,
        expect.any(Date)
      )
    })

    it('should handle JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: 'invalid json',
      })
      const response = await POST(request)

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    })

    it('should handle storage errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      mockStorage.getConversationByDate.mockRejectedValue(new Error('Storage error'))

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
      expect(consoleErrorSpy).toHaveBeenCalled()
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle error when conversation cannot be retrieved after creation', async () => {
      mockStorage.getConversationByDate.mockResolvedValueOnce(null) // First call returns null
      mockStorage.createConversationForDate.mockResolvedValue({})
      mockStorage.addMessageToDateConversation.mockResolvedValue({})
      mockStorage.getConversationByDate.mockResolvedValueOnce(null) // Second call also returns null

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      })
      const response = await POST(request)

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      expect(await response.text()).toBe('Error retrieving conversation')
    })
  })
})