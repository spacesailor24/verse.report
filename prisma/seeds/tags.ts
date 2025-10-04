import { PrismaClient } from '../../src/generated/prisma'

export async function seedTags(prisma: PrismaClient) {
  console.log('🏷️  Seeding tags...')

  // Get categories for referencing
  const shipCategory = await prisma.category.findUnique({ where: { slug: 'ships' } })
  const patchCategory = await prisma.category.findUnique({ where: { slug: 'patches' } })
  const locationCategory = await prisma.category.findUnique({ where: { slug: 'locations' } })
  const featureCategory = await prisma.category.findUnique({ where: { slug: 'features' } })
  const creatureCategory = await prisma.category.findUnique({ where: { slug: 'creatures' } })
  const eventCategory = await prisma.category.findUnique({ where: { slug: 'events' } })
  const newsletterCategory = await prisma.category.findUnique({ where: { slug: 'newsletter' } })

  if (!shipCategory || !patchCategory || !locationCategory || !featureCategory || !creatureCategory || !eventCategory || !newsletterCategory) {
    throw new Error('Categories must be seeded before tags')
  }

  // Get ship families for referencing
  const ironcladFamily = await prisma.shipFamily.findUnique({ where: { slug: 'ironclad' } })
  const apolloFamily = await prisma.shipFamily.findUnique({ where: { slug: 'apollo' } })

  if (!ironcladFamily || !apolloFamily) {
    throw new Error('Ship families must be seeded before tags')
  }

  const tags = [
    // Ship tags
    { name: 'Ironclad', slug: 'ironclad', categoryId: shipCategory.id, shipFamilyId: ironcladFamily.id, sortOrder: 1 },
    { name: 'Ironclad Assault', slug: 'ironclad-assault', categoryId: shipCategory.id, shipFamilyId: ironcladFamily.id, sortOrder: 2 },
    { name: 'Perseus', slug: 'perseus', categoryId: shipCategory.id, sortOrder: 3 },
    { name: 'Apollo Medivac', slug: 'apollo-medivac', categoryId: shipCategory.id, shipFamilyId: apolloFamily.id, sortOrder: 4 },
    { name: 'Apollo Triage', slug: 'apollo-triage', categoryId: shipCategory.id, shipFamilyId: apolloFamily.id, sortOrder: 5 },
    { name: 'Apollo Hermes', slug: 'apollo-hermes', categoryId: shipCategory.id, shipFamilyId: apolloFamily.id, sortOrder: 6 },

    // Creatures
    { name: 'Vanduul', slug: 'vanduul', categoryId: creatureCategory.id, sortOrder: 34 },
    { name: 'Yormandi', slug: 'yormandi', categoryId: creatureCategory.id, sortOrder: 35 },

    // Locations
    { name: 'Nyx', slug: 'nyx', categoryId: locationCategory.id, sortOrder: 37 },
    { name: 'Stanton', slug: 'stanton', categoryId: locationCategory.id, sortOrder: 38 },
    { name: 'Pyro', slug: 'pyro', categoryId: locationCategory.id, sortOrder: 40 },

    // Features
    { name: 'Medical Gameplay', slug: 'medical-gameplay', categoryId: featureCategory.id, description: 'Medical gameplay mechanics', sortOrder: 59 },
    { name: 'Cargo Gameplay', slug: 'cargo-gameplay', categoryId: featureCategory.id, description: 'Cargo gameplay mechanics', sortOrder: 60 },
    { name: 'Salvage Gameplay', slug: 'salvage-gameplay', categoryId: featureCategory.id, description: 'Salvage gameplay mechanics', sortOrder: 61 },
    { name: 'Engineering Gameplay', slug: 'engineering-gameplay', categoryId: featureCategory.id, description: 'Engineering gameplay mechanics', sortOrder: 62 },
    { name: 'Inventory Rework', slug: 'inventory-rework', categoryId: featureCategory.id, description: 'Inventory rework', sortOrder: 63 },

    // Patch tags
    { name: '4.3.1', slug: '4-3-1', categoryId: patchCategory.id, description: 'Star Citizen version 4.3.1', sortOrder: 76 },
    { name: '4.3.2', slug: '4-3-2', categoryId: patchCategory.id, description: 'Star Citizen version 4.3.2', sortOrder: 77 },

    // Events
    { name: 'Frontier Fighters Finale', slug: 'frontier-fighters-finale', categoryId: eventCategory.id, description: 'Frontier Fighters Finale', sortOrder: 80 },

    // Newsletter
    { name: 'Newsletter', slug: 'newsletter', categoryId: newsletterCategory.id, description: 'Weekly newsletter', sortOrder: 81 },
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