import type { Metadata } from 'next'
import { ApplyForm } from '@/components/applicants/apply-form'

export const metadata: Metadata = {
  title: 'Apply for a Position',
  description: 'Submit your application to join our team',
}

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Join Our Team
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              We&apos;re always looking for talented individuals to join our growing team. Fill out
              the form below to apply.
            </p>
          </div>

          {/* Form */}
          <ApplyForm />
        </div>
      </div>
    </div>
  )
}
