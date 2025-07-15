/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { CONSOLE_MESSAGES } from '@/app/config/constants'

// Mock ChatService
const mockChatService = {
  getConversationByDate: jest.fn(),
  sendMessage: jest.fn(),
}

jest.mock('@/app/services/chatService', () => ({
  ChatService: jest.fn().mockImplementation(() => mockChatService),
}))

// Import after mocking
import { useChat } from '../useChat'

// Mock the dependent hooks
const mockOptimisticMessages = {
  optimisticMessages: [],
  addOptimisticMessage: jest.fn(),
  markMessageSent: jest.fn(),
  markMessageError: jest.fn(),
  markMessageRetrying: jest.fn(),
  clearOptimisticMessages: jest.fn(),
}

const mockStreamingResponse = {
  isStreaming: false,
  streamingMessage: '',
  startStreaming: jest.fn(),
  appendToStream: jest.fn(),
  stopStreaming: jest.fn(),
  resetStream: jest.fn(),
}

const mockDateNavigation = {
  currentDate: new Date('2024-01-15'),
  currentDateString: '2024-01-15',
  availableDates: ['2024-01-15', '2024-01-14'],
  canNavigateNext: false,
  canNavigatePrev: true,
  navigateNext: jest.fn(),
  navigatePrev: jest.fn(),
  goToToday: jest.fn(),
  refreshAvailableDates: jest.fn(),
}

jest.mock('../useOptimisticMessages', () => ({
  useOptimisticMessages: jest.fn(() => mockOptimisticMessages),
}))

jest.mock('../useStreamingResponse', () => ({
  useStreamingResponse: jest.fn(() => mockStreamingResponse),
}))

jest.mock('../useDateNavigation', () => ({
  useDateNavigation: jest.fn(() => mockDateNavigation),
}))

// Mock console.error
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

beforeEach(() => {
  jest.clearAllMocks()
  consoleErrorSpy.mockClear()
  
  // Reset mock responses
  mockStreamingResponse.isStreaming = false
  mockOptimisticMessages.optimisticMessages = []
})

afterAll(() => {
  consoleErrorSpy.mockRestore()
})

describe('useChat', () => {
  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useChat())

      expect(result.current.message).toBe('')
      expect(result.current.currentConversation).toBe(null)
      expect(result.current.allMessages).toEqual([])
      expect(result.current.isStreaming).toBe(false)
      expect(result.current.streamingMessage).toBe('')
    })

    it('should include date navigation properties', () => {
      const { result } = renderHook(() => useChat())

      expect(result.current.currentDate).toEqual(new Date('2024-01-15'))
      expect(result.current.currentDateString).toBe('2024-01-15')
      expect(result.current.availableDates).toEqual(['2024-01-15', '2024-01-14'])
      expect(result.current.canNavigateNext).toBe(false)
      expect(result.current.canNavigatePrev).toBe(true)
    })
  })

  describe('conversation loading', () => {
    it('should load conversation when date changes', async () => {
      const mockConversation = {
        id: '2024-01-15',
        userId: 'default-user',
        messages: [
          { id: 'msg1', role: 'user', content: 'Hello', timestamp: new Date() },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockChatService.getConversationByDate.mockResolvedValue(mockConversation)

      const { result } = renderHook(() => useChat())

      // Wait for the effect to complete
      await act(async () => {
        // The useEffect should have triggered
      })

      expect(mockChatService.getConversationByDate).toHaveBeenCalledWith('2024-01-15')
      expect(mockOptimisticMessages.clearOptimisticMessages).toHaveBeenCalled()
    })

    it('should handle null conversation response', async () => {
      mockChatService.getConversationByDate.mockResolvedValue(null)

      const { result } = renderHook(() => useChat())

      await act(async () => {
        // The useEffect should have triggered
      })

      expect(mockChatService.getConversationByDate).toHaveBeenCalledWith('2024-01-15')
      expect(result.current.currentConversation).toBe(null)
    })
  })

  describe('allMessages computation', () => {
    it('should combine conversation messages with optimistic messages', async () => {
      const mockConversation = {
        id: '2024-01-15',
        userId: 'default-user',
        messages: [
          { id: 'msg1', role: 'user', content: 'Hello', timestamp: new Date() },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockOptimistic = [
        { id: 'opt1', role: 'user', content: 'New message', timestamp: new Date() },
      ]

      mockChatService.getConversationByDate.mockResolvedValue(mockConversation)
      mockOptimisticMessages.optimisticMessages = mockOptimistic

      const { result } = renderHook(() => useChat())

      // Wait for conversation to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const expected = [...mockConversation.messages, ...mockOptimistic]
      expect(result.current.allMessages).toEqual(expected)
    })

    it('should handle empty conversation', async () => {
      mockChatService.getConversationByDate.mockResolvedValue(null)
      mockOptimisticMessages.optimisticMessages = []

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.allMessages).toEqual([])
    })
  })

  describe('sendMessage', () => {
    it('should not send empty message', async () => {
      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('')
      })

      expect(mockOptimisticMessages.addOptimisticMessage).not.toHaveBeenCalled()
      expect(mockChatService.sendMessage).not.toHaveBeenCalled()
    })

    it('should not send message when streaming', async () => {
      mockStreamingResponse.isStreaming = true

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('Hello')
      })

      expect(mockOptimisticMessages.addOptimisticMessage).not.toHaveBeenCalled()
      expect(mockChatService.sendMessage).not.toHaveBeenCalled()
    })

    it('should send message successfully', async () => {
      const mockPendingMessage = { id: 'pending-1', role: 'user', content: 'Hello', timestamp: new Date() }
      const mockConversation = {
        id: '2024-01-15',
        userId: 'default-user',
        messages: [mockPendingMessage],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockOptimisticMessages.addOptimisticMessage.mockReturnValue(mockPendingMessage)
      mockChatService.getConversationByDate.mockResolvedValue(mockConversation)

      // Mock successful streaming
      mockChatService.sendMessage.mockImplementation(async (request, callbacks) => {
        await callbacks.onConversationId('2024-01-15')
        await callbacks.onContentDelta('Hi there!')
        await callbacks.onDone()
      })

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('Hello')
      })

      expect(mockOptimisticMessages.addOptimisticMessage).toHaveBeenCalledWith('Hello')
      expect(mockStreamingResponse.resetStream).toHaveBeenCalled()
      expect(mockStreamingResponse.startStreaming).toHaveBeenCalled()
      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        { message: 'Hello', date: '2024-01-15' },
        expect.objectContaining({
          onConversationId: expect.any(Function),
          onContentDelta: expect.any(Function),
          onDone: expect.any(Function),
          onError: expect.any(Function),
        })
      )
    })

    it('should handle streaming callbacks correctly', async () => {
      const mockPendingMessage = { id: 'pending-1', role: 'user', content: 'Hello', timestamp: new Date() }
      const mockConversation = {
        id: '2024-01-15',
        userId: 'default-user',
        messages: [mockPendingMessage],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockOptimisticMessages.addOptimisticMessage.mockReturnValue(mockPendingMessage)
      mockChatService.getConversationByDate.mockResolvedValue(mockConversation)

      let capturedCallbacks: any = null

      mockChatService.sendMessage.mockImplementation(async (request, callbacks) => {
        capturedCallbacks = callbacks
        await callbacks.onConversationId('2024-01-15')
        await callbacks.onContentDelta('Hi')
        await callbacks.onContentDelta(' there!')
        await callbacks.onDone()
      })

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('Hello')
      })

      expect(mockOptimisticMessages.markMessageSent).toHaveBeenCalledWith('pending-1')
      expect(mockStreamingResponse.appendToStream).toHaveBeenCalledWith('Hi')
      expect(mockStreamingResponse.appendToStream).toHaveBeenCalledWith(' there!')
      expect(mockStreamingResponse.stopStreaming).toHaveBeenCalled()
      expect(mockOptimisticMessages.clearOptimisticMessages).toHaveBeenCalled()
      expect(mockDateNavigation.refreshAvailableDates).toHaveBeenCalled()
    })

    it('should handle streaming error', async () => {
      const mockPendingMessage = { id: 'pending-1', role: 'user', content: 'Hello', timestamp: new Date() }
      const mockError = new Error('Stream error')

      mockOptimisticMessages.addOptimisticMessage.mockReturnValue(mockPendingMessage)

      mockChatService.sendMessage.mockImplementation(async (request, callbacks) => {
        await callbacks.onError(mockError)
      })

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('Hello')
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(CONSOLE_MESSAGES.ERRORS.CHAT_ERROR, mockError)
      expect(mockStreamingResponse.stopStreaming).toHaveBeenCalled()
      expect(mockOptimisticMessages.markMessageError).toHaveBeenCalledWith('pending-1')
    })

    it('should handle sendMessage exception', async () => {
      const mockPendingMessage = { id: 'pending-1', role: 'user', content: 'Hello', timestamp: new Date() }
      const mockError = new Error('Send error')

      mockOptimisticMessages.addOptimisticMessage.mockReturnValue(mockPendingMessage)
      mockChatService.sendMessage.mockRejectedValue(mockError)

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('Hello')
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(CONSOLE_MESSAGES.ERRORS.SEND_MESSAGE_ERROR, mockError)
      expect(mockStreamingResponse.stopStreaming).toHaveBeenCalled()
      expect(mockOptimisticMessages.markMessageError).toHaveBeenCalledWith('pending-1')
    })

    it('should clear message input after sending', async () => {
      const mockPendingMessage = { id: 'pending-1', role: 'user', content: 'Hello', timestamp: new Date() }
      mockOptimisticMessages.addOptimisticMessage.mockReturnValue(mockPendingMessage)

      const { result } = renderHook(() => useChat())

      // Set message first
      act(() => {
        result.current.setMessage('Hello')
      })

      expect(result.current.message).toBe('Hello')

      await act(async () => {
        await result.current.sendMessage('Hello')
      })

      expect(result.current.message).toBe('')
    })
  })

  describe('retryMessage', () => {
    const mockFailedMessage = {
      id: 'failed-1',
      role: 'user' as const,
      content: 'Failed message',
      timestamp: new Date(),
    }

    it('should not retry when streaming', async () => {
      mockStreamingResponse.isStreaming = true

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.retryMessage(mockFailedMessage)
      })

      expect(mockOptimisticMessages.markMessageRetrying).not.toHaveBeenCalled()
      expect(mockChatService.sendMessage).not.toHaveBeenCalled()
    })

    it('should retry message successfully', async () => {
      const mockConversation = {
        id: '2024-01-15',
        userId: 'default-user',
        messages: [mockFailedMessage],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockChatService.getConversationByDate.mockResolvedValue(mockConversation)

      mockChatService.sendMessage.mockImplementation(async (request, callbacks) => {
        await callbacks.onConversationId('2024-01-15')
        await callbacks.onContentDelta('Retry response')
        await callbacks.onDone()
      })

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.retryMessage(mockFailedMessage)
      })

      expect(mockOptimisticMessages.markMessageRetrying).toHaveBeenCalledWith('failed-1')
      expect(mockStreamingResponse.startStreaming).toHaveBeenCalled()
      expect(mockStreamingResponse.resetStream).toHaveBeenCalled()
      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        { message: 'Failed message', date: '2024-01-15' },
        expect.objectContaining({
          onConversationId: expect.any(Function),
          onContentDelta: expect.any(Function),
          onDone: expect.any(Function),
          onError: expect.any(Function),
        })
      )
    })

    it('should handle retry streaming error', async () => {
      const mockError = new Error('Retry stream error')

      mockChatService.sendMessage.mockImplementation(async (request, callbacks) => {
        await callbacks.onError(mockError)
      })

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.retryMessage(mockFailedMessage)
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(CONSOLE_MESSAGES.ERRORS.RETRY_ERROR, mockError)
      expect(mockStreamingResponse.stopStreaming).toHaveBeenCalled()
      expect(mockOptimisticMessages.markMessageError).toHaveBeenCalledWith('failed-1')
    })

    it('should handle retry exception', async () => {
      const mockError = new Error('Retry exception')

      mockChatService.sendMessage.mockRejectedValue(mockError)

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.retryMessage(mockFailedMessage)
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(CONSOLE_MESSAGES.ERRORS.RETRY_MESSAGE_ERROR, mockError)
      expect(mockStreamingResponse.stopStreaming).toHaveBeenCalled()
      expect(mockOptimisticMessages.markMessageError).toHaveBeenCalledWith('failed-1')
    })
  })

  describe('message input management', () => {
    it('should update message state', () => {
      const { result } = renderHook(() => useChat())

      act(() => {
        result.current.setMessage('Test message')
      })

      expect(result.current.message).toBe('Test message')
    })

    it('should clear message after successful send', async () => {
      const mockPendingMessage = { id: 'pending-1', role: 'user', content: 'Hello', timestamp: new Date() }
      mockOptimisticMessages.addOptimisticMessage.mockReturnValue(mockPendingMessage)

      const { result } = renderHook(() => useChat())

      act(() => {
        result.current.setMessage('Hello')
      })

      await act(async () => {
        await result.current.sendMessage('Hello')
      })

      expect(result.current.message).toBe('')
    })
  })

  describe('date navigation integration', () => {
    it('should expose date navigation methods', () => {
      const { result } = renderHook(() => useChat())

      expect(result.current.navigateNext).toBe(mockDateNavigation.navigateNext)
      expect(result.current.navigatePrev).toBe(mockDateNavigation.navigatePrev)
      expect(result.current.goToToday).toBe(mockDateNavigation.goToToday)
      expect(result.current.refreshAvailableDates).toBe(mockDateNavigation.refreshAvailableDates)
    })

    it('should refresh available dates after successful message send', async () => {
      const mockPendingMessage = { id: 'pending-1', role: 'user', content: 'Hello', timestamp: new Date() }
      const mockConversation = {
        id: '2024-01-15',
        userId: 'default-user',
        messages: [mockPendingMessage],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockOptimisticMessages.addOptimisticMessage.mockReturnValue(mockPendingMessage)
      mockChatService.getConversationByDate.mockResolvedValue(mockConversation)

      mockChatService.sendMessage.mockImplementation(async (request, callbacks) => {
        await callbacks.onConversationId('2024-01-15')
        await callbacks.onDone()
      })

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage('Hello')
      })

      expect(mockDateNavigation.refreshAvailableDates).toHaveBeenCalled()
    })
  })
})