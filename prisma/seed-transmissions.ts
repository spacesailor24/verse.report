import { PrismaClient } from '../src/generated/prisma'
import { seedTransmissions } from './seeds/transmissions'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting transmission seeding...')

  // Check if we have any users
  const users = await prisma.user.findMany()

  if (users.length === 0) {
    console.error('❌ No users found! Please log in to the website first to create a user.')
    process.exit(1)
  }

  // Use the first user (should be the dev who logged in)
  const firstUser = users[0]
  console.log(`📡 Seeding transmissions for user: ${firstUser.name || firstUser.email}`)

  await seedTransmissions(prisma, firstUser.id)

  console.log('✅ Transmission seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during transmission seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })