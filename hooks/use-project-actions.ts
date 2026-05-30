"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { generateRoomId } from "@/lib/slug";
import type { Project } from "@/types/projects";

type DialogType = "create" | "rename" | "delete" | null;

interface DialogState {
  type: DialogType;
  project: Project | null;
}

interface UseProjectActionsReturn {
  dialog: DialogState;
  openCreate: () => void;
  openRename: (project: Project) => void;
  openDelete: (project: Project) => void;
  close: () => void;
  createName: string;
  setCreateName: (name: string) => void;
  renameName: string;
  setRenameName: (name: string) => void;
  isSubmitting: boolean;
  handleCreate: () => Promise<void>;
  handleRename: () => Promise<void>;
  handleDelete: () => Promise<void>;
  roomIdPreview: string | null;
}

export function useProjectActions(): UseProjectActionsReturn {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState>({
    type: null,
    project: null,
  });
  const [createName, setCreateName] = useState("");
  const [renameName, setRenameName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreate = useCallback(() => {
    setDialog({ type: "create", project: null });
    setCreateName("");
  }, []);

  const openRename = useCallback((project: Project) => {
    setDialog({ type: "rename", project });
    setRenameName(project.name);
  }, []);

  const openDelete = useCallback((project: Project) => {
    setDialog({ type: "delete", project });
  }, []);

  const close = useCallback(() => {
    setDialog({ type: null, project: null });
    setCreateName("");
    setRenameName("");
    setIsSubmitting(false);
  }, []);

  const roomIdPreview = dialog.type === "create" && createName.trim()
    ? generateRoomId(createName.trim())
    : null;

  const handleCreate = useCallback(async () => {
    if (!createName.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to create project");

      const data = await res.json();
      close();
      router.push(`/editor/${data.roomId}`);
    } catch (err) {
      console.error("Create project failed:", err);
      setIsSubmitting(false);
    }
  }, [createName, isSubmitting, close, router]);

  const handleRename = useCallback(async () => {
    if (!dialog.project || !renameName.trim() || isSubmitting) return;
    if (renameName.trim() === dialog.project.name) {
      close();
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/projects/${dialog.project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to rename project");

      close();
      router.refresh();
    } catch (err) {
      console.error("Rename project failed:", err);
      setIsSubmitting(false);
    }
  }, [dialog.project, renameName, isSubmitting, close, router]);

  const handleDelete = useCallback(async () => {
    if (!dialog.project || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/projects/${dialog.project.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete project");

      const wasActive = window.location.pathname.includes(dialog.project.id);
      close();

      if (wasActive) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("Delete project failed:", err);
      setIsSubmitting(false);
    }
  }, [dialog.project, isSubmitting, close, router]);

  return {
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
  };
}
