/**
 * Shared Liveblocks React Flow sync config for client hooks and server-side
 * mutateFlow. Both sides must match so nodes/edges deserialize with setLocal().
 */
export const canvasFlowSyncOptions = {
  nodes: {
    sync: {
      canvasNode: {
        data: {
          label: "atomic",
          color: "atomic",
          textColor: "atomic",
          shape: "atomic",
          width: "atomic",
          height: "atomic",
        },
      },
    },
  },
  edges: {
    sync: {
      canvasEdge: {
        data: {
          label: "atomic",
        },
      },
    },
  },
} as const;
