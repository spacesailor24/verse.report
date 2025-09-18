import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}