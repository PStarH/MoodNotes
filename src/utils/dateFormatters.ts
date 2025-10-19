/**
 * Shared date formatting utilities
 * Used across the application for consistent date handling
 */

/**
 * Formats a Date object or ISO string into YYYY-MM-DD format
 * @param date - Date object or ISO date string
 * @returns Formatted date string in YYYY-MM-DD format
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formats a date string for display purposes
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export const formatDateDisplay = (dateString?: string): string => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Formats a date string into a long format
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "Monday, January 15, 2024")
 */
export const formatDateLong = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Gets the day of the week for a given date string
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Day of week (e.g., "Monday")
 */
export const getDayOfWeek = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' })
}

/**
 * Calculates the number of days between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between the dates
 */
export const daysBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Gets today's date in YYYY-MM-DD format
 * @returns Today's date string
 */
export const getToday = (): string => {
  return formatDate(new Date())
}

/**
 * Gets yesterday's date in YYYY-MM-DD format
 * @returns Yesterday's date string
 */
export const getYesterday = (): string => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return formatDate(yesterday)
}

/**
 * Checks if a date string is today
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns True if the date is today
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getToday()
}

/**
 * Checks if a date string is yesterday
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns True if the date is yesterday
 */
export const isYesterday = (dateString: string): boolean => {
  return dateString === getYesterday()
}

/**
 * Formats a date into relative time (e.g., "Today", "Yesterday", "2 days ago")
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  const entryDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  entryDate.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - entryDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? 's' : ''} ago`
  }
  const years = Math.floor(diffDays / 365)
  return `${years} year${years > 1 ? 's' : ''} ago`
}
