"use client";

import { useState, useCallback } from "react";
import type { Project } from "@/types/projects";

type DialogType = "create" | "rename" | "delete" | null;

interface DialogState {
  type: DialogType;
  project: Project | null;
}

interface UseProjectDialogsReturn {
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
}

export function useProjectDialogs(): UseProjectDialogsReturn {
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
  };
}
