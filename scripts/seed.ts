#!/usr/bin/env tsx

import 'dotenv/config'
import { seed } from '../src/seed/index.js'

async function runSeed() {
  console.log('🌱 Running seed script...')
  console.log('📊 This will create:')
  console.log('   - Roles and Departments')
  console.log('   - 20 Marvel character users')
  console.log('   - Payroll settings for each user')
  console.log('   - 3 months of payroll history (60 records)')
  console.log('   - 30 inventory items (laptops, phones, SIM cards)')
  console.log('   - Random leave records for each user')
  console.log('')

  try {
    await seed()
    console.log('')
    console.log('✅ Seed completed successfully!')
    console.log('🎉 Your TeamTrack system is now populated with Marvel characters!')
    process.exit(0)
  } catch (error) {
    console.error('')
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

// Run the seed
runSeed()
