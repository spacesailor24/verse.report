import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Decode base64 filter parameter
  let tagIds: number[] = [];
  let year: string | null = null;

  const filterParam = searchParams.get('filter');
  if (filterParam) {
    try {
      // Decode URL-safe base64 without padding
      const base64 = filterParam
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        + '='.repeat((4 - filterParam.length % 4) % 4);
      const filterJson = Buffer.from(base64, 'base64').toString('utf-8');
      const filters = JSON.parse(filterJson);

      if (filters.tags && Array.isArray(filters.tags)) {
        tagIds = filters.tags.filter((id: any) => typeof id === 'number' && !isNaN(id));
      }

      if (filters.year) {
        year = filters.year.toString();
      }
    } catch (error) {
      console.error('Error parsing filter parameter:', error);
    }
  }

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  try {
    let whereClause: any = {
      publishedAt: {
        not: null,
      },
    };

    // Add tag filtering if provided
    if (tagIds.length > 0) {
      whereClause.transmissionTags = {
        some: {
          tagId: {
            in: tagIds,
          },
        },
      };
    }

    // Add year filtering if provided
    if (year) {
      const yearInt = parseInt(year);
      const startOfYear = new Date(yearInt, 0, 1);
      const endOfYear = new Date(yearInt + 1, 0, 1);

      whereClause.publishedAt = {
        ...whereClause.publishedAt,
        gte: startOfYear,
        lt: endOfYear,
      };
    }

    // Get total count for pagination
    const totalCount = await prisma.transmission.count({
      where: whereClause,
    });

    // Get transmissions
    const transmissions = await prisma.transmission.findMany({
      where: whereClause,
      include: {
        transmissionTags: {
          include: {
            tag: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

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
        categorySlug: tagRelation.tag.category.slug,
      })),
    }));

    return NextResponse.json({
      transmissions: transformedTransmissions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching transmissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}