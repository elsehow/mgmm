export function formatDateForStorage(date: Date): string {
  return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

export function formatRelativeDate(date: Date): string {
  return formatDateForStorage(date)
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
  const currentIndex = sortedDates.indexOf(currentDateStr)
  
  if (direction === 'prev') {
    // Get the previous chat (earlier in the sorted list)
    if (currentIndex > 0) {
      return parseStorageDate(sortedDates[currentIndex - 1])
    } else if (currentIndex === -1 && sortedDates.length > 0) {
      // Current date not in list, find closest previous date
      for (let i = sortedDates.length - 1; i >= 0; i--) {
        if (sortedDates[i] < currentDateStr) {
          return parseStorageDate(sortedDates[i])
        }
      }
    }
  } else {
    // Get the next chat (later in the sorted list)
    if (currentIndex >= 0 && currentIndex < sortedDates.length - 1) {
      return parseStorageDate(sortedDates[currentIndex + 1])
    } else if (currentIndex === -1 && sortedDates.length > 0) {
      // Current date not in list, find closest next date
      for (let i = 0; i < sortedDates.length; i++) {
        if (sortedDates[i] > currentDateStr) {
          return parseStorageDate(sortedDates[i])
        }
      }
    }
  }
  
  return null
}

export function canNavigate(currentDate: Date, availableDates: string[], direction: 'prev' | 'next'): boolean {
  return validateDateNavigation(currentDate, availableDates, direction) !== null
}