import type { Metadata } from 'next'
import '../(dashboard)/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'TeamTrack',
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

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
