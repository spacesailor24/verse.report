import { PrismaClient, TransmissionType, TransmissionStatus } from '../../src/generated/prisma'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

interface FrontMatter {
  title: string
  subTitle: string
  type: string
  tags: string[]
  publishedAt: string
  sourceAuthor: string
  sourceUrl: string | null
}

export async function seedTransmissions(prisma: PrismaClient, publisherId: string) {
  console.log('📡 Seeding transmissions...')

  // Map sourceAuthor strings to Source records
  const sourceAuthorMap: { [key: string]: number } = {
    'Terra Diplomatic Corps': 13, // Developer
    'UEE Navy': 13, // Developer
    'Anvil Aerospace': 13, // Developer
    'Roberts Space Industries': 13, // Developer
    'Origin Jumpworks': 13, // Developer
    'Aegis Dynamics': 13, // Developer
    'Drake Interplanetary': 13, // Developer
    'Crusader Industries': 13, // Developer
    'MISC': 13, // Developer
    'CIG': 13, // Developer
    'Star Citizen': 13, // Developer
    'CitizenCon': 2, // CitizenCon
    'ISC': 3, // ISC
    'Spectrum': 1, // Spectrum
    'PTU': 8, // PTU
    'Evocati': 7, // Evocati
    'Reddit': 9, // Reddit
    'Community Manager': 12, // Community Manager
    'Developer': 13, // Developer
  }

  // Helper function to get sourceId from sourceAuthor
  const getSourceId = (sourceAuthor: string): number => {
    return sourceAuthorMap[sourceAuthor] || 15 // Default to "Other" if not found
  }

  // Helper function to parse frontmatter from markdown
  const parseFrontMatter = (content: string): { frontMatter: FrontMatter; content: string } => {
    const lines = content.split('\n')
    if (lines[0] !== '---') {
      throw new Error('Invalid frontmatter format')
    }

    let frontMatterEnd = -1
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        frontMatterEnd = i
        break
      }
    }

    if (frontMatterEnd === -1) {
      throw new Error('Frontmatter not closed')
    }

    const frontMatterLines = lines.slice(1, frontMatterEnd)
    const contentLines = lines.slice(frontMatterEnd + 1)

    const frontMatter: any = {}
    let currentKey = ''
    let isArray = false

    for (const line of frontMatterLines) {
      if (line.startsWith('  - ')) {
        if (isArray && currentKey) {
          frontMatter[currentKey].push(line.substring(4))
        }
      } else if (line.includes(':')) {
        const [key, ...valueParts] = line.split(':')
        const value = valueParts.join(':').trim()
        currentKey = key.trim()

        if (value === '' && frontMatterLines[frontMatterLines.indexOf(line) + 1]?.startsWith('  - ')) {
          frontMatter[currentKey] = []
          isArray = true
        } else {
          frontMatter[currentKey] = value === 'null' ? null : value
          isArray = false
        }
      }
    }

    return {
      frontMatter: frontMatter as FrontMatter,
      content: contentLines.join('\n')
    }
  }

  // Read all transmission files
  const transmissionsDir = join(__dirname, 'content', 'transmissions')
  const files = readdirSync(transmissionsDir).filter(file => file.endsWith('.md'))

  console.log(`Found ${files.length} transmission files`)

  let createdCount = 0

  for (const file of files) {
    try {
      const filePath = join(transmissionsDir, file)
      const rawContent = readFileSync(filePath, 'utf-8')
      const { frontMatter, content } = parseFrontMatter(rawContent)

      // Map type string to enum
      const getTransmissionType = (type: string): TransmissionType => {
        const typeMap: Record<string, TransmissionType> = {
          'OFFICIAL': TransmissionType.OFFICIAL,
          'LEAK': TransmissionType.LEAK,
          'EVENT': TransmissionType.OFFICIAL,
        }
        return typeMap[type] || TransmissionType.LEAK
      }

      // Create transmission
      const transmission = await prisma.transmission.create({
        data: {
          title: frontMatter.title,
          subTitle: frontMatter.subTitle,
          content: content,
          type: getTransmissionType(frontMatter.type),
          status: TransmissionStatus.PUBLISHED,
          isHighlight: false,
          sourceId: getSourceId(frontMatter.sourceAuthor),
          sourceUrl: frontMatter.sourceUrl,
          publishedAt: new Date(frontMatter.publishedAt),
          publisherId: publisherId, // Assign to the specified user
        }
      })

      // Link tags to transmission
      for (const tagSlug of frontMatter.tags) {
        const tag = await prisma.tag.findUnique({ where: { slug: tagSlug } })
        if (tag) {
          await prisma.transmissionTag.create({
            data: {
              transmissionId: transmission.id,
              tagId: tag.id,
              confidence: 100,
            }
          })
        } else {
          console.warn(`Tag not found: ${tagSlug} for transmission: ${frontMatter.title}`)
        }
      }

      createdCount++
    } catch (error) {
      console.error(`Error processing ${file}:`, error)
    }
  }

  console.log(`✅ Created ${createdCount} transmissions with tags`)
}