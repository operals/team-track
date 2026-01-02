import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, username, password } = body

    if (!password || (!email && !username)) {
      return NextResponse.json(
        { message: 'Email/username and password are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Attempt to login using Payload's login method
    const loginData = email ? { email, password } : { username: username!, password }

    const result = await payload.login({
      collection: 'users',
      data: loginData,
    })

    if (!result.user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // Set the cookie
    const cookieStore = await cookies()
    if (result.token) {
      cookieStore.set('payload-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    }

    return NextResponse.json({
      message: 'Login successful',
      user: result.user,
      token: result.token,
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ message: error.message || 'Login failed' }, { status: 401 })
  }
}
