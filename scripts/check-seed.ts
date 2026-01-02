import { getPayload } from 'payload'
import config from '../src/payload.config.js'

async function checkSeed() {
  const payload = await getPayload({ config })

  console.log('\n🔍 Checking seeded data...\n')

  // Check users
  const users = await payload.find({
    collection: 'users',
    limit: 100,
  })
  console.log(`👥 Users: ${users.totalDocs}`)
  if (users.totalDocs > 0) {
    users.docs.slice(0, 5).forEach((user: any) => {
      console.log(`   - ${user.fullName} (${user.email})`)
    })
    if (users.totalDocs > 5) console.log(`   ... and ${users.totalDocs - 5} more`)
  }

  // Check departments
  const departments = await payload.find({
    collection: 'departments',
    limit: 100,
  })
  console.log(`\n📁 Departments: ${departments.totalDocs}`)

  // Check roles
  const roles = await payload.find({
    collection: 'roles',
    limit: 100,
  })
  console.log(`👔 Roles: ${roles.totalDocs}`)

  // Check payroll settings
  const payrollSettings = await payload.find({
    collection: 'payroll-settings',
    limit: 100,
  })
  console.log(`💰 Payroll Settings: ${payrollSettings.totalDocs}`)

  // Check payroll
  const payroll = await payload.find({
    collection: 'payroll',
    limit: 100,
  })
  console.log(`📊 Payroll Records: ${payroll.totalDocs}`)

  // Check inventory
  const inventory = await payload.find({
    collection: 'inventory',
    limit: 100,
  })
  console.log(`💻 Inventory Items: ${inventory.totalDocs}`)

  // Check leaves
  const leaves = await payload.find({
    collection: 'leave-days',
    limit: 100,
  })
  console.log(`🏖️  Leave Records: ${leaves.totalDocs}\n`)

  console.log('✅ Database check complete!\n')
  process.exit(0)
}

checkSeed().catch((error) => {
  console.error('❌ Error checking seed:', error)
  process.exit(1)
})
