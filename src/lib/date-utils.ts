/**
 * Unified date formatting utilities for consistent date display across the application
 */

/**
 * Formats a date string or Date object to "Month Day, Year" format
 * Example: "October 15, 2025"
 */
export function formatDate(value?: string | Date | null): string {
  if (!value) return 'Not specified'

  const date = typeof value === 'string' ? new Date(value) : value

  if (isNaN(date.getTime())) return 'Not specified'

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formats a date for form inputs (YYYY-MM-DD format)
 * Uses local timezone to avoid off-by-one errors
 */
export function formatDateForInput(value?: string | Date | null): string {
  if (!value) return ''

  const date = typeof value === 'string' ? new Date(value) : value

  if (isNaN(date.getTime())) return ''

  // Use local timezone to avoid off-by-one errors
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Parses a date string and returns a Date object or undefined
 */
export function parseDate(value?: string | null): Date | undefined {
  if (!value) return undefined

  const date = new Date(value)
  return isNaN(date.getTime()) ? undefined : date
}

/**
 * Checks if a date is in the past
 */
export function isPastDate(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate < today
}

/**
 * Checks if a date is in the future
 */
export function isFutureDate(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate > today
}
