import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const transmissionId = params.id;

    // Verify the transmission exists and get current data
    const existingTransmission = await prisma.transmission.findUnique({
      where: { id: transmissionId },
      include: {
        transmissionTags: true,
      },
    });

    if (!existingTransmission) {
      return NextResponse.json({ error: 'Transmission not found' }, { status: 404 });
    }

    const { title, subtitle, content, sourceId, sourceUrl, type, publishedAt, tagIds } = await request.json();

    console.log('Updating transmission:', { transmissionId, title, subtitle, sourceId, type, publishedAt, tagIds });

    // Validate input
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!subtitle || typeof subtitle !== 'string') {
      return NextResponse.json({ error: 'Subtitle is required' }, { status: 400 });
    }

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

    // Update the transmission with tag relationships
    const updatedTransmission = await prisma.transmission.update({
      where: { id: transmissionId },
      data: {
        title: title.trim(),
        subTitle: subtitle.trim(),
        content: content?.trim() || null,
        sourceId: sourceId,
        sourceUrl: sourceUrl?.trim() || null,
        type,
        publishedAt: publishedDate,
        // Delete existing tag relationships and create new ones
        transmissionTags: {
          deleteMany: {},
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
      id: updatedTransmission.id,
      title: updatedTransmission.title,
      content: updatedTransmission.content || '',
      summary: updatedTransmission.subTitle,
      type: updatedTransmission.type,
      sourceId: updatedTransmission.source.id,
      sourceAuthor: updatedTransmission.source.name,
      sourceUrl: updatedTransmission.sourceUrl,
      publishedAt: updatedTransmission.publishedAt?.toISOString(),
      publisher: {
        id: updatedTransmission.publisher.id,
        name: updatedTransmission.publisher.name,
        email: updatedTransmission.publisher.email,
      },
      tags: updatedTransmission.transmissionTags.map((tagRelation) => ({
        id: tagRelation.tag.id,
        name: tagRelation.tag.name,
        slug: tagRelation.tag.slug,
        categorySlug: tagRelation.tag.category.slug,
      })),
    };

    return NextResponse.json({
      message: 'Transmission updated successfully',
      transmission: transformedTransmission,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating transmission:', error);

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