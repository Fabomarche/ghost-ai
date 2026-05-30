"use client";

import { createContext, useContext } from "react";

interface CanvasActions {
  onNodeDataChange: (id: string, data: Record<string, unknown>) => void;
}

export const CanvasActionsContext = createContext<CanvasActions | null>(null);

export function useCanvasActions() {
  const ctx = useContext(CanvasActionsContext);
  if (!ctx) throw new Error("useCanvasActions must be used within CanvasActionsContext");
  return ctx;
}
