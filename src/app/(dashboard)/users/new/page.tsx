import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { UserForm } from '@/components/user/forms/user-form'

export const metadata: Metadata = {
  title: 'New User',
  description: 'Create a new user',
}

export default async function NewUserPage() {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin')

  // Fetch departments and roles for dropdowns
  const [departmentsResult, rolesResult] = await Promise.all([
    payload.find({
      collection: 'departments',
      limit: 100,
      sort: 'name',
      user,
    }),
    payload.find({
      collection: 'roles',
      limit: 100,
      sort: 'name',
      user,
    }),
  ])

  const handleCreateUser = async (formData: FormData) => {
    'use server'

    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })

    if (!user) {
      throw new Error('Unauthorized')
    }

    // Handle photo upload if file is provided
    let photoId: number | null = null
    const photo = formData.get('photo') as File | null
    const fullName = String(formData.get('fullName') || '')
    if (photo && typeof photo === 'object' && 'arrayBuffer' in photo && photo.size > 0) {
      const arrayBuffer = await photo.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const uploadResult = await payload.create({
        collection: 'media',
        data: {
          alt: `${fullName} profile photo`,
        },
        file: {
          data: buffer,
          mimetype: photo.type,
          name: photo.name,
          size: photo.size,
        },
        user,
      })
      photoId = uploadResult.id as number
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
      ...(photoId && { photo: photoId }),
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

    // Handle departments array (multi-select)
    const departmentIds: number[] = []
    let index = 0
    while (formData.has(`departments[${index}]`)) {
      const deptId = String(formData.get(`departments[${index}]`))
      if (deptId) departmentIds.push(parseInt(deptId))
      index++
    }
    if (departmentIds.length > 0) userData.departments = departmentIds

    // Convert role string ID to number if value provided
    const role = String(formData.get('role') || '')
    if (role) userData.role = parseInt(role)

    // Handle documents upload (multi-file)
    const documentIds: number[] = []
    let docIndex = 0
    while (formData.has(`documents[${docIndex}]`)) {
      const doc = formData.get(`documents[${docIndex}]`) as File | null
      if (doc && typeof doc === 'object' && 'arrayBuffer' in doc && doc.size > 0) {
        const arrayBuffer = await doc.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const uploadResult = await payload.create({
          collection: 'media',
          data: {
            alt: `${fullName} - ${doc.name}`,
          },
          file: {
            data: buffer,
            mimetype: doc.type,
            name: doc.name,
            size: doc.size,
          },
          user,
        })
        documentIds.push(uploadResult.id as number)
      }
      docIndex++
    }
    if (documentIds.length > 0) userData.documents = documentIds

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

    const newUser = await payload.create({
      collection: 'users',
      data: userData,
      user,
    })

    // Redirect to the new staff member's profile
    redirect(`/users/${newUser.id}`)
  }

  return (
    <>
      <UserForm
        mode="create"
        formAction={handleCreateUser}
        departments={departmentsResult.docs.map((dept) => ({
          value: String(dept.id),
          label: dept.name,
        }))}
        roles={rolesResult.docs.map((role) => ({ value: String(role.id), label: role.name }))}
      />
    </>
  )
}
