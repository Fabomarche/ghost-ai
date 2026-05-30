"use client";

import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
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
import { ShapePanel } from "@/components/editor/shape-panel";
import { ShapeDragPreview } from "@/components/editor/shape-drag-preview";
import { CanvasActionsContext } from "@/components/editor/canvas-actions";
import { NODE_COLORS, SHAPE_DEFAULT_SIZES } from "@/types/canvas";

const nodeTypes = {
  canvasNode: CanvasNodeRenderer,
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

function FlowCanvas() {
  const { screenToFlowPosition } = useReactFlow();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDelete,
    isLoading,
  } = useLiveblocksFlow({ suspense: true });

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
      const position = screenToFlowPosition({
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
              shape,
              width: defaults.width,
              height: defaults.height,
            },
          } as any,
        },
      ]);
    },
    [screenToFlowPosition, onNodesChange],
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

  if (isLoading) return <CanvasLoading />;

  return (
    <div
      className="relative flex flex-1"
      onDragOver={handleCanvasDragOver}
      onDrop={handleDrop}
    >
      <CanvasActionsContext.Provider value={{ onNodeDataChange: handleNodeDataChange }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange as any}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDelete={onDelete}
          connectionMode={ConnectionMode.Loose}
          fitView
          nodeTypes={nodeTypes}
        >
          <MiniMap />
          <Background
            variant={BackgroundVariant.Dots}
            color="var(--border-subtle)"
            gap={20}
            size={1}
          />
        </ReactFlow>
      </CanvasActionsContext.Provider>
      <ShapePanel onDragStart={handleShapeDragStart} />
      {draggingShape && (
        <ShapeDragPreview
          shape={draggingShape}
          x={dragPosition.x}
          y={dragPosition.y}
        />
      )}
    </div>
  );
}

function Flow() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}

interface LiveblocksCanvasProps {
  roomId: string;
}

export function LiveblocksCanvas({ roomId }: LiveblocksCanvasProps) {
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
        <RoomProvider id={roomId} initialPresence={{ cursor: null, isThinking: false }}>
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <Flow />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </LiveblocksErrorBoundary>
  );
}
