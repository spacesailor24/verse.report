import { PrismaClient, TransmissionType, TransmissionStatus } from '../../src/generated/prisma'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

interface FrontMatter {
  title: string
  subTitle?: string
  type: string
  tags: string[]
  publishedAt: string
  sourceAuthor: string
  sourceUrl?: string | null
}

export async function seedTransmissions(prisma: PrismaClient, publisherId: string) {
  console.log('📡 Seeding transmissions...')

  // Helper function to get sourceId from sourceAuthor slug
  const getSourceId = async (sourceAuthorSlug: string): Promise<number> => {
    const source = await prisma.source.findUnique({
      where: { slug: sourceAuthorSlug }
    })

    if (!source) {
      console.warn(`Source not found for slug: ${sourceAuthorSlug}, using anonymous`)
      const anonymousSource = await prisma.source.findUnique({
        where: { slug: 'anonymous' }
      })
      return anonymousSource?.id || 1
    }

    return source.id
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
          'NEWSLETTER': TransmissionType.OFFICIAL,
          'PREDICTION': TransmissionType.PREDICTION,
          'COMMENTARY': TransmissionType.COMMENTARY,
        }
        return typeMap[type] || TransmissionType.LEAK
      }

      // Create transmission
      const sourceId = await getSourceId(frontMatter.sourceAuthor)

      const transmission = await prisma.transmission.create({
        data: {
          title: frontMatter.title,
          subTitle: frontMatter.subTitle || '',
          content: content.trim() || '',
          type: getTransmissionType(frontMatter.type),
          status: TransmissionStatus.PUBLISHED,
          isHighlight: false,
          sourceId: sourceId,
          sourceUrl: frontMatter.sourceUrl || null,
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