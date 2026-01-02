import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { Tabs, TabsContent } from '@radix-ui/react-tabs'
import { ApplicantsList } from '@/components/applicants/applicants-list'

export const metadata: Metadata = {
  title: 'Applicants',
  description: 'Manage job applications and candidate pool',
}

export default async function ApplicantsPage() {
  const payload = await getPayload({ config: configPromise })

  // Authenticate using the request cookies (same login as /admin)
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/login')

  // Fetch Applicants
  const { docs } = await payload.find({
    collection: 'applicants',
    depth: 2,
    limit: 100,
    sort: '-applicationDate',
    user,
  })

  return (
    <Tabs defaultValue="outline">
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="space-y-4 p-4 lg:p-6">
          <ApplicantsList data={docs} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
