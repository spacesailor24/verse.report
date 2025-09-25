import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Decode base64 filter parameter
  let tagIds: number[] = [];
  let year: string | null = null;
  let publisherId: string | null = null;

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

      if (filters.publisherId) {
        publisherId = filters.publisherId;
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

    // Add publisher filtering if provided
    if (publisherId) {
      whereClause.publisherId = publisherId;
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
        publisher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        source: {
          select: {
            id: true,
            name: true,
            slug: true,
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
      sourceAuthor: transmission.source.name,
      sourceUrl: transmission.sourceUrl,
      publishedAt: transmission.publishedAt?.toISOString(),
      publisher: {
        id: transmission.publisher.id,
        name: transmission.publisher.name,
        email: transmission.publisher.email,
      },
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin or editor role
    const userWithRoles = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    const hasEditPermission = userWithRoles?.userRoles.some(
      (ur) => ur.role.name === 'admin' || ur.role.name === 'editor'
    );

    if (!hasEditPermission) {
      return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 });
    }

    const { title, subtitle, content, sourceId, sourceUrl, type, publishedAt, tagIds } = await request.json();

    console.log('Received transmission data:', { title, subtitle, sourceId, type, publishedAt, tagIds });

    // Validate input
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!subtitle || typeof subtitle !== 'string') {
      return NextResponse.json({ error: 'Subtitle is required' }, { status: 400 });
    }

    // Content is optional now

    if (!sourceId || typeof sourceId !== 'number') {
      return NextResponse.json({ error: 'Source ID is required' }, { status: 400 });
    }

    if (!type || !['OFFICIAL', 'LEAK', 'PREDICTION'].includes(type)) {
      return NextResponse.json({ error: 'Valid type is required' }, { status: 400 });
    }

    if (!publishedAt || typeof publishedAt !== 'string') {
      return NextResponse.json({ error: 'Published date is required' }, { status: 400 });
    }

    // Validate publishedAt is a valid date
    const publishedDate = new Date(publishedAt);
    if (isNaN(publishedDate.getTime())) {
      return NextResponse.json({ error: 'Published date must be a valid date' }, { status: 400 });
    }

    // Validate tagIds if provided
    let validatedTagIds: number[] = [];
    if (tagIds && Array.isArray(tagIds)) {
      // Convert string IDs to numbers and filter out invalid ones
      const numericTagIds = tagIds
        .map(id => typeof id === 'string' ? parseInt(id, 10) : id)
        .filter(id => typeof id === 'number' && !isNaN(id));

      if (numericTagIds.length > 0) {
        // Ensure all tagIds exist in the database
        const tags = await prisma.tag.findMany({
          where: {
            id: {
              in: numericTagIds,
            },
          },
          select: {
            id: true,
          },
        });
        validatedTagIds = tags.map(tag => tag.id);
      }
    }

    // Create the transmission with tag relationships
    const newTransmission = await prisma.transmission.create({
      data: {
        title: title.trim(),
        subTitle: subtitle.trim(),
        content: content?.trim() || null,
        sourceId: sourceId,
        sourceUrl: sourceUrl?.trim() || null,
        type,
        status: 'PUBLISHED',
        publishedAt: publishedDate,
        publisherId: session.user.id,
        transmissionTags: {
          create: validatedTagIds.map(tagId => ({
            tagId,
          })),
        },
      },
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
        publisher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        source: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Transform the data to match our component interface
    const transformedTransmission = {
      id: newTransmission.id,
      title: newTransmission.title,
      content: newTransmission.content || '',
      summary: newTransmission.subTitle,
      type: newTransmission.type,
      sourceAuthor: newTransmission.source.name,
      sourceUrl: newTransmission.sourceUrl,
      publishedAt: newTransmission.publishedAt?.toISOString(),
      publisher: {
        id: newTransmission.publisher.id,
        name: newTransmission.publisher.name,
        email: newTransmission.publisher.email,
      },
      tags: newTransmission.transmissionTags.map((tagRelation) => ({
        id: tagRelation.tag.id,
        name: tagRelation.tag.name,
        slug: tagRelation.tag.slug,
        categorySlug: tagRelation.tag.category.slug,
      })),
    };

    return NextResponse.json({
      message: 'Transmission created successfully',
      transmission: transformedTransmission,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transmission:', error);

    // More specific error handling
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}