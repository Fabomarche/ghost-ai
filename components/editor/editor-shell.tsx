"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { EditorProvider } from "@/components/editor/editor-context";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { Project } from "@/types/projects";

interface EditorShellProps {
  projects: Project[];
  children: React.ReactNode;
}

export function EditorShell({ projects, children }: EditorShellProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    (project: Project) => {
      setIsSidebarOpen(false);
      router.push(`/editor/${project.id}`);
    },
    [router]
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projects={projects}
        onNewProject={openCreate}
        onSelect={handleSelect}
        onRename={openRename}
        onDelete={openDelete}
      />
      <main className="flex flex-1 overflow-hidden">
        <EditorProvider onNewProject={openCreate}>{children}</EditorProvider>
      </main>

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
    </div>
  );
}
