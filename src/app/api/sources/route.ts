import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const sources = await prisma.source.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" }
      ]
    });

    return NextResponse.json(
      {
        sources,
        total: sources.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error("Error fetching sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch sources" },
      { status: 500 }
    );
  }
}

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

    const { name, description } = await request.json();

    // Validate input
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Source name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Check if source with this name already exists
    const existingSource = await prisma.source.findUnique({
      where: { name: trimmedName },
    });

    if (existingSource) {
      return NextResponse.json({ error: "Source with this name already exists" }, { status: 409 });
    }

    // Generate slug from name
    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    // Check if slug already exists
    const existingSlugSource = await prisma.source.findUnique({
      where: { slug },
    });

    if (existingSlugSource) {
      return NextResponse.json({ error: "Source slug conflict" }, { status: 409 });
    }

    // Get the highest sort order and increment
    const lastSource = await prisma.source.findFirst({
      orderBy: { sortOrder: "desc" },
    });
    const nextSortOrder = (lastSource?.sortOrder || 0) + 1;

    // Create the source
    const newSource = await prisma.source.create({
      data: {
        name: trimmedName,
        slug,
        description: description?.trim() || null,
        sortOrder: nextSortOrder,
      },
    });

    return NextResponse.json({
      message: "Source created successfully",
      source: newSource,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating source:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}