import React from 'react'
import './globals.css'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { AppSidebar } from '@/components/app-sidebar'
import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

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

export default async function DashboardLayout(props: { children: React.ReactNode }) {
  // This will redirect to /login if user is not authenticated
  const user = await requireAuth()

  const role =
    typeof user?.role === 'object' && user.role !== null ? (user.role as { level?: string }) : null
  const roleLevel = role?.level
  const isSuperAdmin = user?.isSuperAdmin === true
  const isManagerOrAdmin = roleLevel === 'admin' || roleLevel === 'manager'

  if (!isSuperAdmin && !isManagerOrAdmin) {
    redirect('/profile')
  }

  const { children } = props

  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  )
}
