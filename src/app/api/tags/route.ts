import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireEditor } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
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

    const { name, categoryId } = await request.json();

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // Convert categoryId to number if it's a string
    const categoryIdNum = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;

    if (isNaN(categoryIdNum)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryIdNum },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if tag with same slug already exists in this category
    const existingTag = await prisma.tag.findFirst({
      where: {
        slug,
        categoryId: categoryIdNum,
      },
    });

    if (existingTag) {
      return NextResponse.json({
        error: 'A tag with this name already exists in this category'
      }, { status: 409 });
    }

    // Get the highest sortOrder in this category
    const highestSortOrder = await prisma.tag.findFirst({
      where: { categoryId: categoryIdNum },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    // Create the new tag
    const newTag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug,
        categoryId: categoryIdNum,
        sortOrder: (highestSortOrder?.sortOrder ?? 0) + 1,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      message: 'Tag created successfully',
      tag: {
        id: newTag.id,
        name: newTag.name,
        slug: newTag.slug,
        sortOrder: newTag.sortOrder,
        shipFamily: null,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}