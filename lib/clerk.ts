import { createClerkClient } from "@clerk/backend";

let clerkClient: ReturnType<typeof createClerkClient> | null = null;

export function getClerkClient() {
  if (!clerkClient) {
    clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }
  return clerkClient;
}

export interface EnrichedCollaborator {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
}

export async function enrichCollaboratorEmails(
  emails: string[],
): Promise<Map<string, EnrichedCollaborator>> {
  const client = getClerkClient();
  const result = new Map<string, EnrichedCollaborator>();

  const enriched = await Promise.allSettled(
    emails.map(async (email) => {
      const response = await client.users.getUserList({
        emailAddress: [email],
        limit: 1,
      });
      const user = response.data[0];
      return {
        email,
        id: user?.id ?? email,
        name: user
          ? [user.firstName, user.lastName].filter(Boolean).join(" ") || null
          : null,
        imageUrl: user?.imageUrl ?? null,
      };
    }),
  );

  for (const item of enriched) {
    if (item.status === "fulfilled") {
      result.set(item.value.email, item.value);
    }
  }

  return result;
}

export async function getClerkUser(
  userId: string,
): Promise<EnrichedCollaborator | null> {
  try {
    const client = getClerkClient();
    const user = await client.users.getUser(userId);
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? userId,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
      imageUrl: user.imageUrl ?? null,
    };
  } catch {
    return null;
  }
}
