import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#00c8d4",
  "#6457f9",
  "#ff990a",
  "#ff6166",
  "#f75f8f",
  "#62c073",
  "#0ac7b4",
  "#fbbf24",
] as const;

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getColorForUser(userId: string): string {
  const index = hashCode(userId) % CURSOR_COLORS.length;
  return CURSOR_COLORS[index];
}

let liveblocksClient: Liveblocks | null = null;

export function getLiveblocksClient(): Liveblocks {
  if (!liveblocksClient) {
    liveblocksClient = new Liveblocks({
      secret: process.env.LIVEBLOCKS_SECRET_KEY!,
    });
  }
  return liveblocksClient;
}

export async function getOrCreateRoom(roomId: string) {
  const client = getLiveblocksClient();

  try {
    const room = await client.getOrCreateRoom(roomId, {
      defaultAccesses: ["room:write"],
      metadata: {},
    });
    return room;
  } catch {
    return null;
  }
}
