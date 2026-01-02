'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const token = (await cookies()).get('payload-token')?.value
  if (!token) return null

  try {
    // Use internal URL on server-side
    const baseUrl = 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/users/me`, {
      headers: {
        Authorization: `JWT ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      // Token is invalid, clear it
      ;(await cookies()).delete('payload-token')
      return null
    }

    const { user } = await res.json()
    return user
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

export async function logout() {
  try {
    const token = (await cookies()).get('payload-token')?.value

    if (token) {
      // Use internal URL on server-side
      const baseUrl = 'http://localhost:3000'

      // Call Payload logout endpoint
      await fetch(`${baseUrl}/api/users/logout`, {
        method: 'POST',
        headers: {
          Authorization: `JWT ${token}`,
          'Content-Type': 'application/json',
        },
      })
    }
  } catch (error) {
    console.error('Error during logout:', error)
  } finally {
    // Always clear the cookie
    ;(await cookies()).delete('payload-token')
  }

  redirect('/login')
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}
