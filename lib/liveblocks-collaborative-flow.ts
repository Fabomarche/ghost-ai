import { mutateFlow, type MutableFlow } from "@liveblocks/react-flow/node";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import { parseAiStatusFeedMessage } from "@/types/tasks";
import { getLiveblocksClient } from "@/lib/liveblocks";
import { AI_AGENT_USER_ID, AI_STATUS_FEED_ID } from "@/lib/liveblocks-constants";

export { AI_AGENT_USER_ID, AI_STATUS_FEED_ID };

const AI_AGENT_INFO = {
  name: "Ghost AI",
  avatar: "",
  color: "#6457f9",
} as const;

async function ensureFeed(roomId: string, feedId: string): Promise<void> {
  const client = getLiveblocksClient();

  try {
    await client.getFeed({ roomId, feedId });
  } catch {
    await client.createFeed({ roomId, feedId });
  }
}

export async function publishAiStatus(roomId: string, text: string): Promise<void> {
  const client = getLiveblocksClient();
  await ensureFeed(roomId, AI_STATUS_FEED_ID);

  const message = parseAiStatusFeedMessage({ text });
  if (!message) return;

  await client.createFeedMessage({
    roomId,
    feedId: AI_STATUS_FEED_ID,
    data: message,
  });
}

export async function setAiPresence(
  roomId: string,
  presence: { cursor: { x: number; y: number } | null; thinking: boolean },
  ttl = 30,
): Promise<void> {
  const client = getLiveblocksClient();

  await client.setPresence(roomId, {
    userId: AI_AGENT_USER_ID,
    data: presence,
    userInfo: AI_AGENT_INFO,
    ttl,
  });
}

export async function clearAiPresence(roomId: string): Promise<void> {
  await setAiPresence(roomId, { cursor: null, thinking: false }, 2);
}

export async function mutateCanvasFlow(
  callback: (flow: MutableFlow<CanvasNode, CanvasEdge>) => void | Promise<void>,
  roomId: string,
): Promise<void> {
  const client = getLiveblocksClient();

  await mutateFlow({ client, roomId }, callback);
}

export function flowPositionToCursor(
  position: { x: number; y: number },
  size: { width: number; height: number } = { width: 200, height: 100 },
): { x: number; y: number } {
  return {
    x: position.x + size.width / 2 + 120,
    y: position.y + size.height / 2 + 80,
  };
}
