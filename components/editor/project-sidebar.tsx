"use client";

import { useState } from "react";
import { FolderOpen, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/projects";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId?: string;
  onNewProject: () => void;
  onSelect: (project: Project) => void;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}

function EmptyProjectsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <FolderOpen className="h-8 w-8 text-copy-faint" />
      <p className="text-sm text-copy-muted">No projects yet</p>
    </div>
  );
}

function ProjectItem({
  project,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: {
  project: Project;
  isActive?: boolean;
  onSelect: (project: Project) => void;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
        isActive
          ? "bg-accent text-copy-primary"
          : "text-copy-secondary hover:bg-subtle hover:text-copy-primary",
      )}
    >
      {isActive && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
      )}
      <button
        type="button"
        className="min-w-0 flex-1 truncate text-left"
        onClick={() => onSelect(project)}
      >
        {project.name}
      </button>
      {project.isOwned && (
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="opacity-0 group-hover:opacity-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-surface-border bg-elevated py-1 shadow-lg">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-copy-secondary hover:bg-subtle hover:text-copy-primary"
                  onClick={() => {
                    setMenuOpen(false);
                    onRename(project);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Rename
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-error hover:bg-destructive/10"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(project);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onNewProject,
  onSelect,
  onRename,
  onDelete,
}: ProjectSidebarProps) {
  const ownedProjects = projects.filter((p) => p.isOwned);
  const sharedProjects = projects.filter((p) => !p.isOwned);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-base/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        aria-hidden={!isOpen}
        className={cn(
          "fixed top-12 left-3 z-40 flex h-[calc(100vh-3rem-0.75rem)] w-72 flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface/95 shadow-lg backdrop-blur-sm transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+0.75rem)]"
        )}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <h2 className="text-sm font-medium text-copy-primary">Projects</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close sidebar"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-4 mt-3 w-[calc(100%-2rem)]">
            <TabsTrigger value="my-projects" className="flex-1">
              My Projects
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">
              Shared
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="min-h-0 flex-1">
            <TabsContent value="my-projects" className="mt-0 px-2">
              {ownedProjects.length === 0 ? (
                <EmptyProjectsPlaceholder />
              ) : (
                <div className="flex flex-col gap-0.5 py-2">
                    {ownedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isActive={project.id === activeProjectId}
                      onSelect={onSelect}
                      onRename={onRename}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="shared" className="mt-0 px-2">
              {sharedProjects.length === 0 ? (
                <EmptyProjectsPlaceholder />
              ) : (
                <div className="flex flex-col gap-0.5 py-2">
                    {sharedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isActive={project.id === activeProjectId}
                      onSelect={onSelect}
                      onRename={onRename}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="border-t border-surface-border p-4">
          <Button type="button" className="w-full" onClick={onNewProject}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
