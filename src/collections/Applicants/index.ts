import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const Applicants: CollectionConfig = {
  slug: 'applicants',
  access: {
    create: () => true,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
    admin: authenticated,
  },
  admin: {
    defaultColumns: ['fullName', 'email', 'positionAppliedFor', 'status', 'applicationDate'],
    useAsTitle: 'fullName',
    description: 'Manage job applications and applicant pool',
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      required: true,
      label: 'Full Name',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'Email Address',
      unique: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Phone Number',
    },
    {
      name: 'linkedInUrl',
      type: 'text',
      label: 'LinkedIn Profile URL',
      required: false,
      admin: {
        placeholder: 'https://linkedin.com/in/yourprofile',
      },
    },
    {
      name: 'portfolioUrl',
      type: 'text',
      label: 'Portfolio/Website URL',
      required: false,
      admin: {
        placeholder: 'https://yourportfolio.com',
      },
    },

    {
      name: 'positionAppliedFor',
      type: 'text',
      required: true,
      label: 'Position Applied For',
      admin: {
        description: 'The job title or role the applicant is interested in',
      },
    },
    {
      name: 'yearsOfExperience',
      type: 'number',
      required: true,
      label: 'Years of Experience',
      min: 0,
      max: 30,
      admin: {
        description: 'Total years of professional experience',
      },
    },
    {
      name: 'educationLevel',
      type: 'select',
      required: true,
      label: 'Education Level',
      options: [
        {
          label: 'High School',
          value: 'high-school',
        },
        {
          label: 'Associate Degree',
          value: 'associate',
        },
        {
          label: "Bachelor's Degree",
          value: 'bachelor',
        },
        {
          label: "Master's Degree",
          value: 'master',
        },
        {
          label: 'Doctorate (PhD)',
          value: 'phd',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
    },
    {
      name: 'currentEmploymentStatus',
      type: 'select',
      required: true,
      label: 'Current Employment Status',
      options: [
        {
          label: 'Employed',
          value: 'employed',
        },
        {
          label: 'Unemployed',
          value: 'unemployed',
        },
        {
          label: 'Notice Period',
          value: 'notice-period',
        },
        {
          label: 'Student',
          value: 'student',
        },
      ],
      defaultValue: 'unemployed',
    },
    {
      name: 'expectedSalary',
      type: 'number',
      label: 'Expected Salary (Optional)',
      required: false,
      admin: {
        description: 'Expected monthly or annual salary',
      },
    },
    {
      name: 'availabilityDate',
      type: 'date',
      label: 'Availability / Start Date',
      required: false,
      admin: {
        description: 'When can the applicant start working?',
      },
    },

    // Source
    {
      name: 'source',
      type: 'select',
      required: false,
      label: 'Application Source',
      options: [
        {
          label: 'Website',
          value: 'website',
        },
        {
          label: 'LinkedIn',
          value: 'linkedin',
        },
        {
          label: 'Referral',
          value: 'referral',
        },
        {
          label: 'Job Board',
          value: 'job-board',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
      admin: {
        description: 'How did the applicant hear about the job opening?',
      },
    },

    // Application Content
    {
      name: 'bio',
      type: 'textarea',
      required: true,
      label: 'Cover Letter / Bio',
      admin: {
        description: "Tell us about yourself and why you're interested in this position",
        placeholder: 'Write a brief introduction and explain your motivation...',
      },
    },
    {
      name: 'cv',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'CV / Resume',
      admin: {
        description: 'Upload your CV or resume (PDF format preferred)',
      },
    },

    // Application Management (System Fields)
    {
      name: 'status',
      type: 'select',
      required: true,
      label: 'Application Status',
      defaultValue: 'new',
      options: [
        {
          label: 'New',
          value: 'new',
        },
        {
          label: 'Under Review',
          value: 'under-review',
        },
        {
          label: 'Shortlisted',
          value: 'shortlisted',
        },
        {
          label: 'Interview Scheduled',
          value: 'interview-scheduled',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
        {
          label: 'Hired',
          value: 'hired',
        },
      ],
      admin: {
        position: 'sidebar',
        description: 'Current status of the application',
      },
      access: {
        // Only authenticated users can update status
        update: ({ req: { user } }) => !!user,
      },
    },
    {
      name: 'applicationDate',
      type: 'date',
      required: true,
      label: 'Application Date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      defaultValue: () => new Date().toISOString(),
      hooks: {
        beforeChange: [
          ({ siblingData, value, operation }) => {
            // Set application date only on create
            if (operation === 'create' && !value) {
              return new Date().toISOString()
            }
            return value
          },
        ],
      },
    },

    // HR Internal Fields
    {
      name: 'internalNotes',
      type: 'richText',
      label: 'Internal Notes',
      required: false,
      admin: {
        description: 'Internal notes for HR team (not visible to applicant)',
      },
      access: {
        // Only authenticated users can view/edit internal notes
        read: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
      },
    },

    // Compliance
    {
      name: 'consentToDataStorage',
      type: 'checkbox',
      required: true,
      label: 'Consent to Data Storage',
      defaultValue: false,
      admin: {
        description:
          'I consent to the storage and processing of my personal data for recruitment purposes',
      },
    },
  ],
  timestamps: true,
}
