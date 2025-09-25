import { PrismaClient } from '../src/generated/prisma'
import { seedCategories } from './seeds/categories'
import { seedShipFamilies } from './seeds/shipFamilies'
import { seedTags } from './seeds/tags'
import { seedRoles } from './seeds/roles'
import { seedSources } from './seeds/sources'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed (base data only)...')

  // Seed in order of dependencies - NO TRANSMISSIONS
  await seedRoles(prisma) // Seed roles first (no dependencies)
  await seedSources(prisma) // Seed sources (no dependencies)
  await seedCategories(prisma)
  await seedShipFamilies(prisma)
  await seedTags(prisma)

  console.log('✅ Database seeding completed!')
  console.log('📝 To seed transmissions: First log in to create a user, then run "npm run seed-transmissions"')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })