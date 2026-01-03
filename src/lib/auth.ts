import { auth, signIn, signOut } from '@/auth'
import { redirect } from 'next/navigation'

export const getServerSession = auth

export async function loginAction(formData: FormData) {
  'use server'

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Invalid email or password',
    }
  }
}

/**
 * Sign out the current user
 * Server Action for logout
 */
export async function logoutAction() {
  'use server'
  await signOut({ redirectTo: '/login' })
}

/**
 * Get current user from session
 * Helper to get user data in server components
 */
export async function getCurrentUser() {
  const session = await getServerSession()
  return session?.user
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getServerSession()
  return !!session?.user
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin() {
  const session = await getServerSession()
  return (session?.user as any)?.isSuperAdmin === true
}

/**
 * Check if user has specific permission
 * @param permission - Permission to check (e.g., 'users.create')
 */
export async function hasPermission(permission: string) {
  const session = await getServerSession()
  const user = session?.user as any

  if (user?.isSuperAdmin) return true

  if (!user?.role?.permissions) return false

  const [resource, action] = permission.split('.')
  return user.role.permissions[resource]?.[action] === true
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}
