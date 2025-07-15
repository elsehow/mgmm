export function formatDateForStorage(date: Date): string {
  return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

import { format } from 'timeago.js'

export function formatRelativeDate(date: Date): string {
  const today = new Date()
  const targetDate = new Date(date)
  
  // Normalize dates to compare only date parts (not time)
  const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  
  const normalizedToday = normalizeDate(today)
  const normalizedTarget = normalizeDate(targetDate)
  
  // Check if it's today
  if (normalizedTarget.getTime() === normalizedToday.getTime()) {
    return 'Today'
  }
  
  // Check if it's yesterday
  const yesterday = new Date(normalizedToday)
  yesterday.setDate(yesterday.getDate() - 1)
  if (normalizedTarget.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  }
  
  // For everything else, use timeago.js
  return format(date)
}

export function parseStorageDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00.000Z')
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function getToday(): Date {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

export function validateDateNavigation(currentDate: Date, availableDates: string[], direction: 'prev' | 'next'): Date | null {
  const currentDateStr = formatDateForStorage(currentDate)
  const sortedDates = availableDates.sort()
  
  if (direction === 'prev') {
    // Find the previous date that has conversations
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      if (sortedDates[i] < currentDateStr) {
        return parseStorageDate(sortedDates[i])
      }
    }
  } else {
    // Find the next date that has conversations
    for (let i = 0; i < sortedDates.length; i++) {
      if (sortedDates[i] > currentDateStr) {
        return parseStorageDate(sortedDates[i])
      }
    }
  }
  
  return null
}

export function canNavigate(currentDate: Date, availableDates: string[], direction: 'prev' | 'next'): boolean {
  return validateDateNavigation(currentDate, availableDates, direction) !== null
}