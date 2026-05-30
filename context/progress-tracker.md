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
- `08-editor-workspace-shell` — `/editor/[roomId]` page with server-side access checks, `AccessDenied` for unauthorized users, workspace layout matching design screenshot: project name + subtitle in navbar, Share/AI buttons, UserButton, canvas placeholder with icon and descriptive text, AI sidebar with header/placeholder card/future hooks section, active project highlighted with cyan dot in sidebar. `roomId` field added to Prisma schema and Project type. `getProjectForUser` access helper in `lib/project-access.ts`. `handleCreate` now navigates using `roomId` from API response.

## In Progress

- `09-share-dialog` — Share dialog for inviting collaborators by email. Owners can invite, view, and remove collaborators. Collaborators see read-only access. `lib/clerk.ts` helper for Clerk Backend API user enrichment. API routes: `GET /api/projects/[projectId]/collaborators` (list with enriched user data), `POST /api/projects/[projectId]/collaborators` (invite, owner-only), `DELETE /api/projects/[projectId]/collaborators/[collaboratorId]` (remove, owner-only). `components/editor/share-dialog.tsx` with email input, collaborator list with avatars/names, copy link button with feedback. `lib/project-access.ts` updated to check collaborator access by email via `sessionClaims`. Share button in `WorkspaceShell` wired to open dialog. `npm run build` passes.

## Next Up

- None.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- `roomId` is a unique, human-readable slug (e.g., `my-project-a1b2c3`) separate from the database `id` (cuid). The URL uses `roomId`; the database primary key uses `id`.

## Session Notes

- Editor chrome components live in `components/editor/`. Sidebar state is managed by parent components (wired in later specs). Dialog styling uses `globals.css` tokens — ready for project dialogs in `04-project-dialogs`.
- Project dialogs implemented with dedicated components per dialog type. `useProjectDialogs` hook manages all dialog/form state. `EditorProvider` context passes `onNewProject` to the editor page without prop drilling through the layout. Sidebar actions use a simple popover menu pattern (not a full dropdown component). Mock data lives in `lib/mock-projects.ts`.
- Prisma schema uses multi-file structure: `prisma/schema.prisma` (generator + datasource) + `prisma/models/project.prisma` (models). Generated client outputs to `app/generated/prisma/`. Import via `@/app/generated/prisma/client`. Prisma 7's `prisma-client` generator produces `.ts` files — import path must be explicit (no barrel index). Client singleton in `lib/prisma.ts` caches on `globalThis` for dev hot reloads. Accelerate path requires `@prisma/extension-accelerate` (not yet installed).
- Next.js 16 uses `proxy.ts` instead of `middleware.ts` for request interception. Clerk middleware is configured in `proxy.ts` at project root. Route handlers use `auth()` from `@clerk/nextjs/server` for per-request auth checks. Dynamic route params are `Promise<{ projectId: string }>` in Next.js 16.
- `07-wire-editor-home` refactored the editor page to a server component that fetches real project data via `getOwnedProjects()` and `getSharedProjects()` from `lib/projects.ts`. The layout became minimal (just renders children), with all chrome moved to `EditorShell` client component. `useProjectActions` hook replaces `useProjectDialogs` for mutation handling — it manages dialog state, calls real API endpoints, handles navigation after create, and refresh/redirect after delete. `slugify` moved to `lib/slug.ts` with `generateRoomId` for room ID generation. Sidebar now accepts `onSelect` callback for project navigation.
- `08-editor-workspace-shell` added `roomId` field to the Prisma schema (unique, required), `Project` type, and all data helpers. `lib/project-access.ts` provides `getCurrentUser()` and `getProjectForUser(roomId)` access helpers. `components/editor/access-denied.tsx` renders centered lock icon + message + back link. The `[roomId]/page.tsx` server component handles auth redirect, project lookup by `roomId`, and renders either `AccessDenied` or `WorkspaceShell`. `WorkspaceShell` client component contains the workspace navbar (project name + "Workspace" subtitle, Share button with Link2 icon, AI button with Sparkles icon, UserButton), the existing `ProjectSidebar` overlay with `activeProjectId` highlight (cyan dot + accent background), a canvas placeholder area (compass icon, "WORKSPACE SHELL" heading, descriptive text, teal gradient background), and a togglable AI sidebar (AI Copilot header, placeholder card with chat surface pending message, future hooks section). `handleCreate` in `use-project-actions` now uses the project's `roomId` from the API response for navigation.
- `09-share-dialog` added `lib/clerk.ts` with `createClerkClient` singleton and `enrichCollaboratorEmails` helper that looks up Clerk users by email to get display name and avatar. Fixed `lib/project-access.ts` to check collaborator access using `sessionClaims.email_address` instead of comparing email to userId. Added API routes under `/api/projects/[projectId]/collaborators/`: `GET` lists collaborators with enriched user data (owner or collaborator access), `POST` invites by email (owner-only, validates email format, prevents self-invite, checks duplicates), `DELETE` removes a collaborator (owner-only). `components/editor/share-dialog.tsx` is a client dialog with email input, collaborator list (avatar or initial, name, email), remove buttons for owners, and copy link button with "Copied!" feedback. `WorkspaceShell` wired the existing Share button to toggle the dialog.
