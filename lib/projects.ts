import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getOwnedProjects() {
  const { userId } = await auth();
  if (!userId) return [];

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return projects.map((p) => ({
    id: p.id,
    roomId: p.roomId,
    name: p.name,
    slug: p.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    createdAt: p.createdAt.toISOString(),
    isOwned: true,
  }));
}

export async function getSharedProjects() {
  const user = await currentUser();
  if (!user) return [];

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return [];

  const collaborations = await prisma.projectCollaborator.findMany({
    where: { email: email.toLowerCase() },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  return collaborations.map((c) => ({
    id: c.project.id,
    roomId: c.project.roomId,
    name: c.project.name,
    slug: c.project.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    createdAt: c.project.createdAt.toISOString(),
    isOwned: false,
  }));
}
