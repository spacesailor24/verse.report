import { PrismaClient } from '../../src/generated/prisma';

const prisma = new PrismaClient();

export async function seedRoles() {
  console.log('Seeding roles...');

  const roles = [
    {
      name: 'admin',
      description: 'Full system access and user management',
    },
    {
      name: 'editor',
      description: 'Can create, edit, and publish transmissions',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  console.log('✓ Roles seeded');
}