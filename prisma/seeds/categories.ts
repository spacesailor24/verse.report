import { PrismaClient, CategoryType } from '../../src/generated/prisma'

export async function seedCategories(prisma: PrismaClient) {
  console.log('📁 Seeding categories...')

  const categories = [
    {
      name: 'Ships',
      slug: 'ships',
      type: CategoryType.SHIP,
      description: 'Spacecraft, vehicles, and ship-related content',
      color: '#00D4FF',
      sortOrder: 1,
    },
    {
      name: 'Patches',
      slug: 'patches',
      type: CategoryType.PATCH,
      description: 'Evo, PTU, and PU patches',
      color: '#FF3366',
      sortOrder: 2,
    },
    {
      name: 'Creatures',
      slug: 'creatures',
      type: CategoryType.CREATURE,
      description: 'Alien life forms, wildlife, and creatures',
      color: '#66FF33',
      sortOrder: 3,
    },
    {
      name: 'Locations',
      slug: 'locations',
      type: CategoryType.LOCATION,
      description: 'Planets, systems, stations, and locations',
      color: '#9966FF',
      sortOrder: 4,
    },
    {
      name: 'Events',
      slug: 'events',
      type: CategoryType.EVENT,
      description: 'In-game events, community events, and special occasions',
      color: '#FFD700',
      sortOrder: 5,
    },
    {
      name: 'Features',
      slug: 'features',
      type: CategoryType.FEATURE,
      description: 'Game mechanics, features, and gameplay systems',
      color: '#00FFAA',
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