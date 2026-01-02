import type { CalendarEvent } from '@/components/calendar/calendar'
import type { User } from '@/payload-types'

/**
 * Calculate age from birthdate
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * Get birthday date for a specific year
 */
export function getBirthdayForYear(birthDate: Date, year: number): Date {
  const birth = new Date(birthDate)

  // Create birthday date for specified year
  const birthdayForYear = new Date(year, birth.getMonth(), birth.getDate(), 0, 0, 0, 0)

  return birthdayForYear
}

/**
 * Get birthday date for current year
 */
export function getBirthdayThisYear(birthDate: Date): Date {
  const today = new Date()
  return getBirthdayForYear(birthDate, today.getFullYear())
}

/**
 * Format birthday title for calendar display
 */
export function formatBirthdayTitle(fullName: string, age: number): string {
  return `🎂 ${fullName} (${age})`
}

/**
 * Transform users with birthdates to calendar events
 * Creates recurring birthday events for multiple years like Google Calendar
 */
export function transformBirthdaysToEvents(users: User[]): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const today = new Date()
  const currentYear = today.getFullYear()

  // Create events for 2 years in the past, current year, and 2 years in the future
  // This ensures birthdays show up when navigating through different months/years
  const yearsToGenerate = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
  ]

  for (const user of users) {
    // Skip users without birthdate
    if (!user.birthDate) continue

    try {
      const birthDate = new Date(user.birthDate)

      // Skip invalid dates
      if (isNaN(birthDate.getTime())) continue

      // Create birthday event for each year
      for (const year of yearsToGenerate) {
        const birthdayForYear = getBirthdayForYear(birthDate, year)

        // Calculate age for this specific year
        const birth = new Date(birthDate)
        const ageForYear = year - birth.getFullYear()

        const title = formatBirthdayTitle(user.fullName || 'Unknown', ageForYear)

        // Create calendar event with unique ID for each year
        const event: CalendarEvent = {
          id: `${user.id}-${year}`,
          title,
          start: birthdayForYear,
          end: birthdayForYear,
          userId: String(user.id),
          birthDate,
          age: ageForYear,
          type: 'birthday',
        }

        // Add avatar if available
        // if (user.photo && typeof user.photo === 'object' && 'url' in user.photo && user.photo.url) {
        //   event.avatar = user.photo.url
        // }

        events.push(event)
      }
    } catch (error) {
      console.error(`Error processing birthday for user ${user.id}:`, error)
      // Continue with other users
    }
  }

  return events
}

/**
 * Get upcoming birthdays in next N days
 */
export function getUpcomingBirthdays(users: User[], days: number = 30): User[] {
  const today = new Date()
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + days)

  return users
    .filter((user) => {
      if (!user.birthDate) return false

      try {
        const birthdayThisYear = getBirthdayThisYear(new Date(user.birthDate))
        return birthdayThisYear >= today && birthdayThisYear <= futureDate
      } catch {
        return false
      }
    })
    .sort((a, b) => {
      const dateA = getBirthdayThisYear(new Date(a.birthDate!))
      const dateB = getBirthdayThisYear(new Date(b.birthDate!))
      return dateA.getTime() - dateB.getTime()
    })
}

/**
 * Check if today is someone's birthday
 */
export function isBirthdayToday(birthDate: Date): boolean {
  const today = new Date()
  const birth = new Date(birthDate)

  return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate()
}
