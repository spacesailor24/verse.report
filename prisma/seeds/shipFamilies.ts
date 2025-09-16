import { PrismaClient } from '../../src/generated/prisma'

export async function seedShipFamilies(prisma: PrismaClient) {
  console.log('🚀 Seeding ship families...')

  const shipFamilies = [
    {
      name: 'Ironclad',
      slug: 'ironclad',
      sortOrder: 1,
    },
    {
      name: 'Apollo',
      slug: 'apollo',
      sortOrder: 2,
    },
  ]

  for (const family of shipFamilies) {
    await prisma.shipFamily.upsert({
      where: { slug: family.slug },
      update: family,
      create: family,
    })
  }

  console.log(`✅ Created ${shipFamilies.length} ship families`)
}