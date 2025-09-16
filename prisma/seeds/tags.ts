import { PrismaClient } from '../../src/generated/prisma'

export async function seedTags(prisma: PrismaClient) {
  console.log('🏷️  Seeding tags...')

  // Get categories for referencing
  const shipCategory = await prisma.category.findUnique({ where: { slug: 'ships' } })
  const patchCategory = await prisma.category.findUnique({ where: { slug: 'patches' } })
  const locationCategory = await prisma.category.findUnique({ where: { slug: 'locations' } })
  const featureCategory = await prisma.category.findUnique({ where: { slug: 'features' } })

  if (!shipCategory || !patchCategory || !locationCategory || !featureCategory) {
    throw new Error('Categories must be seeded before tags')
  }

  // Get ship families for referencing
  const ironcladFamily = await prisma.shipFamily.findUnique({ where: { slug: 'ironclad' } })
  const apolloFamily = await prisma.shipFamily.findUnique({ where: { slug: 'apollo' } })

  if (!ironcladFamily || !apolloFamily) {
    throw new Error('Ship families must be seeded before tags')
  }

  const tags = [
    {
      name: 'Ironclad',
      slug: 'ironclad',
      categoryId: shipCategory.id,
      shipFamilyId: ironcladFamily.id,
      sortOrder: 1,
    },
    {
      name: 'Ironclad Assault',
      slug: 'ironclad-assault',
      categoryId: shipCategory.id,
      shipFamilyId: ironcladFamily.id,
      sortOrder: 2,
    },
    {
      name: 'Perseus',
      slug: 'perseus',
      categoryId: shipCategory.id,
      sortOrder: 3,
    },

    // Patch tags
    {
      name: '4.3.1',
      slug: '4-3-1',
      categoryId: patchCategory.id,
      description: 'Star Citizen version 4.3.1',
      sortOrder: 4,
    },

    // Location tags
    {
      name: 'Nyx',
      slug: 'nyx',
      categoryId: locationCategory.id,
      description: 'Nyx star system',
      sortOrder: 5,
    },

    // Feature tags
    {
      name: 'Medical Gameplay',
      slug: 'medical-gameplay',
      categoryId: featureCategory.id,
      description: 'Medical gameplay mechanics',
      sortOrder: 6,
    },
  ]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    })
  }

  console.log(`✅ Created ${tags.length} tags`)
}