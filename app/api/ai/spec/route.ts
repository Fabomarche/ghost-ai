import { tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";
import type { generateSpecTask } from "@/trigger/generate-spec";
import { getCurrentUser, getProjectForUser } from "@/lib/project-access";
import { specTriggerRequestSchema } from "@/lib/spec-agent/schemas";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = specTriggerRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "roomId, chatHistory, nodes, and edges are required" },
      { status: 400 },
    );
  }

  const project = await getProjectForUser(parsed.data.roomId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const handle = await tasks.trigger<typeof generateSpecTask>("generate-spec", {
    projectId: project.id,
    roomId: parsed.data.roomId,
    chatHistory: parsed.data.chatHistory,
    nodes: parsed.data.nodes,
    edges: parsed.data.edges,
  });

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId: project.id,
      userId: user.userId,
    },
  });

  return NextResponse.json({ runId: handle.id });
}
