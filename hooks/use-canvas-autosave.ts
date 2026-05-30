"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export type CanvasSaveStatus = "idle" | "saving" | "saved" | "error";

interface UseCanvasAutosaveOptions {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  isLoading: boolean;
  onNodesChange: (changes: unknown[]) => void;
  onEdgesChange: (changes: unknown[]) => void;
}

interface CanvasSnapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

const AUTOSAVE_DEBOUNCE_MS = 1500;
const STATUS_RESET_MS = 2000;

function serializeCanvas(nodes: CanvasNode[], edges: CanvasEdge[]) {
  return JSON.stringify({ nodes, edges });
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  isLoading,
  onNodesChange,
  onEdgesChange,
}: UseCanvasAutosaveOptions) {
  const [status, setStatus] = useState<CanvasSaveStatus>("idle");
  const lastSavedRef = useRef("");
  const hasHydratedRef = useRef(false);
  const statusResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef(false);

  const clearStatusReset = useCallback(() => {
    if (statusResetRef.current) {
      clearTimeout(statusResetRef.current);
      statusResetRef.current = null;
    }
  }, []);

  const scheduleStatusReset = useCallback(() => {
    clearStatusReset();
    statusResetRef.current = setTimeout(() => {
      setStatus("idle");
      statusResetRef.current = null;
    }, STATUS_RESET_MS);
  }, [clearStatusReset]);

  const saveCanvas = useCallback(
    async (snapshotNodes: CanvasNode[], snapshotEdges: CanvasEdge[]) => {
      const serialized = serializeCanvas(snapshotNodes, snapshotEdges);
      if (serialized === lastSavedRef.current || saveInFlightRef.current) {
        return;
      }

      saveInFlightRef.current = true;
      clearStatusReset();
      setStatus("saving");

      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: serialized,
        });

        if (!response.ok) {
          throw new Error("Save failed");
        }

        lastSavedRef.current = serialized;
        setStatus("saved");
        scheduleStatusReset();
      } catch {
        setStatus("error");
        scheduleStatusReset();
      } finally {
        saveInFlightRef.current = false;
      }
    },
    [projectId, clearStatusReset, scheduleStatusReset],
  );

  const save = useCallback(async () => {
    await saveCanvas(nodes, edges);
  }, [nodes, edges, saveCanvas]);

  useEffect(() => {
    if (isLoading || hasHydratedRef.current) return;

    if (nodes.length > 0 || edges.length > 0) {
      lastSavedRef.current = serializeCanvas(nodes, edges);
      hasHydratedRef.current = true;
      return;
    }

    let cancelled = false;

    async function loadSavedCanvas() {
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`);
        if (!response.ok || cancelled) {
          hasHydratedRef.current = true;
          return;
        }

        const data = (await response.json()) as CanvasSnapshot;
        const savedNodes = Array.isArray(data.nodes) ? data.nodes : [];
        const savedEdges = Array.isArray(data.edges) ? data.edges : [];

        if (cancelled) return;

        if (nodes.length > 0 || edges.length > 0) {
          hasHydratedRef.current = true;
          return;
        }

        if (savedNodes.length === 0 && savedEdges.length === 0) {
          hasHydratedRef.current = true;
          return;
        }

        const addNodeChanges = savedNodes.map((node) => ({
          type: "add" as const,
          item: { ...node },
        }));
        const addEdgeChanges = savedEdges.map((edge) => ({
          type: "add" as const,
          item: { ...edge },
        }));

        onNodesChange(addNodeChanges);
        if (addEdgeChanges.length > 0) {
          onEdgesChange(addEdgeChanges);
        }

        lastSavedRef.current = serializeCanvas(savedNodes, savedEdges);
        hasHydratedRef.current = true;
      } catch {
        if (!cancelled) {
          hasHydratedRef.current = true;
        }
      }
    }

    void loadSavedCanvas();

    return () => {
      cancelled = true;
    };
  }, [isLoading, nodes, edges, projectId, onNodesChange, onEdgesChange]);

  useEffect(() => {
    if (isLoading || !hasHydratedRef.current) return;

    const serialized = serializeCanvas(nodes, edges);
    if (serialized === lastSavedRef.current) return;

    const timeoutId = setTimeout(() => {
      void saveCanvas(nodes, edges);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, isLoading, saveCanvas]);

  useEffect(() => {
    return () => {
      clearStatusReset();
    };
  }, [clearStatusReset]);

  return { status, save };
}
