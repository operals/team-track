'use client'

import { useSession as useNextAuthSession } from 'next-auth/react'


export function useSession() {
  return useNextAuthSession()
}

/**
 * Hook to get current user from session
 */
export function useCurrentUser() {
  const { data: session } = useSession()
  return session?.user
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { data: session, status } = useSession()
  return {
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
  }
}

/**
 * Hook to check if user is super admin
 */
export function useIsSuperAdmin() {
  const { data: session } = useSession()
  return (session?.user as any)?.isSuperAdmin === true
}

/**
 * Hook to check user permissions
 * @param permission - Permission to check (e.g., 'users.create')
 */
export function useHasPermission(permission: string) {
  const { data: session } = useSession()
  const user = session?.user as any

  if (user?.isSuperAdmin) return true

  if (!user?.role?.permissions) return false

  const [resource, action] = permission.split('.')
  return user.role.permissions[resource]?.[action] === true
}
