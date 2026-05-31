import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getProjectByIdForUser } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; specId: string }> },
) {
  const { projectId, specId } = await params;
  const project = await getProjectByIdForUser(projectId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const spec = await prisma.projectSpec.findFirst({
    where: { id: specId, projectId },
  });

  if (!spec) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await get(spec.filePath, { access: "private" });

  if (!result || result.statusCode !== 200 || !result.stream) {
    return NextResponse.json(
      { error: "Failed to load spec" },
      { status: 502 },
    );
  }

  const content = await new Response(result.stream).text();

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="spec-${specId}.md"`,
    },
  });
}
