import type { User, Role } from '@/payload-types'

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  user: User | null | undefined,
  resource: 'users' | 'payroll' | 'leaves' | 'inventory' | 'departments' | 'system',
  action: string,
): boolean {
  if (!user || !user.role) return false

  const role = user.role as Role

  // If no permissions defined, deny access
  if (!role.permissions) return false

  const resourcePermissions = role.permissions[resource] as any

  if (!resourcePermissions) return false

  return Boolean(resourcePermissions[action])
}

/**
 * Check if user can view all resources of a type
 */
export function canViewAll(
  user: User | null | undefined,
  resource: 'users' | 'payroll' | 'leaves' | 'inventory',
): boolean {
  return hasPermission(user, resource, 'viewAll')
}

/**
 * Check if user can view resources within their department
 */
export function canViewDepartment(
  user: User | null | undefined,
  resource: 'users' | 'payroll' | 'leaves',
): boolean {
  return hasPermission(user, resource, 'viewDepartment')
}

/**
 * Check if user can view only their own resources
 */
export function canViewOwn(
  user: User | null | undefined,
  resource: 'payroll' | 'leaves' | 'inventory',
): boolean {
  return hasPermission(user, resource, 'viewOwn')
}

/**
 * Check if user is HR (has admin level)
 */
export function isHR(user: User | null | undefined): boolean {
  if (!user || !user.role) return false
  const role = user.role as Role
  return role.level === 'admin'
}

/**
 * Check if user is a department manager
 */
export function isDepartmentManager(user: User | null | undefined): boolean {
  if (!user || !user.role) return false
  const role = user.role as Role
  return role.level === 'manager'
}

/**
 * Get user's department IDs (can have multiple)
 */
export function getUserDepartmentIds(user: User | null | undefined): number[] {
  if (!user || !user.departments) return []

  if (Array.isArray(user.departments)) {
    return user.departments.map((dept) =>
      typeof dept === 'object' ? Number(dept.id) : Number(dept),
    )
  }

  return []
}

/**
 * Check if two users share any department
 */
export function shareDepartment(user1: User, user2: User): boolean {
  const dept1 = getUserDepartmentIds(user1)
  const dept2 = getUserDepartmentIds(user2)

  if (dept1.length === 0 || dept2.length === 0) return false

  return dept1.some((d1) => dept2.includes(d1))
}

/**
 * Get readable permission summary for a user
 */
export function getPermissionSummary(user: User | null | undefined): string[] {
  if (!user || !user.role) return ['No permissions']

  const role = user.role as Role
  const permissions: string[] = []

  if (isHR(user)) {
    permissions.push('Full system access (HR)')
  } else if (isDepartmentManager(user)) {
    permissions.push('Department manager access')
  } else {
    permissions.push('Standard employee access')
  }

  // Check specific permissions
  if (canViewAll(user, 'users')) permissions.push('View all users')
  if (canViewDepartment(user, 'users')) permissions.push('View department users')
  if (hasPermission(user, 'leaves', 'approve')) permissions.push('Approve leaves')
  if (hasPermission(user, 'payroll', 'manageSettings')) permissions.push('Manage payroll settings')

  return permissions
}
