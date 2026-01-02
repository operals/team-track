// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = new Set(['/login', '/signup'])

const shouldBypass = (pathname: string) => {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/api')
  )
}

const isProfileRoute = (pathname: string) => {
  return pathname === '/profile' || pathname.startsWith('/profile/')
}

const requiresSuperAdminAccess = (pathname: string) =>
  pathname.startsWith('/admin') || pathname.startsWith('/payload')

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (shouldBypass(pathname) || PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  const token = req.cookies.get('payload-token')?.value

  // Allow unauthenticated users to reach Payload admin login assets
  if (!token) {
    if (requiresSuperAdminAccess(pathname)) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  let user: any

  try {
    // Use internal URL when running on server, external URL only for client-side
    const baseUrl =
      typeof window === 'undefined'
        ? 'http://localhost:3000' // Server-side: use internal localhost
        : process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000' // Client-side: use public URL

    const verifyResponse = await fetch(`${baseUrl}/api/users/me?depth=2`, {
      headers: {
        Authorization: `JWT ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!verifyResponse.ok) {
      const response = NextResponse.redirect(new URL('/login', req.url))
      response.cookies.delete('payload-token')
      return response
    }

    const payload = await verifyResponse.json()
    user = payload.user
  } catch (error) {
    console.log('Token verification failed:', error)
    const response = NextResponse.redirect(new URL('/login', req.url))
    response.cookies.delete('payload-token')
    return response
  }

  const role =
    user?.role && typeof user.role === 'object' ? (user.role as { level?: string }) : null
  const roleLevel = role?.level
  const isSuperAdmin = user?.isSuperAdmin === true
  const isManagerOrAdmin = roleLevel === 'admin' || roleLevel === 'manager'
  const isEmployeeOnly = !isSuperAdmin && !isManagerOrAdmin

  if (requiresSuperAdminAccess(pathname)) {
    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  if (isEmployeeOnly) {
    if (isProfileRoute(pathname)) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/profile', req.url))
  }

  if (!isEmployeeOnly && isProfileRoute(pathname)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
}
