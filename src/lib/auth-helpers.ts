import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Checks if the current user has editor or admin permissions
 * @throws Error with status-appropriate message if unauthorized
 * @returns The user object with roles
 */
export async function requireEditor() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

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
    throw new Error('Forbidden');
  }

  return { user: userWithRoles, userId: session.user.id };
}

/**
 * Checks if the current user has admin permissions
 * @throws Error with status-appropriate message if unauthorized
 * @returns The user object with roles
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

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

  const isAdmin = userWithRoles?.userRoles.some(
    (ur) => ur.role.name === 'admin'
  );

  if (!isAdmin) {
    throw new Error('Forbidden');
  }

  return { user: userWithRoles, userId: session.user.id };
}
