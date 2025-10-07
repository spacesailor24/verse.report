#!/usr/bin/env tsx

/**
 * Script to assign editor role to a user
 * Usage: npx tsx scripts/assign-editor.ts <user-email-or-id>
 */

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function assignEditorRole(userEmailOrId: string) {
  try {
    // First, try to find user by email, then by ID
    let user = await prisma.user.findUnique({
      where: { email: userEmailOrId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: userEmailOrId },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    }

    if (!user) {
      console.error(`❌ User not found: ${userEmailOrId}`);
      process.exit(1);
    }

    // Check if user already has editor role
    const hasEditor = user.userRoles.some(ur => ur.role.name === 'editor');
    if (hasEditor) {
      console.log(`✅ User ${user.name} (${user.email}) already has editor role`);
      return;
    }

    // Find editor role
    const editorRole = await prisma.role.findUnique({
      where: { name: 'editor' },
    });

    if (!editorRole) {
      console.error('❌ Editor role not found in database');
      process.exit(1);
    }

    // Assign editor role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: editorRole.id,
      },
    });

    console.log(`✅ Successfully assigned editor role to ${user.name} (${user.email})`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Current roles: ${user.userRoles.map(ur => ur.role.name).join(', ')}, editor`);

  } catch (error) {
    console.error('❌ Error assigning editor role:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line argument
const userEmailOrId = process.argv[2];

if (!userEmailOrId) {
  console.log('Usage: npx tsx scripts/assign-editor.ts <user-email-or-id>');
  console.log('');
  console.log('Examples:');
  console.log('  npx tsx scripts/assign-editor.ts user@example.com');
  console.log('  npx tsx scripts/assign-editor.ts clx1abc123def');
  process.exit(1);
}

assignEditorRole(userEmailOrId);