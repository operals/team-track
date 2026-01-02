import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCurrentUser } from '@/lib/auth'
import { EmployeeProfileView } from '@/components/employee/employee-profile-view'

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'View and manage your profile',
}

export default async function EmployeeProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Determine if user should be restricted to the employee experience
  const isSuperAdmin = user.isSuperAdmin === true
  const role =
    typeof user.role === 'object' && user.role !== null ? (user.role as { level?: string }) : null
  const roleLevel = role?.level
  const isManagerOrAdmin = roleLevel === 'admin' || roleLevel === 'manager'
  const isRestrictedLevel = roleLevel === 'restricted'
  const isEmployeeLevel = roleLevel === 'employee' || isRestrictedLevel || roleLevel === undefined
  const isBasicEmployee = !isSuperAdmin && !isManagerOrAdmin && isEmployeeLevel

  // Only basic employees should access this page
  if (!isBasicEmployee) {
    redirect('/')
  }

  const payload = await getPayload({ config: configPromise })

  // Fetch full user data with relations
  const userData = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 2,
  })

  // Fetch user's inventory
  const { docs: inventory } = await payload.find({
    collection: 'inventory',
    where: {
      holder: {
        equals: user.id,
      },
    },
    depth: 1,
  })

  // Fetch user's leaves
  const { docs: leaves } = await payload.find({
    collection: 'leave-days',
    where: {
      user: {
        equals: user.id,
      },
    },
    depth: 1,
    sort: '-startDate',
  })

  // Fetch user's payroll history
  const { docs: payrollHistory } = await payload.find({
    collection: 'payroll',
    where: {
      employee: {
        equals: user.id,
      },
    },
    depth: 1,
    sort: '-period.year',
  })

  // Fetch user's payroll settings only
  const { docs: payrollSettings } = await payload.find({
    collection: 'payroll-settings',
    where: {
      employee: {
        equals: user.id,
      },
    },
    depth: 1,
    limit: 100,
  })

  return (
    <EmployeeProfileView
      user={userData}
      inventory={inventory}
      leaves={leaves}
      payrollHistory={payrollHistory}
      payrollSettings={payrollSettings}
    />
  )
}
