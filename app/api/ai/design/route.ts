import { tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";
import type { designAgentTask } from "@/trigger/design-agent";
import { getCurrentUser, getProjectByIdForUser } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

interface DesignRequestBody {
  prompt?: unknown;
  roomId?: unknown;
  projectId?: unknown;
}

function parseDesignBody(body: DesignRequestBody | null): {
  prompt: string;
  roomId: string;
  projectId: string;
} | null {
  if (!body) return null;

  const { prompt, roomId, projectId } = body;

  if (typeof prompt !== "string" || !prompt.trim()) return null;
  if (typeof roomId !== "string" || !roomId.trim()) return null;
  if (typeof projectId !== "string" || !projectId.trim()) return null;

  return {
    prompt: prompt.trim(),
    roomId: roomId.trim(),
    projectId: projectId.trim(),
  };
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: DesignRequestBody | null = null;

  try {
    body = (await request.json()) as DesignRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = parseDesignBody(body);

  if (!input) {
    return NextResponse.json(
      { error: "prompt, roomId, and projectId are required" },
      { status: 400 },
    );
  }

  const project = await getProjectByIdForUser(input.projectId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (project.roomId !== input.roomId) {
    return NextResponse.json(
      { error: "roomId does not match project" },
      { status: 400 },
    );
  }

  const handle = await tasks.trigger<typeof designAgentTask>("design-agent", {
    prompt: input.prompt,
    roomId: input.roomId,
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
