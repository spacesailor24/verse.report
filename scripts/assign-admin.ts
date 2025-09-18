#!/usr/bin/env tsx

/**
 * Script to assign admin role to a user
 * Usage: npx tsx scripts/assign-admin.ts <user-email-or-id>
 */

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function assignAdminRole(userEmailOrId: string) {
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

    // Check if user already has admin role
    const hasAdmin = user.userRoles.some(ur => ur.role.name === 'admin');
    if (hasAdmin) {
      console.log(`✅ User ${user.name} (${user.email}) already has admin role`);
      return;
    }

    // Find admin role
    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      console.error('❌ Admin role not found in database');
      process.exit(1);
    }

    // Assign admin role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: adminRole.id,
      },
    });

    console.log(`✅ Successfully assigned admin role to ${user.name} (${user.email})`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Current roles: ${user.userRoles.map(ur => ur.role.name).join(', ')}, admin`);

  } catch (error) {
    console.error('❌ Error assigning admin role:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line argument
const userEmailOrId = process.argv[2];

if (!userEmailOrId) {
  console.log('Usage: npx tsx scripts/assign-admin.ts <user-email-or-id>');
  console.log('');
  console.log('Examples:');
  console.log('  npx tsx scripts/assign-admin.ts user@example.com');
  console.log('  npx tsx scripts/assign-admin.ts clx1abc123def');
  process.exit(1);
}

assignAdminRole(userEmailOrId);