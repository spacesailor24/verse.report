import { PrismaClient } from '@/generated/prisma'
import TimelineClient from "./TimelineClient";

const prisma = new PrismaClient()

interface TimelineProps {
  onYearChange?: (year: number) => void;
  onMonthChange?: (month: number) => void;
  onDayChange?: (day: number) => void;
}

export default async function Timeline({
  onYearChange,
  onMonthChange,
  onDayChange,
}: TimelineProps) {
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
  })

  // Group dates by year/month/day for efficient lookup
  const dateAvailability = availableDates.reduce((acc, transmission) => {
    if (!transmission.publishedAt) return acc

    const date = new Date(transmission.publishedAt)
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    if (!acc[year]) acc[year] = {}
    if (!acc[year][month]) acc[year][month] = new Set()
    acc[year][month].add(day)

    return acc
  }, {} as Record<number, Record<number, Set<number>>>)

  // Get available years for the dropdown
  const availableYears = Object.keys(dateAvailability)
    .map(Number)
    .sort((a, b) => b - a) // Newest first

  return (
    <TimelineClient
      onYearChange={onYearChange}
      onMonthChange={onMonthChange}
      onDayChange={onDayChange}
      availableYears={availableYears}
      dateAvailability={dateAvailability}
    />
  );
}