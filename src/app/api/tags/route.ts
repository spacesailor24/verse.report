import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const { name, categoryId } = await request.json();

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    if (!categoryId || typeof categoryId !== 'string') {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
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
        categoryId,
      },
    });

    if (existingTag) {
      return NextResponse.json({
        error: 'A tag with this name already exists in this category'
      }, { status: 409 });
    }

    // Get the highest sortOrder in this category
    const highestSortOrder = await prisma.tag.findFirst({
      where: { categoryId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    // Create the new tag
    const newTag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug,
        categoryId,
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