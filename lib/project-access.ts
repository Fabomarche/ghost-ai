import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return { userId };
}

export async function getProjectForUser(roomId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress?.toLowerCase();

  const project = await prisma.project.findUnique({
    where: { roomId },
    include: { collaborators: true },
  });

  if (!project) return null;

  const isOwner = project.ownerId === userId;
  const isCollaborator = email
    ? project.collaborators.some((c) => c.email === email)
    : false;

  if (!isOwner && !isCollaborator) return null;

  return {
    id: project.id,
    roomId: project.roomId,
    name: project.name,
    isOwner,
  };
}
