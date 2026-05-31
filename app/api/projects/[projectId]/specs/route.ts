import { NextResponse } from "next/server";
import { getProjectByIdForUser } from "@/lib/project-access";
import { getSpecFilename } from "@/lib/spec-filename";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const project = await getProjectByIdForUser(projectId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    specs.map((spec) => ({
      id: spec.id,
      createdAt: spec.createdAt.toISOString(),
      filename: getSpecFilename(spec.id),
    })),
  );
}
