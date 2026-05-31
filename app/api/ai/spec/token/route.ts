import { auth } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

interface TokenRequestBody {
  runId?: unknown;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: TokenRequestBody | null = null;

  try {
    body = (await request.json()) as TokenRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const runId = body?.runId;

  if (typeof runId !== "string" || !runId.trim()) {
    return NextResponse.json({ error: "runId is required" }, { status: 400 });
  }

  const taskRun = await prisma.taskRun.findFirst({
    where: {
      runId: runId.trim(),
      userId: user.userId,
    },
  });

  if (!taskRun) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const token = await auth.createPublicToken({
    scopes: {
      read: {
        runs: [taskRun.runId],
      },
    },
    expirationTime: "1h",
  });

  return NextResponse.json({ token });
}
