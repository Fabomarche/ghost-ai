import { task } from "@trigger.dev/sdk";

export const designAgentTask = task({
  id: "design-agent",
  run: async (payload: { prompt: string; roomId: string }) => {
    console.log("Design agent received:", {
      prompt: payload.prompt,
      roomId: payload.roomId,
    });

    return {
      ok: true,
      prompt: payload.prompt,
      roomId: payload.roomId,
    };
  },
});
