import { task, logger } from "@trigger.dev/sdk";
import { generateDesignActions } from "@/lib/design-agent/generate-actions";
import { applyDesignActions, readCanvasState } from "@/lib/design-agent/apply-actions";
import {
  clearAiPresence,
  publishAiStatus,
  setAiPresence,
} from "@/lib/liveblocks-collaborative-flow";

export const designAgentTask = task({
  id: "design-agent",
  run: async (payload: { prompt: string; roomId: string }) => {
    const { prompt, roomId } = payload;

    logger.info("Design agent started", { roomId, promptLength: prompt.length });

    try {
      await publishAiStatus(roomId, "Starting design generation...");
      await setAiPresence(roomId, {
        cursor: { x: 480, y: 320 },
        thinking: true,
      });

      const canvas = await readCanvasState(roomId);

      await publishAiStatus(roomId, "Analyzing your request...");
      const actions = await generateDesignActions(prompt, canvas);

      if (actions.length === 0) {
        await publishAiStatus(roomId, "No canvas changes were needed.");
        await clearAiPresence(roomId);
        return { ok: true, actionCount: 0 };
      }

      await publishAiStatus(
        roomId,
        `Applying ${actions.length} change${actions.length === 1 ? "" : "s"} to the canvas...`,
      );

      await applyDesignActions(roomId, actions);

      await publishAiStatus(roomId, "Design complete!");
      await clearAiPresence(roomId);

      logger.info("Design agent completed", { roomId, actionCount: actions.length });

      return { ok: true, actionCount: actions.length };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";

      logger.error("Design agent failed", { roomId, error: message });

      try {
        await publishAiStatus(roomId, `Design generation failed: ${message}`);
        await clearAiPresence(roomId);
      } catch (cleanupError) {
        logger.error("Failed to publish design agent error status", {
          roomId,
          error:
            cleanupError instanceof Error
              ? cleanupError.message
              : "Unknown cleanup error",
        });
      }

      throw error;
    }
  },
});
