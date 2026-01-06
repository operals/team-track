import React from 'react'
import './globals.css'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { AppSidebar } from '@/components/app-sidebar'
import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'

// Force dynamic rendering for all dashboard pages - prevents static generation at build time
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: {
    default: 'TeamTrack - Dashboard',
    template: '%s | TeamTrack',
  },
  description: 'Employee management and payroll system',
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: '/favicon/site.webmanifest',
}

import { hasFullAccess } from '@/lib/rbac'

export default async function DashboardLayout(props: { children: React.ReactNode }) {
  // This will redirect to /login if user is not authenticated
  const user = await requireAuth()

  // Only admin and manager have full access to dashboard
  if (!hasFullAccess(user as any)) {
    redirect('/profile')
  }

  const { children } = props

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <SidebarProvider
            style={
              {
                '--sidebar-width': 'calc(var(--spacing) * 68)',
                '--header-height': 'calc(var(--spacing) * 20)',
              } as React.CSSProperties
            }
          >
            <AppSidebar variant="inset" />
            <SidebarInset>
              <SiteHeader />
              <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
