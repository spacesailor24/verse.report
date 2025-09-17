import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const day = searchParams.get('day');

  try {
    let transmissions;

    if (year && month && day) {
      // Create date range for the selected day
      const startDate = new Date(parseInt(year), parseInt(month), parseInt(day));
      const endDate = new Date(parseInt(year), parseInt(month), parseInt(day) + 1);

      transmissions = await prisma.transmission.findMany({
        where: {
          publishedAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          transmissionTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
      });
    } else {
      // Get most recent 20 transmissions
      transmissions = await prisma.transmission.findMany({
        where: {
          publishedAt: {
            not: null,
          },
        },
        include: {
          transmissionTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: 20,
      });
    }

    // Transform the data to match our component interface
    const transformedTransmissions = transmissions.map((transmission) => ({
      id: transmission.id,
      title: transmission.title,
      content: transmission.content || '',
      summary: transmission.subTitle,
      type: transmission.type,
      sourceAuthor: transmission.sourceAuthor,
      sourceUrl: transmission.sourceUrl,
      publishedAt: transmission.publishedAt?.toISOString(),
      tags: transmission.transmissionTags.map((tagRelation) => ({
        id: tagRelation.tag.id,
        name: tagRelation.tag.name,
        slug: tagRelation.tag.slug,
        color: tagRelation.tag.color,
      })),
    }));

    return NextResponse.json({ transmissions: transformedTransmissions });
  } catch (error) {
    console.error('Error fetching transmissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}