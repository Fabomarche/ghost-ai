"use client";

import { useState, useCallback } from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { EditorProvider } from "@/components/editor/editor-context";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";
import { mockProjects, slugify } from "@/lib/mock-projects";
import type { Project } from "@/types/projects";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(mockProjects);

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
  } = useProjectDialogs();

  const handleCreate = useCallback(() => {
    if (!createName.trim()) return;
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: createName.trim(),
      slug: slugify(createName.trim()),
      createdAt: new Date().toISOString(),
      isOwned: true,
    };
    setProjects((prev) => [...prev, newProject]);
    close();
  }, [createName, close]);

  const handleRename = useCallback(() => {
    if (!dialog.project || !renameName.trim()) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === dialog.project!.id
          ? { ...p, name: renameName.trim(), slug: slugify(renameName.trim()) }
          : p
      )
    );
    close();
  }, [dialog.project, renameName, close]);

  const handleDelete = useCallback(() => {
    if (!dialog.project) return;
    setProjects((prev) => prev.filter((p) => p.id !== dialog.project!.id));
    close();
  }, [dialog.project, close]);

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
