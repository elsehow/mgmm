import {
  formatDateForStorage,
  formatRelativeDate,
  parseStorageDate,
  addDays,
  subtractDays,
  isSameDay,
  isToday,
  getToday,
  validateDateNavigation,
  canNavigate,
} from '../dateUtils'

describe('Date Utilities', () => {
  describe('formatDateForStorage', () => {
    it('should format date to YYYY-MM-DD string', () => {
      const date = new Date('2024-01-15T10:30:00.000Z')
      const result = formatDateForStorage(date)
      expect(result).toBe('2024-01-15')
    })

    it('should handle single digit months and days', () => {
      const date = new Date('2024-03-05T10:30:00.000Z')
      const result = formatDateForStorage(date)
      expect(result).toBe('2024-03-05')
    })

    it('should handle leap year', () => {
      const date = new Date('2024-02-29T10:30:00.000Z')
      const result = formatDateForStorage(date)
      expect(result).toBe('2024-02-29')
    })

    it('should ignore time component', () => {
      const date1 = new Date('2024-01-15T00:00:00.000Z')
      const date2 = new Date('2024-01-15T23:59:59.999Z')
      expect(formatDateForStorage(date1)).toBe('2024-01-15')
      expect(formatDateForStorage(date2)).toBe('2024-01-15')
    })
  })

  describe('formatRelativeDate', () => {
    it('should return "Today" for current date', () => {
      const now = new Date()
      const result = formatRelativeDate(now)
      expect(result).toBe('Today')
    })

    it('should return "Today" for same day different time', () => {
      const today = new Date()
      today.setHours(6, 0, 0, 0) // 6 AM today
      const result = formatRelativeDate(today)
      expect(result).toBe('Today')
    })

    it('should return "Yesterday" for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const result = formatRelativeDate(yesterday)
      expect(result).toBe('Yesterday')
    })

    it('should return "X days ago" for dates within a week', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      const result = formatRelativeDate(threeDaysAgo)
      expect(result).toBe('3 days ago')
    })

    it('should return "1 week ago" for exactly one week ago', () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const result = formatRelativeDate(oneWeekAgo)
      expect(result).toBe('1 week ago')
    })

    it('should return relative time for dates older than 7 days', () => {
      const oldDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      const result = formatRelativeDate(oldDate)
      expect(result).toBe('2 weeks ago')
    })

    it('should return relative time for future dates', () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      const result = formatRelativeDate(futureDate)
      expect(result).toBe('in 5 days')
    })

    it('should return relative time for exactly 7 days ago', () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const result = formatRelativeDate(sevenDaysAgo)
      expect(result).toBe('1 week ago')
    })

    it('should return relative time for 8 days ago', () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      const result = formatRelativeDate(eightDaysAgo)
      expect(result).toBe('1 week ago')
    })
  })

  describe('parseStorageDate', () => {
    it('should parse YYYY-MM-DD string to Date object', () => {
      const result = parseStorageDate('2024-01-15')
      expect(result).toEqual(new Date('2024-01-15T00:00:00.000Z'))
    })

    it('should handle single digit months and days', () => {
      const result = parseStorageDate('2024-03-05')
      expect(result).toEqual(new Date('2024-03-05T00:00:00.000Z'))
    })

    it('should handle leap year', () => {
      const result = parseStorageDate('2024-02-29')
      expect(result).toEqual(new Date('2024-02-29T00:00:00.000Z'))
    })

    it('should create date with zero time', () => {
      const result = parseStorageDate('2024-01-15')
      expect(result.getUTCHours()).toBe(0)
      expect(result.getUTCMinutes()).toBe(0)
      expect(result.getUTCSeconds()).toBe(0)
      expect(result.getUTCMilliseconds()).toBe(0)
    })
  })

  describe('addDays', () => {
    it('should add days to a date', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = addDays(date, 5)
      expect(result).toEqual(new Date('2024-01-20T12:00:00.000Z'))
    })

    it('should handle adding zero days', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = addDays(date, 0)
      expect(result).toEqual(date)
    })

    it('should handle negative days (subtraction)', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = addDays(date, -3)
      expect(result).toEqual(new Date('2024-01-12T12:00:00.000Z'))
    })

    it('should handle month boundaries', () => {
      const date = new Date('2024-01-30T12:00:00.000Z')
      const result = addDays(date, 5)
      expect(result).toEqual(new Date('2024-02-04T12:00:00.000Z'))
    })

    it('should handle year boundaries', () => {
      const date = new Date('2023-12-30T12:00:00.000Z')
      const result = addDays(date, 5)
      expect(result).toEqual(new Date('2024-01-04T12:00:00.000Z'))
    })

    it('should not mutate original date', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const originalTime = date.getTime()
      addDays(date, 5)
      expect(date.getTime()).toBe(originalTime)
    })
  })

  describe('subtractDays', () => {
    it('should subtract days from a date', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = subtractDays(date, 5)
      expect(result).toEqual(new Date('2024-01-10T12:00:00.000Z'))
    })

    it('should handle subtracting zero days', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = subtractDays(date, 0)
      expect(result).toEqual(date)
    })

    it('should handle negative days (addition)', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = subtractDays(date, -3)
      expect(result).toEqual(new Date('2024-01-18T12:00:00.000Z'))
    })

    it('should handle month boundaries', () => {
      const date = new Date('2024-02-03T12:00:00.000Z')
      const result = subtractDays(date, 5)
      expect(result).toEqual(new Date('2024-01-29T12:00:00.000Z'))
    })

    it('should handle year boundaries', () => {
      const date = new Date('2024-01-03T12:00:00.000Z')
      const result = subtractDays(date, 5)
      expect(result).toEqual(new Date('2023-12-29T12:00:00.000Z'))
    })

    it('should not mutate original date', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const originalTime = date.getTime()
      subtractDays(date, 5)
      expect(date.getTime()).toBe(originalTime)
    })
  })

  describe('isSameDay', () => {
    it('should return true for same date and time', () => {
      const date1 = new Date('2024-01-15T12:00:00.000Z')
      const date2 = new Date('2024-01-15T12:00:00.000Z')
      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('should return true for same date different time', () => {
      const date1 = new Date('2024-01-15T10:00:00.000Z')
      const date2 = new Date('2024-01-15T18:00:00.000Z')
      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('should return false for different dates', () => {
      const date1 = new Date('2024-01-15T12:00:00.000Z')
      const date2 = new Date('2024-01-16T12:00:00.000Z')
      expect(isSameDay(date1, date2)).toBe(false)
    })

    it('should return false for different months', () => {
      const date1 = new Date('2024-01-15T12:00:00.000Z')
      const date2 = new Date('2024-02-15T12:00:00.000Z')
      expect(isSameDay(date1, date2)).toBe(false)
    })

    it('should return false for different years', () => {
      const date1 = new Date('2024-01-15T12:00:00.000Z')
      const date2 = new Date('2023-01-15T12:00:00.000Z')
      expect(isSameDay(date1, date2)).toBe(false)
    })
  })

  describe('isToday', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15T12:00:00.000Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return true for today', () => {
      const today = new Date('2024-01-15T12:00:00.000Z')
      expect(isToday(today)).toBe(true)
    })

    it('should return true for today with different time', () => {
      const today = new Date('2024-01-15T18:00:00.000Z')
      expect(isToday(today)).toBe(true)
    })

    it('should return false for yesterday', () => {
      const yesterday = new Date('2024-01-14T12:00:00.000Z')
      expect(isToday(yesterday)).toBe(false)
    })

    it('should return false for tomorrow', () => {
      const tomorrow = new Date('2024-01-16T12:00:00.000Z')
      expect(isToday(tomorrow)).toBe(false)
    })
  })

  describe('getToday', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15T12:30:45.123Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return today with zero time', () => {
      const result = getToday()
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0) // January is 0
      expect(result.getDate()).toBe(15)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })
  })

  describe('validateDateNavigation', () => {
    const availableDates = ['2024-01-10', '2024-01-12', '2024-01-15', '2024-01-18', '2024-01-20']

    it('should return previous date when navigating prev', () => {
      const currentDate = new Date('2024-01-15T12:00:00.000Z')
      const result = validateDateNavigation(currentDate, availableDates, 'prev')
      expect(result).toEqual(new Date('2024-01-12T00:00:00.000Z'))
    })

    it('should return next date when navigating next', () => {
      const currentDate = new Date('2024-01-15T12:00:00.000Z')
      const result = validateDateNavigation(currentDate, availableDates, 'next')
      expect(result).toEqual(new Date('2024-01-18T00:00:00.000Z'))
    })

    it('should return null when no previous date exists', () => {
      const currentDate = new Date('2024-01-10T12:00:00.000Z')
      const result = validateDateNavigation(currentDate, availableDates, 'prev')
      expect(result).toBeNull()
    })

    it('should return null when no next date exists', () => {
      const currentDate = new Date('2024-01-20T12:00:00.000Z')
      const result = validateDateNavigation(currentDate, availableDates, 'next')
      expect(result).toBeNull()
    })

    it('should handle current date not in available dates', () => {
      const currentDate = new Date('2024-01-14T12:00:00.000Z')
      const prevResult = validateDateNavigation(currentDate, availableDates, 'prev')
      const nextResult = validateDateNavigation(currentDate, availableDates, 'next')
      
      expect(prevResult).toEqual(new Date('2024-01-12T00:00:00.000Z'))
      expect(nextResult).toEqual(new Date('2024-01-15T00:00:00.000Z'))
    })

    it('should handle empty available dates', () => {
      const currentDate = new Date('2024-01-15T12:00:00.000Z')
      const prevResult = validateDateNavigation(currentDate, [], 'prev')
      const nextResult = validateDateNavigation(currentDate, [], 'next')
      
      expect(prevResult).toBeNull()
      expect(nextResult).toBeNull()
    })

    it('should handle single available date', () => {
      const singleDate = ['2024-01-15']
      const currentDate = new Date('2024-01-15T12:00:00.000Z')
      
      const prevResult = validateDateNavigation(currentDate, singleDate, 'prev')
      const nextResult = validateDateNavigation(currentDate, singleDate, 'next')
      
      expect(prevResult).toBeNull()
      expect(nextResult).toBeNull()
    })

    it('should handle unsorted available dates', () => {
      const unsortedDates = ['2024-01-20', '2024-01-10', '2024-01-15', '2024-01-12']
      const currentDate = new Date('2024-01-15T12:00:00.000Z')
      
      const prevResult = validateDateNavigation(currentDate, unsortedDates, 'prev')
      const nextResult = validateDateNavigation(currentDate, unsortedDates, 'next')
      
      expect(prevResult).toEqual(new Date('2024-01-12T00:00:00.000Z'))
      expect(nextResult).toEqual(new Date('2024-01-20T00:00:00.000Z'))
    })
  })

  describe('canNavigate', () => {
    const availableDates = ['2024-01-10', '2024-01-12', '2024-01-15', '2024-01-18', '2024-01-20']

    it('should return true when previous navigation is possible', () => {
      const currentDate = new Date('2024-01-15T12:00:00.000Z')
      const result = canNavigate(currentDate, availableDates, 'prev')
      expect(result).toBe(true)
    })

    it('should return true when next navigation is possible', () => {
      const currentDate = new Date('2024-01-15T12:00:00.000Z')
      const result = canNavigate(currentDate, availableDates, 'next')
      expect(result).toBe(true)
    })

    it('should return false when previous navigation is not possible', () => {
      const currentDate = new Date('2024-01-10T12:00:00.000Z')
      const result = canNavigate(currentDate, availableDates, 'prev')
      expect(result).toBe(false)
    })

    it('should return false when next navigation is not possible', () => {
      const currentDate = new Date('2024-01-20T12:00:00.000Z')
      const result = canNavigate(currentDate, availableDates, 'next')
      expect(result).toBe(false)
    })

    it('should return false for empty available dates', () => {
      const currentDate = new Date('2024-01-15T12:00:00.000Z')
      const prevResult = canNavigate(currentDate, [], 'prev')
      const nextResult = canNavigate(currentDate, [], 'next')
      
      expect(prevResult).toBe(false)
      expect(nextResult).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle leap year in formatDateForStorage', () => {
      const leapYearDate = new Date('2024-02-29T12:00:00.000Z')
      const result = formatDateForStorage(leapYearDate)
      expect(result).toBe('2024-02-29')
    })

    it('should handle DST transitions', () => {
      // Spring forward (DST starts)
      const springForward = new Date('2024-03-10T07:00:00.000Z') // 2AM becomes 3AM
      const springResult = formatDateForStorage(springForward)
      expect(springResult).toBe('2024-03-10')
      
      // Fall back (DST ends)
      const fallBack = new Date('2024-11-03T06:00:00.000Z') // 2AM becomes 1AM
      const fallResult = formatDateForStorage(fallBack)
      expect(fallResult).toBe('2024-11-03')
    })

    it('should handle timezone differences in parseStorageDate', () => {
      const result = parseStorageDate('2024-01-15')
      // Should always return UTC midnight regardless of local timezone
      expect(result.getUTCFullYear()).toBe(2024)
      expect(result.getUTCMonth()).toBe(0)
      expect(result.getUTCDate()).toBe(15)
      expect(result.getUTCHours()).toBe(0)
    })

    it('should handle invalid date strings in parseStorageDate', () => {
      const result = parseStorageDate('invalid-date')
      expect(result.toString()).toBe('Invalid Date')
    })
  })
})