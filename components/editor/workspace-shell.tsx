"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Link2, Sparkles, PanelLeftOpen, PanelLeftClose } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { ShareDialog } from "@/components/editor/share-dialog";
import { EditorProvider } from "@/components/editor/editor-context";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { Project } from "@/types/projects";

interface WorkspaceShellProps {
  project: { id: string; roomId: string; name: string; isOwner: boolean };
  projects: Project[];
}

function CanvasPlaceholder() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-gradient-to-b from-base via-base to-accent-dim/20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-surface-border bg-surface/80">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-8 w-8 text-brand"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
        </svg>
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copy-faint">
        Workspace Shell
      </p>
      <h2 className="max-w-md text-center text-xl font-medium text-copy-primary">
        Canvas and collaboration tooling land here next.
      </h2>
      <p className="max-w-md text-center text-sm leading-relaxed text-copy-muted">
        This room is ready for the shared architecture canvas, durable AI
        workflows, and real-time presence. For now, the shell is wired with
        project context and navigation only.
      </p>
    </div>
  );
}

function AiSidebar() {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-surface-border bg-surface">
      <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
        <div>
          <h2 className="text-sm font-medium text-copy-primary">AI Copilot</h2>
          <p className="text-xs text-copy-faint">Placeholder panel</p>
        </div>
        <Sparkles className="h-4 w-4 text-brand" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="rounded-2xl border border-surface-border bg-elevated p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-dim">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 text-brand"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path d="M9.75 3.5h4.5M12 3.5v1.5M7.5 8h9l.75 10.5a2 2 0 01-2 2h-6.5a2 2 0 01-2-2L7.5 8z" />
                <path d="M10 12h4M10 15h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-copy-primary">
                Chat surface pending
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-copy-muted">
                The toggle is wired. Messaging and generation are intentionally
                out of scope here.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-surface-border p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-copy-faint">
          Future Hooks
        </p>
        <p className="mt-2 text-xs leading-relaxed text-copy-muted">
          Prompt composer, run status, and architecture guidance will attach to
          this sidebar.
        </p>
      </div>
    </aside>
  );
}

export function WorkspaceShell({ project, projects }: WorkspaceShellProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);

  const {
    dialog,
    openCreate,
    openRename,
    openDelete,
    close,
    createName,
    setCreateName,
    renameName,
    setRenameName,
    isSubmitting,
    handleCreate,
    handleRename,
    handleDelete,
    roomIdPreview,
  } = useProjectActions();

  const handleSelect = useCallback(
    (p: Project) => {
      setIsSidebarOpen(false);
      router.push(`/editor/${p.roomId}`);
    },
    [router],
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center border-b border-surface-border bg-surface px-3">
        <div className="flex flex-1 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight text-copy-primary">
              {project.name}
            </span>
            <span className="text-[0.65rem] leading-tight text-copy-faint">
              Workspace
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Share project"
            onClick={() => setShareOpen(true)}
          >
            <Link2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            type="button"
            variant={aiSidebarOpen ? "default" : "ghost"}
            size="sm"
            aria-label="Toggle AI sidebar"
            onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
          >
            <Sparkles className="h-4 w-4" />
            AI
          </Button>
          <div className="ml-1">
            <UserButton />
          </div>
        </div>
      </header>

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projects={projects}
        activeProjectId={project.id}
        onNewProject={openCreate}
        onSelect={handleSelect}
        onRename={openRename}
        onDelete={openDelete}
      />

      <div className="flex flex-1 overflow-hidden">
        <CanvasPlaceholder />
        {aiSidebarOpen && <AiSidebar />}
      </div>

      <EditorProvider onNewProject={openCreate}>
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          projectId={project.id}
          roomId={project.roomId}
          isOwner={project.isOwner}
        />
        <CreateProjectDialog
          open={dialog.type === "create"}
          onOpenChange={(open) => (open ? openCreate() : close())}
          name={createName}
          onNameChange={setCreateName}
          onSubmit={handleCreate}
          roomIdPreview={roomIdPreview}
        />
        <RenameProjectDialog
          open={dialog.type === "rename"}
          onOpenChange={(open) => (open ? undefined : close())}
          projectName={renameName}
          currentName={dialog.project?.name ?? ""}
          onNameChange={setRenameName}
          onSubmit={handleRename}
        />
        <DeleteProjectDialog
          open={dialog.type === "delete"}
          onOpenChange={(open) => (open ? undefined : close())}
          projectName={dialog.project?.name ?? ""}
          onSubmit={handleDelete}
        />
      </EditorProvider>
    </div>
  );
}
