// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Inventory } from './collections/Inventory'
import { Departments } from './collections/Departments'
import { Roles } from './collections/Roles'
import { LeaveDays } from './collections/Leaves'
import { Payroll } from './collections/Payroll'
import { PayrollSettings } from './collections/PayrollSettings'
import { AdditionalPayments } from './collections/AdditionalPayments'
import { Applicants } from './collections/Applicants'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Applicants,
    Inventory,
    LeaveDays,
    Payroll,
    PayrollSettings,
    AdditionalPayments,
    Roles,
    Departments,
    Media,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Skip database connection during build in CI
    ...(process.env.SKIP_DB_CONNECTION === 'true' && {
      disableCreateDatabase: true,
    }),
  }),
  sharp,
  plugins: [
    // storage-adapter-placeholder
  ],
})
