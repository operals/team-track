import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { requireAuth } from '@/lib/auth-guards'
import { usersTable, payrollSettingsTable, payrollTable } from '@/db/schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { eq, and, or, isNull, gt } from 'drizzle-orm'

export const metadata: Metadata = {
  title: 'Generate Payrolls',
  description: 'Generate monthly payroll for employees',
}

export default async function GeneratePayrollPage() {
  await requireAuth()

  const handleGenerate = async (formData: FormData) => {
    'use server'

    await requireAuth()

    const month = String(formData.get('month') || new Date().getMonth() + 1).padStart(2, '0')
    const year = Number(formData.get('year') || new Date().getFullYear())

    try {
      // Get all active employees
      const employees = await db.query.usersTable.findMany({
        where: eq(usersTable.isActive, true),
        limit: 100,
      })

      console.log(`Found ${employees.length} employees to process`)

      let created = 0
      let skipped = 0

      for (const employee of employees) {
        try {
          // Get all active payroll settings for this employee
          const payrollSettings = await db.query.payrollSettingsTable.findMany({
            where: and(
              eq(payrollSettingsTable.employeeId, employee.id),
              eq(payrollSettingsTable.isActive, true),
              or(
                isNull(payrollSettingsTable.endDate),
                gt(payrollSettingsTable.endDate, new Date()),
              ),
            ),
          })

          // Create one payroll record per setting
          for (const setting of payrollSettings) {
            try {
              // Check if payroll already exists for this employee and period
              const existing = await db.query.payrollTable.findFirst({
                where: and(
                  eq(payrollTable.employeeId, employee.id),
                  eq(payrollTable.month, month),
                  eq(payrollTable.year, year),
                ),
              })

              if (existing) {
                skipped++
                continue
              }

              // Create payroll record
              const amount =
                typeof setting.amount === 'string' ? parseFloat(setting.amount) : setting.amount
              await db.insert(payrollTable).values({
                employeeId: employee.id,
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
                year: year,
                payrollItems: [
                  {
                    payrollSettingId: setting.id,
                    description: setting.description || `${setting.payrollType} payment`,
                    payrollType: setting.payrollType,
                    amount: amount || 0,
                    paymentType: setting.paymentType,
                  },
                ],
                bonusAmount: '0',
                deductionAmount: '0',
                adjustmentNote: null,
                totalAmount: String(amount || 0),
                status: 'generated',
              })

              created++
            } catch (error) {
              console.error(
                `Error creating payroll for employee ${employee.id}, setting ${setting.id}:`,
                error,
              )
            }
          }
        } catch (error) {
          console.error(`Error processing employee ${employee.id}:`, error)
        }
      }

      console.log(`Payroll generation complete: ${created} created, ${skipped} skipped`)
    } catch (error) {
      console.error('Error in payroll generation:', error)
      throw error
    }

    redirect('/payroll')
  }

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Generate Monthly Payrolls</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleGenerate} className="space-y-4">
            <div>
              <label htmlFor="month" className="block text-sm font-medium mb-2">
                Month
              </label>
              <select
                id="month"
                name="month"
                defaultValue={currentMonth.toString().padStart(2, '0')}
                className="w-full rounded-md border bg-background p-2"
              >
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium mb-2">
                Year
              </label>
              <input
                type="number"
                id="year"
                name="year"
                defaultValue={currentYear}
                min="2020"
                max="2030"
                className="w-full rounded-md border bg-background p-2"
              />
            </div>

            <Button type="submit" className="w-full">
              Generate Payrolls
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
