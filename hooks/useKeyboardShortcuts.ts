"use client";

import { useEffect } from "react";
import type { ReactFlowInstance } from "@xyflow/react";

interface UseKeyboardShortcutsOptions {
  reactFlow: ReactFlowInstance;
  undo: () => void;
  redo: () => void;
}

function isEditableTarget(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts({
  reactFlow,
  undo,
  redo,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      const mod = e.metaKey || e.ctrlKey;

      if ((e.key === "+" || e.key === "=") && !mod) {
        e.preventDefault();
        reactFlow.zoomIn({ duration: 200 });
      } else if (e.key === "-" && !mod) {
        e.preventDefault();
        reactFlow.zoomOut({ duration: 200 });
      } else if (e.key === "z" && mod && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.key === "z" && mod && e.shiftKey) ||
        (e.key === "y" && mod)
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reactFlow, undo, redo]);
}
