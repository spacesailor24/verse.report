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
      name: "ISC (Inside Star Citizen)",
      slug: "isc",
      description: "Weekly video series from CIG",
      sortOrder: 3
    },
    {
      name: "Calling All Devs",
      slug: "calling-all-devs",
      description: "Developer Q&A video series",
      sortOrder: 4
    },
    {
      name: "Star Citizen Live",
      slug: "star-citizen-live",
      description: "Live developer streaming show",
      sortOrder: 5
    },
    {
      name: "Around the Verse",
      slug: "around-the-verse",
      description: "Weekly development update show (archived)",
      sortOrder: 6
    },
    {
      name: "Evocati",
      slug: "evocati",
      description: "Closed testing group leaks",
      sortOrder: 7
    },
    {
      name: "PTU",
      slug: "ptu",
      description: "Public Test Universe",
      sortOrder: 8
    },
    {
      name: "Reddit",
      slug: "reddit",
      description: "Community discussions and leaks",
      sortOrder: 9
    },
    {
      name: "Twitter/X",
      slug: "twitter",
      description: "Social media updates and announcements",
      sortOrder: 10
    },
    {
      name: "YouTube",
      slug: "youtube",
      description: "Video content and streams",
      sortOrder: 11
    },
    {
      name: "Community Manager",
      slug: "community-manager",
      description: "Official CIG community manager posts",
      sortOrder: 12
    },
    {
      name: "Developer",
      slug: "developer",
      description: "Direct developer communications",
      sortOrder: 13
    },
    {
      name: "Data Mining",
      slug: "data-mining",
      description: "Game file analysis discoveries",
      sortOrder: 14
    },
    {
      name: "Other",
      slug: "other",
      description: "Miscellaneous sources",
      sortOrder: 15
    }
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