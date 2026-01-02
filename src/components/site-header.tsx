'use client'

import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import { AppBreadcrumbs } from '@/components/app-breadcrumbs'

function toTitle(input: string) {
  if (!input) return ''
  // map common segments
  const map: Record<string, string> = {
    team: 'Team',
    inventory: 'Inventory',
    new: 'New',
    edit: 'Edit',
  }
  if (map[input]) return map[input]
  // numeric or uuid-ish id → Details
  const isId = /^\d+$/.test(input) || /[a-f0-9-]{8,}/i.test(input)
  if (isId) return 'Details'
  // default Title Case
  return input
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

export function SiteHeader() {
  const pathname = usePathname()
  const segments = (pathname || '/').split('/').filter(Boolean)
  const items = [
    { label: 'Dashboard', href: '/' },
    ...segments.map((seg, idx) => {
      const isId = /^\d+$/.test(seg) || /[a-f0-9-]{8,}/i.test(seg)
      const path = `/${segments.slice(0, idx + 1).join('/')}`

      // Don't create href for ID segments unless we know they have detail pages
      // Only users have detail pages (users/[id]/page.tsx)
      const hasDetailPage = segments[0] === 'users' && isId

      return {
        label: toTitle(seg),
        href: isId && !hasDetailPage ? undefined : path,
      }
    }),
  ]
  // Apply runtime label override for entity segment
  if (typeof window !== 'undefined') {
    const overrideMap = (window as any).__breadcrumbOverride as Record<string, string> | undefined
    if (overrideMap) {
      const last = segments[segments.length - 1]
      const isEditOrNew = last === 'edit' || last === 'new'
      const targetPath = isEditOrNew ? `/${segments.slice(0, -1).join('/')}` : pathname || '/'
      const label = overrideMap[targetPath]
      if (label) {
        const targetIndex = isEditOrNew ? items.length - 2 : items.length - 1
        if (targetIndex >= 0 && targetIndex < items.length) {
          items[targetIndex] = { ...items[targetIndex], label }
        }
      }
    }
  }
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <AppBreadcrumbs items={items} />
      </div>
    </header>
  )
}
