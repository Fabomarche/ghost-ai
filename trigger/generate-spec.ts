import { logger, metadata, schemaTask } from "@trigger.dev/sdk";
import { generateSpecContent } from "@/lib/spec-agent/generate-spec-content";
import { persistGeneratedSpec } from "@/lib/spec-agent/persist-spec";
import { generateSpecPayloadSchema } from "@/lib/spec-agent/schemas";

export const generateSpecTask = schemaTask({
  id: "generate-spec",
  schema: generateSpecPayloadSchema,
  run: async (payload) => {
    const { projectId, roomId, chatHistory, nodes, edges } = payload;

    logger.info("Spec generation started", {
      projectId,
      roomId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      chatMessageCount: chatHistory.length,
    });

    metadata
      .set("status", "starting")
      .set("progress", 0)
      .set("nodeCount", nodes.length)
      .set("edgeCount", edges.length);

    try {
      metadata.set("status", "generating").set("progress", 25);

      const spec = await generateSpecContent(chatHistory, nodes, edges);

      metadata.set("status", "persisting").set("progress", 75);

      const { specId } = await persistGeneratedSpec(projectId, spec);

      metadata.set("status", "completed").set("progress", 100);

      logger.info("Spec generation completed", {
        projectId,
        roomId,
        specId,
        contentLength: spec.length,
      });

      return { spec, specId };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";

      metadata.set("status", "failed").set("progress", 0).set("error", message);

      logger.error("Spec generation failed", {
        projectId,
        roomId,
        error: message,
      });

      throw error;
    }
  },
});
