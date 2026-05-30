"use client";

import { createContext, useContext } from "react";

interface EditorContextValue {
  onNewProject: () => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}

export function EditorProvider({
  children,
  onNewProject,
}: {
  children: React.ReactNode;
  onNewProject: () => void;
}) {
  return (
    <EditorContext.Provider value={{ onNewProject }}>
      {children}
    </EditorContext.Provider>
  );
}
