import type { Metadata } from 'next'
import '../(dashboard)/globals.css'

// Force dynamic rendering for employee pages
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: {
    default: 'Employee Portal | TeamTrack',
    template: '%s | TeamTrack',
  },
  description: 'Employee portal for TeamTrack',
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

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  )
}
