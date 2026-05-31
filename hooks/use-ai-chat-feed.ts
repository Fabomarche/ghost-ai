"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useCreateFeed,
  useCreateFeedMessage,
  useFeedMessages,
  useSelf,
} from "@liveblocks/react/suspense";

import { AI_CHAT_FEED_ID } from "@/lib/liveblocks-constants";
import {
  parseAiChatFeedMessage,
  type AiChatFeedMessage,
} from "@/types/tasks";

export type AiChatMessage = AiChatFeedMessage & { id: string };

export function useAiChatFeed() {
  const [sendError, setSendError] = useState<string | null>(null);
  const [feedReady, setFeedReady] = useState(false);
  const createFeed = useCreateFeed();
  const createFeedMessage = useCreateFeedMessage();
  const { messages } = useFeedMessages(AI_CHAT_FEED_ID);
  const self = useSelf();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await createFeed(AI_CHAT_FEED_ID);
      } catch {
        // Feed may already exist.
      }
      if (!cancelled) {
        setFeedReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [createFeed]);

  const chatMessages = useMemo(
    () =>
      messages
        .map((message) => {
          const data = parseAiChatFeedMessage(message.data);
          if (!data) return null;
          return { id: message.id, ...data };
        })
        .filter((message): message is AiChatMessage => message !== null),
    [messages],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      setSendError(null);

      const sender = self?.info.name?.trim() || self?.id || "Anonymous";
      const payload: AiChatFeedMessage = {
        sender,
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      try {
        if (!feedReady) {
          await createFeed(AI_CHAT_FEED_ID);
        }
        await createFeedMessage(AI_CHAT_FEED_ID, payload);
      } catch {
        setSendError("Failed to send message. Try again.");
        throw new Error("send_failed");
      }
    },
    [createFeed, createFeedMessage, feedReady, self],
  );

  return { messages: chatMessages, sendMessage, sendError };
}
