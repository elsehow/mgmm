import { NextRequest } from 'next/server'
import { HTTP_STATUS } from '@/app/config/constants'

// Mock the storage module
const mockStorage = {
  getAvailableDates: jest.fn(),
}

jest.mock('@/app/lib/storage', () => ({
  ConversationStorage: {
    getInstance: jest.fn(() => mockStorage),
  },
}))

// Import after mocking
import { GET } from '../conversations/dates/route'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('/api/conversations/dates', () => {
  describe('GET', () => {
    it('should return available dates', async () => {
      const mockDates = ['2024-01-15', '2024-01-14', '2024-01-13']
      mockStorage.getAvailableDates.mockResolvedValue(mockDates)

      const request = new NextRequest('http://localhost:3000/api/conversations/dates')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(data).toEqual({ dates: mockDates })
      expect(mockStorage.getAvailableDates).toHaveBeenCalled()
    })

    it('should return empty array when no dates available', async () => {
      mockStorage.getAvailableDates.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/conversations/dates')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.OK)
      expect(data).toEqual({ dates: [] })
    })

    it('should handle storage errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      mockStorage.getAvailableDates.mockRejectedValue(new Error('Storage error'))

      const request = new NextRequest('http://localhost:3000/api/conversations/dates')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      expect(data.error).toBe('Internal server error')
      expect(consoleErrorSpy).toHaveBeenCalled()
      
      consoleErrorSpy.mockRestore()
    })
  })
})