import type { Project } from "@/types/projects";

export const mockProjects: Project[] = [
  {
    id: "proj_1",
    name: "Ghost AI Platform",
    slug: "ghost-ai-platform",
    createdAt: "2026-05-01T10:00:00Z",
    isOwned: true,
  },
  {
    id: "proj_2",
    name: "API Gateway",
    slug: "api-gateway",
    createdAt: "2026-05-10T14:30:00Z",
    isOwned: true,
  },
  {
    id: "proj_3",
    name: "Shared Workspace",
    slug: "shared-workspace",
    createdAt: "2026-05-15T09:00:00Z",
    isOwned: false,
  },
];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
