import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { requireAuth } from '@/lib/auth-guards'
import { UserForm } from '@/components/user/forms/user-form'
import { asc, eq } from 'drizzle-orm'
import { departmentsTable, rolesTable, usersTable, userDepartmentsTable } from '@/db/schema'

export const metadata: Metadata = {
  title: 'New User',
  description: 'Create a new user',
}

export default async function NewUserPage() {
  await requireAuth()

  // Fetch departments and roles for dropdowns
  const [departments, roles] = await Promise.all([
    db.select().from(departmentsTable).orderBy(asc(departmentsTable.name)),
    db.select().from(rolesTable).orderBy(asc(rolesTable.name)),
  ])

  const handleCreateUser = async (formData: FormData) => {
    'use server'

    await requireAuth()

    // Handle photo upload via API if file is provided
    let photoPath: string | null = null
    const photo = formData.get('photo') as File | null
    const fullName = String(formData.get('fullName') || '')
    if (photo && typeof photo === 'object' && 'arrayBuffer' in photo && photo.size > 0) {
      // Use the upload API endpoint
      const uploadFormData = new FormData()
      uploadFormData.append('file', photo)

      const uploadRes = await fetch(
        `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/upload`,
        {
          method: 'POST',
          body: uploadFormData,
        },
      )

      if (uploadRes.ok) {
        const { url } = await uploadRes.json()
        photoPath = url
      }
    }

    // Auth fields
    const email = String(formData.get('email') || '')
    const username = String(formData.get('username') || '')
    const password = String(formData.get('password') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')
    if (!email) throw new Error('Email is required')
    if (!username || !password) throw new Error('Username and password are required')
    if (password !== confirmPassword) throw new Error('Passwords do not match')

    // Normalize optional fields
    const jobTitle = String(formData.get('jobTitle') || '')
    const secondaryPhone = String(formData.get('secondaryPhone') || '')
    const secondaryEmail = String(formData.get('secondaryEmail') || '')

    // Create the new user (team member)
    const userData: any = {
      fullName,
      ...(photoPath && { photo: photoPath }),
      birthDate: String(formData.get('birthDate') || ''),
      primaryPhone: String(formData.get('primaryPhone') || ''),
      joinedAt: String(formData.get('joinedAt') || new Date().toISOString()),
      employmentType: String(formData.get('employmentType') || 'other'),
      nationality: String(formData.get('nationality') || ''),
      identityNumber: String(formData.get('identityNumber') || ''),
      address: String(formData.get('address') || ''),
      username,
      password,
      ...(email && { email }),
    }

    // Optional date fields: only include when provided (avoid sending empty strings)
    const workPermitExpiry = String(formData.get('workPermitExpiry') || '')
    if (workPermitExpiry) userData.workPermitExpiry = workPermitExpiry

    if (jobTitle) userData.jobTitle = jobTitle
    if (secondaryPhone) userData.secondaryPhone = secondaryPhone
    if (secondaryEmail) userData.secondaryEmail = secondaryEmail

    // Handle departments array (multi-select) - will insert into junction table
    const departmentIds: string[] = []
    let index = 0
    while (formData.has(`departments[${index}]`)) {
      const deptId = String(formData.get(`departments[${index}]`))
      if (deptId) departmentIds.push(deptId)
      index++
    }

    // Convert role string ID if value provided
    const roleId = String(formData.get('role') || '')

    // Handle documents upload (multi-file) via API
    const documentPaths: string[] = []
    let docIndex = 0
    while (formData.has(`documents[${docIndex}]`)) {
      const doc = formData.get(`documents[${docIndex}]`) as File | null
      if (doc && typeof doc === 'object' && 'arrayBuffer' in doc && doc.size > 0) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', doc)

        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/upload`,
          {
            method: 'POST',
            body: uploadFormData,
          },
        )

        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          documentPaths.push(url)
        }
      }
      docIndex++
    }

    // Employment fields
    const baseSalary = formData.get('baseSalary')
    const paymentType = String(formData.get('paymentType') || 'bankTransfer')

    // Add employment data if any employment fields are provided
    if (baseSalary || paymentType) {
      userData.employment = {
        ...(baseSalary && { baseSalary: parseFloat(String(baseSalary)) }),
        paymentType,
      }
    }

    // Hash password with bcryptjs
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)
    userData.password = hashedPassword

    // Set role if provided
    if (roleId) userData.roleId = roleId

    // Set documents if any uploaded
    if (documentPaths.length > 0) {
      userData.documents = JSON.stringify(documentPaths)
    }

    // Create user in database
    const [newUser] = await db.insert(usersTable).values(userData).returning()

    // Insert department assignments into junction table
    if (departmentIds.length > 0 && newUser.id) {
      await db.insert(userDepartmentsTable).values(
        departmentIds.map((deptId) => ({
          userId: newUser.id,
          departmentId: deptId,
        })),
      )
    }

    // Redirect to the new staff member's profile
    redirect(`/users/${newUser.id}`)
  }

  return (
    <>
      <UserForm
        mode="create"
        formAction={handleCreateUser}
        departments={departments.map((dept) => ({
          value: String(dept.id),
          label: dept.name,
        }))}
        roles={roles.map((role) => ({ value: String(role.id), label: role.displayName }))}
      />
    </>
  )
}
