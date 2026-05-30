import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enrichCollaboratorEmails, getClerkUser } from "@/lib/clerk";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    const isCollaborator = project.collaborators.some(
      (c) => c.email === userId,
    );
    if (!isCollaborator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const emails = project.collaborators.map((c) => c.email);
  const enriched = await enrichCollaboratorEmails(emails);

  const collaborators = project.collaborators.map((c) => {
    const user = enriched.get(c.email);
    return {
      id: c.id,
      email: c.email,
      name: user?.name ?? null,
      imageUrl: user?.imageUrl ?? null,
      isOwner: false,
      createdAt: c.createdAt.toISOString(),
    };
  });

  const ownerUser = await getClerkUser(project.ownerId);

  collaborators.unshift({
    id: "owner",
    email: ownerUser?.email ?? project.ownerId,
    name: ownerUser?.name ?? null,
    imageUrl: ownerUser?.imageUrl ?? null,
    isOwner: true,
    createdAt: project.createdAt.toISOString(),
  });

  return NextResponse.json(collaborators);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const email = body.email?.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const currentUserEmail = sessionClaims?.email_address as string | undefined;
  if (email === currentUserEmail) {
    return NextResponse.json(
      { error: "Cannot add yourself as a collaborator" },
      { status: 400 },
    );
  }

  const existing = await prisma.projectCollaborator.findUnique({
    where: {
      projectId_email: { projectId, email },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Collaborator already exists" },
      { status: 409 },
    );
  }

  const collaborator = await prisma.projectCollaborator.create({
    data: { projectId, email },
  });

  return NextResponse.json(
    {
      id: collaborator.id,
      email: collaborator.email,
      createdAt: collaborator.createdAt.toISOString(),
    },
    { status: 201 },
  );
}
