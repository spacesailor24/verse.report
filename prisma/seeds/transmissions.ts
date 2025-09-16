import { PrismaClient, TransmissionType, TransmissionStatus } from '../../src/generated/prisma'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function seedTransmissions(prisma: PrismaClient) {
  console.log('📡 Seeding transmissions...')

  // Get some tags for linking
  const ironcladAssaultTag = await prisma.tag.findUnique({ where: { slug: 'ironclad-assault' } })
  const patch431Tag = await prisma.tag.findUnique({ where: { slug: '4-3-1' } })
  const nyxTag = await prisma.tag.findUnique({ where: { slug: 'nyx' } })

  if (!ironcladAssaultTag || !patch431Tag || !nyxTag) {
    throw new Error('Tags must be seeded before transmissions')
  }

  // Helper function to read markdown content
  const readMarkdownContent = (filename: string): string => {
    const filePath = join(__dirname, 'content', 'transmissions', filename)
    return readFileSync(filePath, 'utf-8')
  }

  const transmissions = [
    {
      title: 'Ironclad Assault Ship Unveiled',
      subTitle: 'Drake reveals new heavy assault ship designed for ground operations',
      content: readMarkdownContent('ironclad-assault-unveiled.md'),
      type: TransmissionType.OFFICIAL,
      status: TransmissionStatus.PUBLISHED,
      isHighlight: true,
      sourceAuthor: 'Cloud Imperium Games',
      sourceUrl: 'https://robertsspaceindustries.com/ironclad',
      publishedAt: new Date('2024-01-15T10:00:00Z'),
    },
    {
      title: 'Patch 4.3.1 PU Release Notes',
      subTitle: 'Latest update brings the Apollo Triage and Medivac',
      content: readMarkdownContent('patch-4-3-1-release.md'),
      type: TransmissionType.OFFICIAL,
      status: TransmissionStatus.PUBLISHED,
      isHighlight: false,
      sourceAuthor: 'CIG Development Team',
      sourceUrl: 'https://robertsspaceindustries.com/spectrum/community/SC/forum/190048/thread/star-citizen-alpha-4-3-1-live',
      publishedAt: new Date('2024-01-20T14:30:00Z'),
    },
    {
      title: 'Nyx System Jump Point Discovered',
      subTitle: 'Community discovers jump point location to Nyx system',
      content: readMarkdownContent('nyx-jump-point-discovered.md'),
      type: TransmissionType.LEAK,
      status: TransmissionStatus.PUBLISHED,
      isHighlight: true,
      sourceAuthor: 'SCLeaks',
      sourceUrl: null,
      publishedAt: new Date('2024-01-22T09:15:00Z'),
    },
  ]

  // Create transmissions and link tags
  let index = 0
  for (const transmission of transmissions) {
    // Always create fresh data in seed file
    const created = await prisma.transmission.create({
      data: transmission
    })

    // Link tags to transmissions based on index
    if (index === 0) { // First transmission - Ironclad
      await prisma.transmissionTag.create({
        data: {
          transmissionId: created.id,
          tagId: ironcladAssaultTag.id,
          confidence: 100,
        },
      })
    }

    if (index === 1) { // Second transmission - Patch
      await prisma.transmissionTag.create({
        data: {
          transmissionId: created.id,
          tagId: patch431Tag.id,
          confidence: 100,
        },
      })
    }

    if (index === 2) { // Third transmission - Nyx
      await prisma.transmissionTag.create({
        data: {
          transmissionId: created.id,
          tagId: nyxTag.id,
          confidence: 100,
        },
      })
    }

    index++
  }

  console.log(`✅ Created ${transmissions.length} transmissions with tags`)
}