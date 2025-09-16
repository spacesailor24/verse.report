import { PrismaClient } from '../src/generated/prisma'
import { seedCategories } from './seeds/categories'
import { seedShipFamilies } from './seeds/shipFamilies'
import { seedTags } from './seeds/tags'
import { seedTransmissions } from './seeds/transmissions'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Seed in order of dependencies
  await seedCategories(prisma)
  await seedShipFamilies(prisma)
  await seedTags(prisma)
  await seedTransmissions(prisma)

  console.log('✅ Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })