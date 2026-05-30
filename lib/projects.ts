import { auth } from "@clerk/nextjs/server";
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
  const { userId } = await auth();
  if (!userId) return [];

  const collaborations = await prisma.projectCollaborator.findMany({
    where: { email: userId },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  return collaborations.map((c) => ({
    id: c.project.id,
    name: c.project.name,
    slug: c.project.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    createdAt: c.project.createdAt.toISOString(),
    isOwned: false,
  }));
}
