import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Application Submitted',
  description: 'Your application has been submitted successfully',
}

export default function ApplySuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Application Submitted!</CardTitle>
              <CardDescription className="text-base">
                Thank you for your interest in joining our team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  We have received your application and our HR team will review it carefully.
                </p>
                <p className="text-muted-foreground">
                  If your qualifications match our requirements, we will contact you within 5-7
                  business days to discuss the next steps.
                </p>
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">What happens next?</p>
                <ul className="mt-2 space-y-1 text-left text-muted-foreground">
                  <li>• Our HR team will review your application</li>
                  <li>• Qualified candidates will be contacted for an initial interview</li>
                  <li>• You will receive email updates about your application status</li>
                </ul>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button asChild>
                  <Link href="https://elaramedical.com">Visit Elara</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
