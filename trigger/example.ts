import { task } from "@trigger.dev/sdk";

export const exampleTask = task({
  id: "example",
  run: async (payload: { message: string }) => {
    console.log("Trigger.dev is connected:", payload.message);
    return { ok: true, message: payload.message };
  },
});
