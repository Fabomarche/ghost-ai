"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Send, FileText, Download, Loader2 } from "lucide-react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import type { designAgentTask } from "@/trigger/design-agent";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAiChatFeed } from "@/hooks/use-ai-chat-feed";
import { useAiGenerationState } from "@/hooks/use-ai-generation-state";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  projectId: string;
}

const TERMINAL_RUN_STATUSES = new Set([
  "COMPLETED",
  "FAILED",
  "CANCELED",
  "CRASHED",
  "SYSTEM_FAILURE",
  "TIMED_OUT",
]);

function isActiveRunStatus(status: string | undefined): boolean {
  if (!status) return true;
  return !TERMINAL_RUN_STATUSES.has(status);
}

function formatCompletionMessage(
  run: NonNullable<ReturnType<typeof useRealtimeRun<typeof designAgentTask>>["run"]>,
): string {
  if (run.status === "FAILED") {
    return "Design generation failed. Please try again.";
  }

  const output = run.output;
  if (
    output &&
    typeof output === "object" &&
    "actionCount" in output &&
    typeof output.actionCount === "number"
  ) {
    if (output.actionCount === 0) {
      return "No canvas changes were needed.";
    }

    return `Design complete! Applied ${output.actionCount} change${output.actionCount === 1 ? "" : "s"} to the canvas.`;
  }

  return "Design complete!";
}

function formatChatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

export function AiSidebar({
  isOpen,
  onClose,
  roomId,
  projectId,
}: AiSidebarProps) {
  const [activeTab, setActiveTab] = useState("architect");
  const [inputValue, setInputValue] = useState("");
  const [runId, setRunId] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const completionHandledRef = useRef<string | null>(null);

  const { messages, sendMessage, sendAssistantMessage } = useAiChatFeed();
  const { isGenerating, statusText } = useAiGenerationState();

  const resetRunState = useCallback(() => {
    setRunId(null);
    setPublicToken(null);
    setIsTriggering(false);
  }, []);

  const handleRunComplete = useCallback(
    async (run: NonNullable<ReturnType<typeof useRealtimeRun<typeof designAgentTask>>["run"]>) => {
      if (completionHandledRef.current === run.id) return;
      completionHandledRef.current = run.id;

      try {
        await sendAssistantMessage(formatCompletionMessage(run));
      } catch {
        // sendError is set in useAiChatFeed
      } finally {
        resetRunState();
      }
    },
    [resetRunState, sendAssistantMessage],
  );

  const { run } = useRealtimeRun<typeof designAgentTask>(runId ?? undefined, {
    accessToken: publicToken ?? undefined,
    enabled: Boolean(runId && publicToken),
    onComplete: (completedRun) => {
      void handleRunComplete(completedRun);
    },
  });

  const isLocalRunActive =
    Boolean(runId && publicToken) && isActiveRunStatus(run?.status);
  const isRunActive = isLocalRunActive || isGenerating;
  const isInputDisabled = isRunActive || isTriggering;

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-slot='scroll-area-viewport']",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [inputValue]);

  const triggerDesign = async (prompt: string) => {
    const designResponse = await fetch("/api/ai/design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, roomId, projectId }),
    });

    if (!designResponse.ok) {
      const errorBody = (await designResponse.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(errorBody?.error ?? "Failed to start design generation.");
    }

    const designData = (await designResponse.json()) as {
      runId?: string;
      publicToken?: string;
    };

    if (!designData.runId) {
      throw new Error("Design generation did not return a run ID.");
    }

    if (designData.publicToken) {
      return {
        runId: designData.runId,
        publicToken: designData.publicToken,
      };
    }

    const tokenResponse = await fetch("/api/ai/design/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId: designData.runId }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to authorize run tracking.");
    }

    const tokenData = (await tokenResponse.json()) as { token?: string };

    if (!tokenData.token) {
      throw new Error("Run tracking did not return a token.");
    }

    return {
      runId: designData.runId,
      publicToken: tokenData.token,
    };
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isInputDisabled) return;

    setIsTriggering(true);
    completionHandledRef.current = null;

    try {
      await sendMessage(trimmed);
      setInputValue("");

      const { runId: nextRunId, publicToken: nextPublicToken } =
        await triggerDesign(trimmed);

      setRunId(nextRunId);
      setPublicToken(nextPublicToken);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to start design generation.";

      try {
        await sendAssistantMessage(message);
      } catch {
        // sendError is set in useAiChatFeed
      }

      resetRunState();
    } finally {
      setIsTriggering(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend(inputValue);
    }
  };

  const showEmptyState = messages.length === 0;

  return (
    <aside
      className={cn(
        "absolute top-14 bottom-4 right-4 z-40 flex w-80 flex-col rounded-3xl border border-surface-border bg-base/95 shadow-2xl backdrop-blur-md transition-all duration-300 ease-in-out",
        isOpen
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-[calc(100%+1.5rem)] opacity-0",
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-surface-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-dim">
            <Bot className="h-4 w-4 text-brand" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight text-copy-primary">
              AI Workspace
            </h2>
            <p className="text-[0.65rem] font-medium text-copy-muted">
              Collaborate with Ghost AI
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Close AI workspace"
          onClick={onClose}
          className="text-copy-muted hover:bg-subtle hover:text-copy-primary"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="shrink-0 px-3 pt-2">
          <TabsList className="w-full rounded-xl border border-surface-border/50 bg-subtle p-0.5">
            <TabsTrigger
              value="architect"
              className="flex-1 rounded-lg py-1.5 text-xs font-medium text-copy-muted transition-all data-active:bg-accent data-active:text-brand"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="flex-1 rounded-lg py-1.5 text-xs font-medium text-copy-muted transition-all data-active:bg-accent data-active:text-brand"
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="architect"
          className="mt-0 flex flex-1 flex-col overflow-hidden pt-2"
        >
          <ScrollArea ref={scrollAreaRef} className="min-h-0 flex-1 px-4">
            {showEmptyState ? (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-2 py-8 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-dim text-brand">
                  <Bot className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="mb-1 text-sm font-medium text-copy-primary">
                  AI System Architect
                </h3>
                <p className="mb-6 max-w-[240px] text-xs leading-relaxed text-copy-muted">
                  Describe your architecture to build or modify interactive
                  services right on your canvas.
                </p>

                <div className="flex w-full flex-col gap-2">
                  <span className="mb-1 px-1 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-copy-muted">
                    Suggested Starts
                  </span>
                  {STARTER_CHIPS.map((label) => (
                    <button
                      key={label}
                      type="button"
                      disabled={isInputDisabled}
                      onClick={() => void handleSend(label)}
                      className="w-full rounded-xl bg-subtle px-3 py-2 text-left text-xs font-medium text-ai-text transition-colors hover:bg-subtle-border/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 py-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex max-w-[85%] flex-col rounded-2xl p-3 text-xs leading-relaxed",
                      msg.role === "user"
                        ? "self-end rounded-br-none bg-brand text-primary-foreground"
                        : "self-start rounded-bl-none border border-surface-border bg-elevated text-copy-primary",
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[0.6rem] text-copy-faint">
                      <span
                        className={cn(
                          "font-medium",
                          msg.role === "user"
                            ? "text-primary-foreground/80"
                            : "text-copy-muted",
                        )}
                      >
                        {msg.sender}
                      </span>
                      <span
                        className={
                          msg.role === "user"
                            ? "text-primary-foreground/70"
                            : undefined
                        }
                      >
                        {formatChatTimestamp(msg.timestamp)}
                      </span>
                    </div>
                    <div className="break-words whitespace-pre-line">
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="shrink-0 border-t border-surface-border bg-base/50 p-3">
            {isRunActive ? (
              <div className="mb-2 flex items-center gap-2 rounded-lg border border-surface-border bg-elevated px-3 py-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                </span>
                <p className="truncate text-[0.65rem] font-medium text-ai-text">
                  {statusText ?? "AI is working…"}
                </p>
              </div>
            ) : null}

            <div className="relative flex items-end gap-1.5 rounded-xl border border-surface-border bg-subtle p-1.5 transition-colors focus-within:border-brand/50">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isInputDisabled}
                placeholder="Ask AI to design something..."
                rows={3}
                className="max-h-[160px] min-h-[72px] flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-xs text-copy-primary outline-none placeholder:text-copy-faint focus-visible:border-0 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                type="button"
                onClick={() => void handleSend(inputValue)}
                disabled={!inputValue.trim() || isInputDisabled}
                size="icon-sm"
                className="shrink-0 rounded-lg bg-brand text-primary-foreground hover:bg-brand/90 disabled:bg-subtle disabled:text-copy-faint"
              >
                {isRunActive || isTriggering ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <p className="mt-1.5 text-center text-[0.6rem] text-copy-faint">
              Enter sends, Shift+Enter for new line
            </p>
          </div>
        </TabsContent>

        <TabsContent
          value="specs"
          className="mt-0 flex flex-1 flex-col gap-4 overflow-hidden p-4 pt-2"
        >
          <Button
            type="button"
            className="w-full rounded-xl bg-brand py-2 text-xs font-semibold text-primary-foreground hover:bg-brand/90"
          >
            Generate Spec
          </Button>

          <div className="flex flex-col gap-3 rounded-xl border border-surface-border bg-elevated p-3.5 shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-dim text-brand">
                <FileText className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-xs font-semibold text-copy-primary">
                  system-architecture-spec.md
                </h4>
                <p className="text-[0.65rem] font-medium text-copy-faint">
                  Demo spec • 1.4 KB
                </p>
              </div>
            </div>

            <div className="relative h-24 overflow-hidden rounded-lg border border-surface-border/50 bg-subtle p-2.5 font-mono text-[0.65rem] leading-normal text-copy-secondary select-none">
              <div className="mb-1 font-bold text-copy-primary">
                # System Blueprint
              </div>
              <div>## 1. Overview</div>
              <div className="text-copy-muted">
                API Gateway distributes client web traffic...
              </div>
              <div>## 2. Active Services</div>
              <div className="text-copy-muted">- api-gateway [Port: 80]</div>
              <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-elevated to-transparent pointer-events-none" />
            </div>

            <Button
              disabled
              type="button"
              variant="outline"
              className="flex h-8 w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border-surface-border bg-subtle text-[0.7rem] text-copy-faint"
            >
              <Download className="h-3 w-3" />
              Download Markdown Spec
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
