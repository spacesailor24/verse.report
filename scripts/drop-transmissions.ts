import { PrismaClient } from '../src/generated/prisma'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

async function dropAndRecreateTransmissions() {
  console.log('🗑️  Dropping transmission tables...')

  try {
    // Drop tables in correct order (child table first due to foreign keys)
    await prisma.$executeRaw`DROP TABLE IF EXISTS "TransmissionTag" CASCADE;`
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Transmission" CASCADE;`

    console.log('✅ Transmission tables dropped successfully')

    // Disconnect before running db push
    await prisma.$disconnect()

    console.log('🔄 Recreating tables from schema...')
    const { stdout, stderr } = await execAsync('pnpx prisma db push --skip-generate')

    if (stderr) {
      console.error(stderr)
    }

    console.log('✅ Tables recreated successfully')
    console.log('📝 Run "pnpm seed-transmissions" to re-seed the data')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

dropAndRecreateTransmissions()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })