import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireEditor } from '@/lib/auth-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and authorization
    try {
      await requireEditor();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 });
      }
      throw error;
    }

    const { id: transmissionId } = await params;

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

    if (!type || !['OFFICIAL', 'LEAK', 'PREDICTION', 'COMMENTARY'].includes(type)) {
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

    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Don't expose internal error details to client
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and authorization
    try {
      await requireEditor();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 });
      }
      throw error;
    }

    const { id: transmissionId } = await params;

    // Verify the transmission exists
    const existingTransmission = await prisma.transmission.findUnique({
      where: { id: transmissionId },
    });

    if (!existingTransmission) {
      return NextResponse.json({ error: 'Transmission not found' }, { status: 404 });
    }

    console.log('Deleting transmission:', { transmissionId });

    // Delete the transmission (this will cascade delete related records)
    await prisma.transmission.delete({
      where: { id: transmissionId },
    });

    return NextResponse.json({
      message: 'Transmission deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting transmission:', error);

    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Don't expose internal error details to client
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}