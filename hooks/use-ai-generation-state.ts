"use client";

import { useSelf, useOthers, useFeedMessages } from "@liveblocks/react/suspense";

import { AI_STATUS_FEED_ID } from "@/lib/liveblocks-constants";
import { parseAiStatusFeedMessage } from "@/types/tasks";

export function useAiGenerationState() {
  const self = useSelf();
  const isAnyoneThinking = useOthers((others) =>
    others.some((other) => other.presence.thinking === true),
  );
  const isGenerating = (self?.presence.thinking ?? false) || isAnyoneThinking;

  const { messages } = useFeedMessages(AI_STATUS_FEED_ID);

  const latestValidMessage = messages.find((message) =>
    parseAiStatusFeedMessage(message.data),
  );
  const statusText = latestValidMessage
    ? parseAiStatusFeedMessage(latestValidMessage.data)?.text
    : undefined;

  return { isGenerating, statusText };
}
