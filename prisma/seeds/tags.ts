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

  if (!shipCategory || !patchCategory || !locationCategory || !featureCategory || !creatureCategory || !eventCategory) {
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
    { name: 'Hammerhead', slug: 'hammerhead', categoryId: shipCategory.id, sortOrder: 4 },
    { name: 'Javelin', slug: 'javelin', categoryId: shipCategory.id, sortOrder: 5 },
    { name: 'Polaris', slug: 'polaris', categoryId: shipCategory.id, sortOrder: 6 },
    { name: 'Carrack', slug: 'carrack', categoryId: shipCategory.id, sortOrder: 7 },
    { name: 'Merchantman', slug: 'merchantman', categoryId: shipCategory.id, sortOrder: 8 },
    { name: 'Redeemer', slug: 'redeemer', categoryId: shipCategory.id, sortOrder: 9 },
    { name: 'Reclaimer', slug: 'reclaimer', categoryId: shipCategory.id, sortOrder: 10 },
    { name: 'Hull C', slug: 'hull-c', categoryId: shipCategory.id, sortOrder: 11 },
    { name: 'Hull A', slug: 'hull-a', categoryId: shipCategory.id, sortOrder: 12 },
    { name: 'Gladius', slug: 'gladius', categoryId: shipCategory.id, sortOrder: 13 },
    { name: 'Cutlass Black', slug: 'cutlass-black', categoryId: shipCategory.id, sortOrder: 14 },
    { name: 'Constellation', slug: 'constellation', categoryId: shipCategory.id, sortOrder: 15 },
    { name: 'Freelancer', slug: 'freelancer', categoryId: shipCategory.id, sortOrder: 16 },
    { name: '890 Jump', slug: '890-jump', categoryId: shipCategory.id, sortOrder: 17 },
    { name: 'Razor', slug: 'razor', categoryId: shipCategory.id, sortOrder: 18 },
    { name: 'Avenger', slug: 'avenger', categoryId: shipCategory.id, sortOrder: 19 },
    { name: 'Mustang', slug: 'mustang', categoryId: shipCategory.id, sortOrder: 20 },
    { name: 'Hornet', slug: 'hornet', categoryId: shipCategory.id, sortOrder: 21 },
    { name: 'Herald', slug: 'herald', categoryId: shipCategory.id, sortOrder: 22 },
    { name: 'Aurora', slug: 'aurora', categoryId: shipCategory.id, sortOrder: 23 },
    { name: 'Orion', slug: 'orion', categoryId: shipCategory.id, sortOrder: 24 },
    { name: 'Corvette', slug: 'corvette', categoryId: shipCategory.id, sortOrder: 25 },

    // Manufacturers
    { name: 'Aegis', slug: 'aegis', categoryId: shipCategory.id, sortOrder: 26 },
    { name: 'RSI', slug: 'rsi', categoryId: shipCategory.id, sortOrder: 27 },
    { name: 'MISC', slug: 'misc', categoryId: shipCategory.id, sortOrder: 28 },
    { name: 'Drake', slug: 'drake', categoryId: shipCategory.id, sortOrder: 29 },
    { name: 'Origin', slug: 'origin', categoryId: shipCategory.id, sortOrder: 30 },
    { name: 'Anvil', slug: 'anvil', categoryId: shipCategory.id, sortOrder: 31 },
    { name: 'Consolidated Outland', slug: 'consolidated-outland', categoryId: shipCategory.id, sortOrder: 32 },
    { name: 'Banu', slug: 'banu', categoryId: shipCategory.id, sortOrder: 33 },

    // Creatures
    { name: 'Space Whale', slug: 'space-whale', categoryId: creatureCategory.id, sortOrder: 34 },
    { name: 'Sand Worm', slug: 'sand-worm', categoryId: creatureCategory.id, sortOrder: 35 },

    // Locations
    { name: 'Nyx', slug: 'nyx', categoryId: locationCategory.id, description: 'Nyx star system', sortOrder: 36 },
    { name: 'Stanton', slug: 'stanton', categoryId: locationCategory.id, sortOrder: 37 },
    { name: 'Terra', slug: 'terra', categoryId: locationCategory.id, sortOrder: 38 },
    { name: 'Pyro', slug: 'pyro-gang', categoryId: locationCategory.id, sortOrder: 39 },
    { name: 'Crusader', slug: 'crusader', categoryId: locationCategory.id, sortOrder: 40 },
    { name: 'Hurston', slug: 'hurston', categoryId: locationCategory.id, sortOrder: 41 },
    { name: 'microTech', slug: 'microtech', categoryId: locationCategory.id, sortOrder: 42 },
    { name: 'ArcCorp', slug: 'arccorp', categoryId: locationCategory.id, sortOrder: 43 },
    { name: 'Area18', slug: 'area18', categoryId: locationCategory.id, sortOrder: 44 },
    { name: 'New Babbage', slug: 'new-babbage', categoryId: locationCategory.id, sortOrder: 45 },
    { name: 'Daymar', slug: 'daymar', categoryId: locationCategory.id, sortOrder: 46 },
    { name: 'Vega', slug: 'vega', categoryId: locationCategory.id, sortOrder: 47 },
    { name: 'Magnus', slug: 'magnus', categoryId: locationCategory.id, sortOrder: 48 },
    { name: 'Odin', slug: 'odin', categoryId: locationCategory.id, sortOrder: 49 },
    { name: 'Leir', slug: 'leir', categoryId: locationCategory.id, sortOrder: 50 },
    { name: 'Aaron Halo', slug: 'aaron-halo', categoryId: locationCategory.id, sortOrder: 51 },
    { name: 'Jericho', slug: 'jericho', categoryId: locationCategory.id, sortOrder: 52 },

    // Events
    { name: 'XenoThreat', slug: 'xenothreat', categoryId: eventCategory.id, sortOrder: 53 },
    { name: 'Nine Tails', slug: 'nine-tails', categoryId: eventCategory.id, sortOrder: 54 },
    { name: 'Luminalia', slug: 'luminalia', categoryId: eventCategory.id, sortOrder: 55 },
    { name: 'Racing', slug: 'racing', categoryId: eventCategory.id, sortOrder: 56 },
    { name: 'Terra Cup', slug: 'terra-cup', categoryId: eventCategory.id, sortOrder: 57 },
    { name: 'Championship', slug: 'championship', categoryId: eventCategory.id, sortOrder: 58 },

    // Features/Technologies
    { name: 'Medical Gameplay', slug: 'medical-gameplay', categoryId: featureCategory.id, description: 'Medical gameplay mechanics', sortOrder: 59 },
    { name: 'Quantum Drive', slug: 'quantum-drive', categoryId: featureCategory.id, sortOrder: 60 },
    { name: 'Quantum Storm', slug: 'quantum-storm', categoryId: featureCategory.id, sortOrder: 61 },
    { name: 'Mining', slug: 'mining', categoryId: featureCategory.id, sortOrder: 62 },
    { name: 'Salvage', slug: 'salvage', categoryId: featureCategory.id, sortOrder: 63 },
    { name: 'Cargo Hauling', slug: 'cargo-hauling', categoryId: featureCategory.id, sortOrder: 64 },
    { name: 'Piracy', slug: 'piracy', categoryId: featureCategory.id, sortOrder: 65 },
    { name: 'Anti-Piracy', slug: 'anti-piracy', categoryId: featureCategory.id, sortOrder: 66 },
    { name: 'UEE Navy', slug: 'uee-navy', categoryId: featureCategory.id, sortOrder: 67 },
    { name: 'Vanduul', slug: 'vanduul', categoryId: featureCategory.id, sortOrder: 68 },
    { name: 'Xi\'an', slug: 'xi-an', categoryId: featureCategory.id, sortOrder: 69 },
    { name: 'Ancient Technology', slug: 'ancient-technology', categoryId: featureCategory.id, sortOrder: 70 },
    { name: 'Archaeology', slug: 'archaeology', categoryId: featureCategory.id, sortOrder: 71 },
    { name: 'Xenobiology', slug: 'xenobiology', categoryId: featureCategory.id, sortOrder: 72 },
    { name: 'Deep Space', slug: 'deep-space', categoryId: featureCategory.id, sortOrder: 73 },
    { name: 'Trade', slug: 'trade', categoryId: featureCategory.id, sortOrder: 74 },
    { name: 'Diplomacy', slug: 'diplomacy', categoryId: featureCategory.id, sortOrder: 75 },

    // Patch tags
    { name: '4.3.1', slug: '4-3-1', categoryId: patchCategory.id, description: 'Star Citizen version 4.3.1', sortOrder: 76 },
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