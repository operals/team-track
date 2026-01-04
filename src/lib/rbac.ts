// Stage 1: Simple RBAC Logic
// Three roles: admin, manager, employee

export type RoleName = 'admin' | 'manager' | 'employee'

export interface User {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  role?: {
    id: string
    name: RoleName
    displayName: string
    description?: string | null
  }
  departments?: Array<{
    departmentId: string
    department: {
      id: string
      name: string
      description?: string | null
      isActive: boolean
    }
  }>
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false
  return user.role?.name === 'admin'
}

/**
 * Check if user is manager
 */
export function isManager(user: User | null | undefined): boolean {
  if (!user) return false
  return user.role?.name === 'manager'
}

/**
 * Check if user is employee
 */
export function isEmployee(user: User | null | undefined): boolean {
  if (!user) return false
  return user.role?.name === 'employee'
}

/**
 * Check if user has full access (admin or manager)
 */
export function hasFullAccess(user: User | null | undefined): boolean {
  return isAdmin(user) || isManager(user)
}

/**
 * Check if user should be listed as employee
 * Managers and employees are listed, admins are not
 */
export function isListedAsEmployee(user: User | null | undefined): boolean {
  if (!user) return false
  return isManager(user) || isEmployee(user)
}

/**
 * Get user's department IDs
 */
export function getUserDepartmentIds(user: User | null | undefined): string[] {
  if (!user?.departments) return []
  return user.departments.map((ud) => ud.departmentId)
}

/**
 * Get user's department names
 */
export function getUserDepartmentNames(user: User | null | undefined): string[] {
  if (!user?.departments) return []
  return user.departments.map((ud) => ud.department.name)
}

/**
 * Check if user can access another user's profile
 */
export function canAccessUserProfile(currentUser: User, targetUserId: string): boolean {
  // Can always access own profile
  if (currentUser.id === targetUserId) return true

  // Admin and manager can access all profiles
  return hasFullAccess(currentUser)
}

/**
 * Get redirect path based on role
 * - Employee goes to /profile
 * - Admin and manager go to / (dashboard)
 */
export function getRoleRedirectPath(user: User | null | undefined): string {
  if (!user) return '/login'

  // Employee goes to their profile
  if (isEmployee(user)) {
    return '/profile'
  }

  // Admin and manager go to dashboard
  return '/'
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(user: User | null | undefined): string {
  if (!user?.role) return 'No Role'
  return user.role.displayName
}

/**
 * Get user role summary
 */
export function getRoleSummary(user: User | null | undefined): string {
  if (!user) return 'Not authenticated'
  if (isAdmin(user)) return 'Administrator - Full Access'
  if (isManager(user)) return 'Manager - Full Access'
  if (isEmployee(user)) return 'Employee - Profile Access Only'
  return 'Unknown Role'
}
