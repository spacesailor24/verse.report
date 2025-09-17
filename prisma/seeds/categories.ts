import { PrismaClient, CategoryType } from '../../src/generated/prisma'

export async function seedCategories(prisma: PrismaClient) {
  console.log('📁 Seeding categories...')

  const categories = [
    {
      name: 'Ships',
      slug: 'ships',
      type: CategoryType.SHIP,
      description: 'Spacecraft, vehicles, and ship-related content',
      sortOrder: 1,
    },
    {
      name: 'Patches',
      slug: 'patches',
      type: CategoryType.PATCH,
      description: 'Evo, PTU, and PU patches',
      sortOrder: 2,
    },
    {
      name: 'Creatures',
      slug: 'creatures',
      type: CategoryType.CREATURE,
      description: 'Alien life forms, wildlife, and creatures',
      sortOrder: 3,
    },
    {
      name: 'Locations',
      slug: 'locations',
      type: CategoryType.LOCATION,
      description: 'Planets, systems, stations, and locations',
      sortOrder: 4,
    },
    {
      name: 'Events',
      slug: 'events',
      type: CategoryType.EVENT,
      description: 'In-game events, community events, and special occasions',
      sortOrder: 5,
    },
    {
      name: 'Features',
      slug: 'features',
      type: CategoryType.FEATURE,
      description: 'Game mechanics, features, and gameplay systems',
      sortOrder: 6,
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
  }

  console.log(`✅ Created ${categories.length} categories`)
}