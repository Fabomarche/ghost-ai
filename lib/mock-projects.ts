export { slugify } from "@/lib/slug";

import type { Project } from "@/types/projects";

export const mockProjects: Project[] = [
  {
    id: "proj_1",
    roomId: "ghost-ai-platform-a1b2c3",
    name: "Ghost AI Platform",
    slug: "ghost-ai-platform",
    createdAt: "2026-05-01T10:00:00Z",
    isOwned: true,
  },
  {
    id: "proj_2",
    roomId: "api-gateway-d4e5f6",
    name: "API Gateway",
    slug: "api-gateway",
    createdAt: "2026-05-10T14:30:00Z",
    isOwned: true,
  },
  {
    id: "proj_3",
    roomId: "shared-workspace-g7h8i9",
    name: "Shared Workspace",
    slug: "shared-workspace",
    createdAt: "2026-05-15T09:00:00Z",
    isOwned: false,
  },
];
