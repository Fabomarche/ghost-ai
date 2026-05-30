import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProjectForUser } from "@/lib/project-access";
import { getColorForUser, getLiveblocksClient, getOrCreateRoom } from "@/lib/liveblocks";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const roomId = body.room ?? body.roomId;

  if (!roomId || typeof roomId !== "string") {
    return NextResponse.json({ error: "roomId is required" }, { status: 400 });
  }

  const project = await getProjectForUser(roomId);

  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const room = await getOrCreateRoom(project.roomId);

  if (!room) {
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 },
    );
  }

  const user = await currentUser();
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Anonymous";
  const avatar = user?.imageUrl ?? "";
  const color = getColorForUser(userId);

  const liveblocks = getLiveblocksClient();

  const session = liveblocks.identifyUser(userId, {
    userInfo: {
      name,
      avatar,
      color,
    },
  });

  const { status, body: responseBody } = await session;

  return new Response(responseBody, { status });
}
