"use client";

import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow,
  MarkerType,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { useUndo, useRedo, useUpdateMyPresence } from "@liveblocks/react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { Component, type ReactNode, useCallback, useState, useEffect } from "react";

import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

import { CanvasNodeRenderer } from "@/components/editor/canvas-node";
import { CanvasEdge } from "@/components/editor/canvas-edge";
import { ShapePanel } from "@/components/editor/shape-panel";
import { ShapeDragPreview } from "@/components/editor/shape-drag-preview";
import { CanvasActionsContext } from "@/components/editor/canvas-actions";
import { NodeColorToolbar } from "@/components/editor/node-color-toolbar";
import { CanvasControlBar } from "@/components/editor/canvas-control-bar";
import { PresenceAvatars } from "@/components/editor/presence-avatars";
import { LiveCursors } from "@/components/editor/live-cursors";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  useCanvasAutosave,
  type CanvasSaveStatus,
} from "@/hooks/use-canvas-autosave";
import { NODE_COLORS, SHAPE_DEFAULT_SIZES } from "@/types/canvas";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

const nodeTypes = {
  canvasNode: CanvasNodeRenderer,
};

const edgeTypes = {
  canvasEdge: CanvasEdge,
};

const defaultEdgeOptions = {
  type: "canvasEdge",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "var(--text-muted)",
    width: 16,
    height: 16,
  },
  style: {
    stroke: "var(--text-muted)",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
  },
};

let nodeCounter = 0;

class LiveblocksErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function CanvasErrorFallback() {
  return (
    <div className="flex flex-1 items-center justify-center bg-base">
      <div className="text-center">
        <p className="text-sm font-medium text-copy-primary">
          Connection issue
        </p>
        <p className="mt-1 text-xs text-copy-muted">
          Unable to connect to the collaboration server. Refresh to try again.
        </p>
      </div>
    </div>
  );
}

function CanvasLoading() {
  return (
    <div className="flex flex-1 items-center justify-center bg-base">
      <p className="text-xs text-copy-faint">Connecting to canvas…</p>
    </div>
  );
}

interface FlowCanvasProps {
  projectId: string;
  templateToImport: CanvasTemplate | null;
  onTemplateImported: () => void;
  currentUserId: string;
  onSaveStatusChange?: (status: CanvasSaveStatus) => void;
  onSaveReady?: (save: () => Promise<void>) => void;
}

function FlowCanvas({
  projectId,
  templateToImport,
  onTemplateImported,
  currentUserId,
  onSaveStatusChange,
  onSaveReady,
}: FlowCanvasProps) {
  const reactFlow = useReactFlow();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDelete,
    isLoading,
  } = useLiveblocksFlow({ suspense: true });

  const undo = useUndo();
  const redo = useRedo();

  const { status: saveStatus, save } = useCanvasAutosave({
    projectId,
    nodes: nodes as any,
    edges: edges as any,
    isLoading,
    onNodesChange: onNodesChange as (changes: unknown[]) => void,
    onEdgesChange: onEdgesChange as (changes: unknown[]) => void,
  });

  useEffect(() => {
    onSaveStatusChange?.(saveStatus);
  }, [saveStatus, onSaveStatusChange]);

  useEffect(() => {
    onSaveReady?.(save);
  }, [save, onSaveReady]);

  useKeyboardShortcuts({ reactFlow, undo, redo });

  const updateMyPresence = useUpdateMyPresence();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      updateMyPresence({ cursor: { x: e.clientX, y: e.clientY } });
    },
    [updateMyPresence],
  );

  const handleMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  useEffect(() => {
    if (!templateToImport) return;

    const allNodeIds = nodes.map((n) => n.id);
    const allEdgeIds = edges.map((e) => e.id);

    const removeChanges = [
      ...allNodeIds.map((id) => ({ type: "remove" as const, id })),
      ...allEdgeIds.map((id) => ({ type: "remove" as const, id })),
    ];
    if (removeChanges.length > 0) {
      onNodesChange(removeChanges as any);
      onEdgesChange(removeChanges as any);
    }

    const addNodeChanges = templateToImport.nodes.map((n) => ({
      type: "add" as const,
      item: { ...n },
    }));
    const addEdgeChanges = templateToImport.edges.map((e) => ({
      type: "add" as const,
      item: { ...e },
    }));

    requestAnimationFrame(() => {
      onNodesChange(addNodeChanges as any);
      if (addEdgeChanges.length > 0) {
        onEdgesChange(addEdgeChanges as any);
      }
      reactFlow.fitView({ duration: 300 });
      onTemplateImported();
    });
  }, [templateToImport, nodes, edges, onNodesChange, onEdgesChange, reactFlow, onTemplateImported]);

  const [draggingShape, setDraggingShape] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  const handleShapeDragStart = useCallback((shape: string) => {
    setDraggingShape(shape);
  }, []);

  useEffect(() => {
    if (!draggingShape) return;

    const handleDragOver = (e: DragEvent) => {
      setDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handleDragEnd = () => {
      setDraggingShape(null);
    };

    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, [draggingShape]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDraggingShape(null);
      const raw = e.dataTransfer.getData("application/x-ghost-shape");
      if (!raw) return;

      const { shape } = JSON.parse(raw);
      const position = reactFlow.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      const id = `${shape}-${Date.now()}-${nodeCounter++}`;
      const defaults = SHAPE_DEFAULT_SIZES[shape as keyof typeof SHAPE_DEFAULT_SIZES];

      onNodesChange([
        {
          type: "add",
          item: {
            id,
            type: "canvasNode",
            position,
            data: {
              label: "",
              color: NODE_COLORS[0].fill,
              textColor: NODE_COLORS[0].text,
              shape,
              width: defaults.width,
              height: defaults.height,
            },
          } as any,
        },
      ]);
    },
    [reactFlow, onNodesChange],
  );

  const handleNodeDataChange = useCallback(
    (id: string, data: Record<string, unknown>) => {
      const node = nodes.find((n) => n.id === id);
      if (node) {
        onNodesChange([
          {
            type: "replace",
            id,
            item: { ...node, data: { ...node.data, ...data } },
          },
        ] as any);
      }
    },
    [nodes, onNodesChange],
  );

  const handleEdgeDataChange = useCallback(
    (id: string, data: Record<string, unknown>) => {
      const edge = edges.find((e) => e.id === id);
      if (edge) {
        onEdgesChange([
          {
            type: "replace",
            id,
            item: { ...edge, data: { ...edge.data, ...data } },
          },
        ] as any);
      }
    },
    [edges, onEdgesChange],
  );

  if (isLoading) return <CanvasLoading />;

  const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);

  return (
    <CanvasActionsContext.Provider value={{ onNodeDataChange: handleNodeDataChange, onEdgeDataChange: handleEdgeDataChange }}>
      <div
        className="relative flex flex-1"
        onDragOver={handleCanvasDragOver}
        onDrop={handleDrop}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange as any}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDelete={onDelete}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          connectionMode={ConnectionMode.Loose}
          fitView
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color="var(--border-subtle)"
            gap={20}
            size={1}
          />
        </ReactFlow>
        <LiveCursors currentUserId={currentUserId} />
        <div className="absolute right-3 top-3 z-40">
          <PresenceAvatars currentUserId={currentUserId} />
        </div>
        <ShapePanel onDragStart={handleShapeDragStart} />
        <CanvasControlBar />
        {draggingShape && (
          <ShapeDragPreview
            shape={draggingShape}
            x={dragPosition.x}
            y={dragPosition.y}
          />
        )}
        <NodeColorToolbar selectedNodeIds={selectedNodeIds} />
      </div>
    </CanvasActionsContext.Provider>
  );
}

function Flow({
  projectId,
  templateToImport,
  onTemplateImported,
  currentUserId,
  onSaveStatusChange,
  onSaveReady,
}: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvas
        projectId={projectId}
        templateToImport={templateToImport}
        onTemplateImported={onTemplateImported}
        currentUserId={currentUserId}
        onSaveStatusChange={onSaveStatusChange}
        onSaveReady={onSaveReady}
      />
    </ReactFlowProvider>
  );
}

interface LiveblocksCanvasProps {
  projectId: string;
  roomId: string;
  currentUserId: string;
  templateToImport?: CanvasTemplate | null;
  onTemplateImported?: () => void;
  onSaveStatusChange?: (status: CanvasSaveStatus) => void;
  onSaveReady?: (save: () => Promise<void>) => void;
}

export function LiveblocksCanvas({
  projectId,
  roomId,
  currentUserId,
  templateToImport = null,
  onTemplateImported = () => {},
  onSaveStatusChange,
  onSaveReady,
}: LiveblocksCanvasProps) {
  return (
    <LiveblocksErrorBoundary fallback={<CanvasErrorFallback />}>
      <LiveblocksProvider
        authEndpoint={async (room) => {
          const response = await fetch("/api/liveblocks-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ room }),
          });
          return await response.json();
        }}
      >
        <RoomProvider id={roomId} initialPresence={{ cursor: null, thinking: false }}>
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <Flow
              projectId={projectId}
              templateToImport={templateToImport}
              onTemplateImported={onTemplateImported}
              currentUserId={currentUserId}
              onSaveStatusChange={onSaveStatusChange}
              onSaveReady={onSaveReady}
            />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </LiveblocksErrorBoundary>
  );
}
