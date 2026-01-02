import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate required fields
    const requiredFields = [
      'fullName',
      'email',
      'phone',
      'positionAppliedFor',
      'yearsOfExperience',
      'educationLevel',
      'currentEmploymentStatus',
      'bio',
      'cv',
      'consentToDataStorage',
    ]

    for (const field of requiredFields) {
      if (!body[field] && body[field] !== 0 && body[field] !== false) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 },
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ success: false, message: 'Invalid email format' }, { status: 400 })
    }

    // Validate consent
    if (!body.consentToDataStorage) {
      return NextResponse.json(
        { success: false, message: 'Consent to data storage is required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Check if email already exists
    const existing = await payload.find({
      collection: 'applicants',
      where: {
        email: {
          equals: body.email,
        },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            'An application with this email already exists. Please contact HR if you need to update your application.',
        },
        { status: 409 },
      )
    }

    // Create the applicant record
    const applicant = await payload.create({
      collection: 'applicants',
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        linkedInUrl: body.linkedInUrl || undefined,
        portfolioUrl: body.portfolioUrl || undefined,
        positionAppliedFor: body.positionAppliedFor,
        yearsOfExperience: body.yearsOfExperience,
        educationLevel: body.educationLevel,
        currentEmploymentStatus: body.currentEmploymentStatus,
        expectedSalary: body.expectedSalary || undefined,
        availabilityDate: body.availabilityDate || undefined,
        source: body.source || 'website',
        bio: body.bio,
        cv: body.cv,
        status: 'new',
        applicationDate: new Date().toISOString(),
        consentToDataStorage: body.consentToDataStorage,
      },
      overrideAccess: true, // Allow public creation without authentication
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully',
        applicant: {
          id: applicant.id,
          fullName: applicant.fullName,
          email: applicant.email,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating applicant:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit application. Please try again later.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
