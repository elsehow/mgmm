import { useState, useEffect, useCallback } from 'react'
import { formatDateForStorage, validateDateNavigation, getToday } from '@/app/lib/dateUtils'
import { ChatService } from '@/app/services/chatService'

const chatService = new ChatService()

export function useDateNavigation(userId: string = 'default') {
  const [currentDate, setCurrentDate] = useState<Date>(getToday())
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchAvailableDates = useCallback(async () => {
    try {
      setIsLoading(true)
      const dates = await chatService.getAvailableDates(userId)
      setAvailableDates(dates)
    } catch (error) {
      console.error('Error fetching available dates:', error)
      setAvailableDates([])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const navigateToDate = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  const navigateDirection = useCallback((direction: 'prev' | 'next') => {
    const newDate = validateDateNavigation(currentDate, availableDates, direction)
    if (newDate) {
      setCurrentDate(newDate)
    }
  }, [currentDate, availableDates])

  const goToToday = useCallback(() => {
    setCurrentDate(getToday())
  }, [])

  const goToDate = useCallback((dateString: string) => {
    const date = new Date(dateString + 'T00:00:00.000Z')
    setCurrentDate(date)
  }, [])

  const refreshAvailableDates = useCallback(() => {
    fetchAvailableDates()
  }, [fetchAvailableDates])

  useEffect(() => {
    fetchAvailableDates()
  }, [fetchAvailableDates])

  return {
    currentDate,
    availableDates,
    isLoading,
    navigateToDate,
    navigateDirection,
    goToToday,
    goToDate,
    refreshAvailableDates,
    currentDateString: formatDateForStorage(currentDate),
  }
}