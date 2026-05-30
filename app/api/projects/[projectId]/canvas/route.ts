import { get, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getProjectByIdForUser } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

interface CanvasPayload {
  nodes: unknown[];
  edges: unknown[];
}

function parseCanvasPayload(body: unknown): CanvasPayload | null {
  if (!body || typeof body !== "object") return null;

  const { nodes, edges } = body as Record<string, unknown>;
  if (!Array.isArray(nodes) || !Array.isArray(edges)) return null;

  return { nodes, edges };
}

async function parseRequestBody(request: Request): Promise<unknown | null> {
  const text = await request.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const project = await getProjectByIdForUser(projectId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await parseRequestBody(request);
  const canvas = parseCanvasPayload(body);

  if (!canvas) {
    return NextResponse.json({ error: "Invalid canvas payload" }, { status: 400 });
  }

  const blob = await put(`canvas/${projectId}.json`, JSON.stringify(canvas), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  });

  return NextResponse.json({ url: blob.url });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const project = await getProjectByIdForUser(projectId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!project.canvasJsonPath) {
    return NextResponse.json({ nodes: [], edges: [] });
  }

  const result = await get(project.canvasJsonPath, { access: "private" });

  if (!result || result.statusCode !== 200 || !result.stream) {
    return NextResponse.json(
      { error: "Failed to load canvas" },
      { status: 502 },
    );
  }

  const text = await new Response(result.stream).text();
  let canvas: CanvasPayload;

  try {
    canvas = JSON.parse(text) as CanvasPayload;
  } catch {
    return NextResponse.json(
      { error: "Failed to load canvas" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    nodes: Array.isArray(canvas.nodes) ? canvas.nodes : [],
    edges: Array.isArray(canvas.edges) ? canvas.edges : [],
  });
}
