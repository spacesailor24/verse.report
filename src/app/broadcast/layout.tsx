import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function BroadcastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/');
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
    redirect('/');
  }

  return <>{children}</>;
}