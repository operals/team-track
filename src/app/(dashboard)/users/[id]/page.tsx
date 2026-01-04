import { redirect, notFound } from 'next/navigation'
import { db } from '@/db'
import { requireAuth } from '@/lib/auth-guards'
import { ProfileLayout } from '@/components/user/profile-layout'
import { eq } from 'drizzle-orm'
import {
  usersTable,
  inventoryTable,
  leavesTable,
  payrollTable,
  payrollSettingsTable,
} from '@/db/schema'

interface UserProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params
  await requireAuth()

  try {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
      with: {
        role: true,
        departments: {
          with: {
            department: true,
          },
        },
      },
    })

    if (!user) {
      notFound()
    }
    // Fetch inventory items held by this user
    const inventory = await db.query.inventoryTable.findMany({
      where: eq(inventoryTable.holderId, user.id),
      with: {
        holder: true,
      },
    })

    // Fetch leave records for this user
    const leaves = await db.query.leavesTable.findMany({
      where: eq(leavesTable.userId, user.id),
      orderBy: (leaves, { desc }) => [desc(leaves.createdAt)],
      with: {
        user: true,
      },
    })

    // Fetch payroll records for this user
    const payrolls = await db.query.payrollTable.findMany({
      where: eq(payrollTable.employeeId, user.id),
      orderBy: (payroll, { desc }) => [desc(payroll.createdAt)],
      with: {
        employee: true,
        processedBy: true,
      },
    })

    // Fetch payroll settings for this user
    const payrollSettings = await db.query.payrollSettingsTable.findMany({
      where: eq(payrollSettingsTable.employeeId, user.id),
      orderBy: (settings, { desc }) => [desc(settings.createdAt)],
      with: {
        employee: true,
      },
    })

    return (
      <ProfileLayout
        user={user}
        inventory={inventory as any[]}
        leaves={leaves as any[]}
        payrollHistory={payrolls as any[]}
        payrollSettings={payrollSettings as any[]}
      />
    )
  } catch (error) {
    console.error('Error fetching user:', error)
    notFound()
  }
}
