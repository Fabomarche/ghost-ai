"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useEditor } from "@/components/editor/editor-context";

export function EditorHome() {
  const { onNewProject } = useEditor();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-lg font-medium text-copy-primary">
        Create a project or open an existing one
      </h1>
      <p className="text-sm text-copy-muted">
        Start a new architecture workspace, or choose a project from the
        sidebar.
      </p>
      <Button type="button" onClick={onNewProject}>
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </div>
  );
}
