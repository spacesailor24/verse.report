import { PrismaClient } from '@/generated/prisma'
import SidebarClient from './SidebarClient'

const prisma = new PrismaClient()

export default async function Sidebar() {
  const categories = await prisma.category.findMany({
    where: {
      tags: {
        some: {} // Only include categories that have at least one tag
      }
    },
    orderBy: { sortOrder: 'asc' },
    include: {
      tags: {
        orderBy: { sortOrder: 'asc' },
        include: {
          shipFamily: true
        }
      }
    }
  })

  return <SidebarClient initialCategories={categories} />
}
