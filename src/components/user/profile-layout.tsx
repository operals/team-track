'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import { ProfileCard } from './profile-card'
import { InfoCard } from './info-card'
import { PayrollCard } from './payroll-card'
import { UserStatusToggle } from './status-toggle'
import { updateUserStatus } from '@/lib/actions/user'
import type { InferSelectModel } from 'drizzle-orm'
import {
  usersTable,
  inventoryTable,
  leavesTable,
  payrollTable,
  payrollSettingsTable,
} from '@/db/schema'

type User = InferSelectModel<typeof usersTable>
type Inventory = InferSelectModel<typeof inventoryTable>
type LeaveDay = InferSelectModel<typeof leavesTable>
type Payroll = InferSelectModel<typeof payrollTable>
type PayrollSetting = InferSelectModel<typeof payrollSettingsTable>
import { Card, CardContent } from '../ui/card'
import { SetBreadcrumbLabel } from '@/components/set-breadcrumb-label'
import { InventoryCard } from './inventory-card'
import { EmploymentStatusCard } from './employment-status'
import { LeavesCard } from './leaves-card'
import { DocumentsCard } from './documents-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ProfileLayoutProps {
  user: User
  inventory?: Inventory[]
  leaves?: LeaveDay[]
  payrollHistory?: Payroll[]
  payrollSettings?: PayrollSetting[]
}

export function ProfileLayout({
  user,
  inventory = [],
  leaves = [],
  payrollHistory = [],
  payrollSettings = [],
}: ProfileLayoutProps) {
  const handleStatusChange = async (isActive: boolean) => {
    await updateUserStatus(String(user.id), isActive)
  }

  // Use fullName as primary, fallback to username, then email
  const displayName =
    user?.fullName || user?.username || user?.email?.split('@')[0] || 'Unknown User'

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <SetBreadcrumbLabel label={displayName} />
        {/* Header with navigation */}
        <div className="flex flex-col md:flex-row justify-between space-y-2">
          <div className="flex justify-between space-x-4">
            <Link href="/users">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">User Profile</h1>
          </div>
          <div className="flex items-center justify-end gap-3 space-x-4">
            <UserStatusToggle user={user} onStatusChange={handleStatusChange} />
            <Link href={`/users/${user.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardContent className="pt-2">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="payroll">Payroll</TabsTrigger>
                <TabsTrigger value="leaves">Leaves</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6 mt-2">
                <ProfileCard user={user} />
                <InfoCard user={user} />
                <EmploymentStatusCard user={user} />
              </TabsContent>

              {/* Payroll Tab */}
              <TabsContent value="payroll" className="space-y-6 mt-2">
                <PayrollCard payrollHistory={payrollHistory} payrollSettings={payrollSettings} />
              </TabsContent>

              {/* Leaves Tab */}
              <TabsContent value="leaves" className="space-y-6 mt-2">
                <LeavesCard leaves={leaves} />
              </TabsContent>

              {/* Inventory Tab */}
              <TabsContent value="inventory" className="space-y-6 mt-2">
                <InventoryCard inventory={inventory} />
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-6 mt-2">
                <DocumentsCard user={user} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
