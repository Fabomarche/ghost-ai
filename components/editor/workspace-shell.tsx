"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Link2, Sparkles, LayoutTemplate, PanelLeftOpen, PanelLeftClose } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { ShareDialog } from "@/components/editor/share-dialog";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import { EditorProvider } from "@/components/editor/editor-context";
import { LiveblocksCanvas } from "@/components/editor/liveblocks-canvas";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave";
import type { Project } from "@/types/projects";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

function getSaveLabel(status: CanvasSaveStatus) {
  switch (status) {
    case "saving":
      return "Saving...";
    case "saved":
      return "Saved";
    case "error":
      return "Error";
    default:
      return "Save";
  }
}

interface WorkspaceShellProps {
  project: { id: string; roomId: string; name: string; isOwner: boolean };
  projects: Project[];
}

export function WorkspaceShell({ project, projects }: WorkspaceShellProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templateToImport, setTemplateToImport] = useState<CanvasTemplate | null>(null);
  const [saveStatus, setSaveStatus] = useState<CanvasSaveStatus>("idle");
  const saveCanvasRef = useRef<(() => Promise<void>) | null>(null);

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
            aria-label="Save canvas"
            disabled={saveStatus === "saving"}
            onClick={() => {
              void saveCanvasRef.current?.();
            }}
          >
            {getSaveLabel(saveStatus)}
          </Button>
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
            variant="ghost"
            size="sm"
            aria-label="Starter templates"
            onClick={() => setTemplatesOpen(true)}
          >
            <LayoutTemplate className="h-4 w-4" />
            Templates
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

      <div className="relative flex flex-1 overflow-hidden">
        <LiveblocksCanvas
          projectId={project.id}
          roomId={project.roomId}
          currentUserId={userId ?? ""}
          templateToImport={templateToImport}
          onTemplateImported={() => setTemplateToImport(null)}
          onSaveStatusChange={setSaveStatus}
          onSaveReady={(save) => {
            saveCanvasRef.current = save;
          }}
          aiSidebarOpen={aiSidebarOpen}
          onAiSidebarClose={() => setAiSidebarOpen(false)}
        />
      </div>

      <EditorProvider onNewProject={openCreate}>
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          projectId={project.id}
          roomId={project.roomId}
          isOwner={project.isOwner}
        />
        <StarterTemplatesModal
          open={templatesOpen}
          onOpenChange={setTemplatesOpen}
          onImport={(t) => {
            setTemplateToImport(t);
            setTemplatesOpen(false);
          }}
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
