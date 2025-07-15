export function formatDateForStorage(date: Date): string {
  return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

export function formatRelativeDate(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  
  const targetDate = new Date(date)
  
  // Normalize dates to compare only date parts (not time)
  const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  
  const normalizedToday = normalizeDate(today)
  const normalizedYesterday = normalizeDate(yesterday)
  const normalizedTarget = normalizeDate(targetDate)
  
  if (normalizedTarget.getTime() === normalizedToday.getTime()) {
    return 'Today'
  } else if (normalizedTarget.getTime() === normalizedYesterday.getTime()) {
    return 'Yesterday'
  } else {
    const diffTime = normalizedToday.getTime() - normalizedTarget.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 0 && diffDays <= 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 0) {
      return targetDate.toLocaleDateString()
    } else {
      return targetDate.toLocaleDateString()
    }
  }
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