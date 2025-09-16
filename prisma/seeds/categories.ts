import { PrismaClient, CategoryType } from '../../src/generated/prisma'

export async function seedCategories(prisma: PrismaClient) {
  console.log('📁 Seeding categories...')

  const categories = [
    {
      name: 'Ships',
      slug: 'ships',
      type: CategoryType.SHIP,
      description: 'Spacecraft, vehicles, and ship-related content',
      color: '#00D9FF',
      sortOrder: 1,
    },
    {
      name: 'Patches',
      slug: 'patches',
      type: CategoryType.PATCH,
      description: 'Evo, PTU, and PU patches',
      color: '#FC3D21',
      sortOrder: 2,
    },
    {
      name: 'Creatures',
      slug: 'creatures',
      type: CategoryType.CREATURE,
      description: 'Alien life forms, wildlife, and creatures',
      color: '#FFFB00',
      sortOrder: 3,
    },
    {
      name: 'Locations',
      slug: 'locations',
      type: CategoryType.LOCATION,
      description: 'Planets, systems, stations, and locations',
      color: '#0B3D91',
      sortOrder: 4,
    },
    {
      name: 'Events',
      slug: 'events',
      type: CategoryType.EVENT,
      description: 'In-game events, community events, and special occasions',
      color: '#5A708C',
      sortOrder: 5,
    },
    {
      name: 'Features',
      slug: 'features',
      type: CategoryType.FEATURE,
      description: 'Game mechanics, features, and gameplay systems',
      color: '#00FFB2',
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