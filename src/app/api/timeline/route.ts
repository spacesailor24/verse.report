import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch available dates from database
    const availableDates = await prisma.transmission.findMany({
      select: {
        publishedAt: true,
      },
      where: {
        publishedAt: {
          not: null
        }
      },
      distinct: ['publishedAt'],
      orderBy: {
        publishedAt: 'desc'
      }
    });

    // Group dates by year/month/day for efficient lookup
    const dateAvailability = availableDates.reduce((acc, transmission) => {
      if (!transmission.publishedAt) return acc

      const date = new Date(transmission.publishedAt)
      const year = date.getFullYear()
      const month = date.getMonth()
      const day = date.getDate()

      if (!acc[year]) acc[year] = {}
      if (!acc[year][month]) acc[year][month] = []
      if (!acc[year][month].includes(day)) {
        acc[year][month].push(day)
      }

      return acc
    }, {} as Record<number, Record<number, number[]>>);

    // Get available years for the dropdown
    const availableYears = Object.keys(dateAvailability)
      .map(Number)
      .sort((a, b) => b - a) // Newest first

    return NextResponse.json({
      availableYears,
      dateAvailability
    });
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}