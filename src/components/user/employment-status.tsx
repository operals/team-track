'use client'
import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { InferSelectModel } from 'drizzle-orm'
import { usersTable } from '@/db/schema'

type User = InferSelectModel<typeof usersTable>
import { formatDate } from '@/lib/date-utils'

interface EmploymentStatusCardProps {
  user: User
}

const labelMap: Record<string, string> = {
  citizen: 'Citizen',
  workPermit: 'Work Permit',
  residencePermit: 'Residence Permit',
  other: 'Other',
}

export function EmploymentStatusCard({ user }: EmploymentStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment Status</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-medium">Nationality</div>
          <div className="text-muted-foreground">{user.nationality || 'Not specified'}</div>
        </div>
        <div>
          <div className="font-medium">Identification No.</div>
          <div className="text-muted-foreground">{user.identityNumber || 'Not specified'}</div>
        </div>
        <div>
          <div className="font-medium">Employment Type</div>
          <div className="text-muted-foreground">
            {user.employmentType
              ? (labelMap[user.employmentType] ?? user.employmentType)
              : 'Not specified'}
          </div>
        </div>
        {/* Only show Work Permit Expiry if employment type is workPermit */}
        {user.employmentType === 'workPermit' && (
          <div>
            <div className="font-medium">Work Permit Expiry</div>
            <div className="text-muted-foreground">{formatDate(user.workPermitExpiry)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
