import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { User, Payroll } from '@/payload-types'

export async function generateMonthlyPayrolls(month: string, year: number) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get all active employees with employment data
    const employees = await payload.find({
      collection: 'users',
      where: {
        isActive: {
          equals: true,
        },
      },
      limit: 100,
    })

    const payrollPromises = employees.docs.map(async (user) => {
      // Check if payroll already exists for this period
      const existingPayroll = await payload.find({
        collection: 'payroll',
        where: {
          and: [
            { employee: { equals: user.id } },
            { 'period.month': { equals: month } },
            { 'period.year': { equals: year } },
          ],
        },
      })

      if (existingPayroll.docs.length > 0) {
        return null // Skip if already exists
      }

      // Get payroll settings for this employee
      const payrollSettings = await payload.find({
        collection: 'payroll-settings',
        where: {
          employee: { equals: user.id },
        },
        limit: 1,
      })

      // Skip if no payroll settings found
      if (!payrollSettings.docs.length) {
        return null
      }

      const settings = payrollSettings.docs[0]

      // Calculate leave days for the period
      const leaveDays = await calculateLeaveDays(String(user.id), month, year)

      // Calculate working days
      const totalWorkingDays = getWorkingDaysInMonth(month, year)
      const daysWorked = totalWorkingDays - leaveDays.unpaidDays

      // Calculate prorated amount if employee didn't work full month
      const prorationFactor = daysWorked / totalWorkingDays
      const proratedAmount = settings.paymentDetails.amount * prorationFactor

      // Create payroll record
      return payload.create({
        collection: 'payroll',
        data: {
          employee: user.id,
          period: {
            month: month as
              | '01'
              | '02'
              | '03'
              | '04'
              | '05'
              | '06'
              | '07'
              | '08'
              | '09'
              | '10'
              | '11'
              | '12',
            year,
          },
          payrollItems: [
            {
              payrollSetting: settings.id,
              description: settings.description || 'Monthly Salary',
              payrollType: settings.payrollType,
              amount: proratedAmount,
              paymentType: settings.paymentDetails.paymentType,
            },
          ],
          adjustments: {
            bonusAmount: 0,
            deductionAmount: 0,
            adjustmentNote:
              leaveDays.unpaidDays > 0
                ? `Prorated for ${daysWorked}/${totalWorkingDays} working days (${leaveDays.unpaidDays} unpaid leave days)`
                : '',
          },
          totalAmount: proratedAmount,
          status: 'generated',
        },
      })
    })

    const results = await Promise.all(payrollPromises)
    return results.filter(Boolean) // Remove nulls
  } catch (error) {
    console.error('Error generating payrolls:', error)
    throw error
  }
}

async function calculateLeaveDays(employeeId: string, month: string, year: number) {
  const payload = await getPayload({ config: configPromise })

  const startDate = new Date(year, parseInt(month) - 1, 1)
  const endDate = new Date(year, parseInt(month), 0)

  const leaves = await payload.find({
    collection: 'leave-days',
    where: {
      and: [
        { user: { equals: employeeId } },
        { status: { equals: 'approved' } },
        { startDate: { less_than_equal: endDate.toISOString() } },
        { endDate: { greater_than_equal: startDate.toISOString() } },
      ],
    },
  })

  let totalDays = 0
  let unpaidDays = 0

  leaves.docs.forEach((leave) => {
    totalDays += leave.totalDays || 0
    if (leave.type === 'unpaid') {
      unpaidDays += leave.totalDays || 0
    }
  })

  return { total: totalDays, unpaidDays }
}

function getWorkingDaysInMonth(month: string, year: number): number {
  // Simple calculation - you can make this more sophisticated
  const daysInMonth = new Date(year, parseInt(month), 0).getDate()
  const weekends = Math.floor(daysInMonth / 7) * 2 // Rough weekend calculation
  return daysInMonth - weekends
}
