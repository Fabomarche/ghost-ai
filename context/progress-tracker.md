# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Foundation — auth (done)

## Current Goal

- None.

## Completed

- `01-design-system` — shadcn/ui configured, UI primitives installed (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), `lib/utils.ts` `cn()` helper, lucide-react, dark theme tokens in `globals.css`.
- `02-editor-chrome` — `EditorNavbar` (fixed-height top bar, sidebar toggle with PanelLeftOpen/PanelLeftClose), `ProjectSidebar` (floating overlay, slide-in from left, Projects header, My Projects / Shared tabs with empty states, New Project button), Dialog pattern updated with project color tokens (title, description, footer actions).
- `03-auth` — Clerk CLI initialized, `@clerk/nextjs` + `@clerk/ui` installed, proxy matcher with `/__clerk/(.*)`, `ClerkProvider` with shadcn theme in layout, sign-in/sign-up pages with two-panel layout (logo, tagline, feature list on left; Clerk form on right), auth-based redirects on `/`, UserButton in EditorNavbar.
- `04-project-dialogs` — Editor home screen with New Project button, Create/Rename/Delete project dialogs, sidebar project items with context menu actions (owned projects only), mobile backdrop scrim for sidebar, `useProjectDialogs` hook for dialog/form/loading state, `EditorProvider` context for page-level dialog access, mock project data with `slugify` helper.
- `05-prisma` — Prisma schema with `Project`/`ProjectCollaborator` models (indexes, cascade delete, unique constraints), cached Prisma client singleton in `lib/prisma.ts` with Accelerate/direct adapter branching, initial migration applied.
- `06-project-apis` — Backend REST API routes: `GET /api/projects` (list owner's projects), `POST /api/projects` (create with default name), `PATCH /api/projects/[projectId]` (rename, owner-only), `DELETE /api/projects/[projectId]` (delete, owner-only). Clerk auth enforced via `proxy.ts`, 401/403 responses handled. `npm run build` passes.
- `07-wire-editor-home` — Editor page is now a server component fetching owned + shared projects via `lib/projects.ts` helpers. `useProjectActions` hook manages dialog state and real API mutations (POST/PATCH/DELETE with fetch). `EditorShell` client component wires sidebar, dialogs, and navigation. Sidebar project items navigate to `/editor/[projectId]`. Create dialog shows room ID preview. `slugify` extracted to `lib/slug.ts` with `generateRoomId` helper. `npm run build` passes.

## In Progress

- None.

## Next Up

- None.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Add decisions that affect the system design or data model.

## Session Notes

- Editor chrome components live in `components/editor/`. Sidebar state is managed by parent components (wired in later specs). Dialog styling uses `globals.css` tokens — ready for project dialogs in `04-project-dialogs`.
- Project dialogs implemented with dedicated components per dialog type. `useProjectDialogs` hook manages all dialog/form state. `EditorProvider` context passes `onNewProject` to the editor page without prop drilling through the layout. Sidebar actions use a simple popover menu pattern (not a full dropdown component). Mock data lives in `lib/mock-projects.ts`.
- Prisma schema uses multi-file structure: `prisma/schema.prisma` (generator + datasource) + `prisma/models/project.prisma` (models). Generated client outputs to `app/generated/prisma/`. Import via `@/app/generated/prisma/client`. Prisma 7's `prisma-client` generator produces `.ts` files — import path must be explicit (no barrel index). Client singleton in `lib/prisma.ts` caches on `globalThis` for dev hot reloads. Accelerate path requires `@prisma/extension-accelerate` (not yet installed).
- Next.js 16 uses `proxy.ts` instead of `middleware.ts` for request interception. Clerk middleware is configured in `proxy.ts` at project root. Route handlers use `auth()` from `@clerk/nextjs/server` for per-request auth checks. Dynamic route params are `Promise<{ projectId: string }>` in Next.js 16.
- `07-wire-editor-home` refactored the editor page to a server component that fetches real project data via `getOwnedProjects()` and `getSharedProjects()` from `lib/projects.ts`. The layout became minimal (just renders children), with all chrome moved to `EditorShell` client component. `useProjectActions` hook replaces `useProjectDialogs` for mutation handling — it manages dialog state, calls real API endpoints, handles navigation after create, and refresh/redirect after delete. `slugify` moved to `lib/slug.ts` with `generateRoomId` for room ID generation. Sidebar now accepts `onSelect` callback for project navigation.
