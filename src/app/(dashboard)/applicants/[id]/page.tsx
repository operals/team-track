import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ApplicantDetail } from '@/components/applicants/applicant-detail'

interface ApplicantPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ApplicantPage({ params }: ApplicantPageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const { user: currentUser } = await payload.auth({ headers: await headers() })

  if (!currentUser) redirect('/login')

  try {
    const applicant = await payload.findByID({
      collection: 'applicants',
      id: id,
      depth: 2, // to resolve department, reviewedBy, and convertedToUser relationships
      user: currentUser,
    })

    return <ApplicantDetail applicant={applicant} currentUser={currentUser} />
  } catch (error) {
    console.error('Error fetching applicant:', error)
    notFound()
  }
}
