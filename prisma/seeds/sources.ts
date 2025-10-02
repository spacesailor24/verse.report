import { PrismaClient } from '../../src/generated/prisma'

export async function seedSources(prisma: PrismaClient) {
  console.log('🌱 Seeding sources...')

  const sources = [
    {
      name: "Spectrum",
      slug: "spectrum",
      description: "Official Star Citizen community platform",
      sortOrder: 1
    },
    {
      name: "CitizenCon",
      slug: "citizencon",
      description: "Annual Star Citizen convention",
      sortOrder: 2
    },
    {
      name: "Inside Star Citizen",
      slug: "isc",
      description: "Video series from CIG",
      sortOrder: 3
    },
    {
      name: "Star Citizen Live",
      slug: "scl",
      description: "Live video series from CIG",
      sortOrder: 4
    },
    {
      name: "Evocati",
      slug: "evocati",
      description: "Leaks and information from the Evocati",
      sortOrder: 5
    },
    {
      name: "Reddit",
      slug: "reddit",
      description: "Posts from Reddit",
      sortOrder: 6
    },
    {
      name: "X",
      slug: "x",
      description: "Posts from X",
      sortOrder: 7
    },
    {
      name: "YouTube",
      slug: "youtube",
      description: "Video content and streams from YouTube",
      sortOrder: 8
    },
    {
      name: "Community Manager",
      slug: "community-manager",
      description: "Official CIG community manager posts",
      sortOrder: 9
    },
    {
      name: "Developer",
      slug: "developer",
      description: "Direct developer communications",
      sortOrder: 10
    },
    {
      name: "Data Mine",
      slug: "data-mine",
      description: "Information from a data miner",
      sortOrder: 11
    },
    {
      name: "Discord",
      slug: "discord",
      description: "Information from a Discord server",
      sortOrder: 12
    },
    {
      name: "Discord - Pipeline",
      slug: "discord-pipeline",
      description: "Information from the Pipeline Discord server",
      sortOrder: 13
    },
    {
      name: "Discord - Discussing Whatever",
      slug: "discord-discussing-whatever",
      description: "Information from the Discussing Whatever Discord server",
      sortOrder: 14
    },
    {
      name: "Anonymous",
      slug: "anonymous",
      description: "Information from an anonymous source",
      sortOrder: 15
    },
  ];

  for (const sourceData of sources) {
    await prisma.source.upsert({
      where: { slug: sourceData.slug },
      update: sourceData,
      create: sourceData,
    })
  }

  console.log(`✅ Created ${sources.length} sources`)
}