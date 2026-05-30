"use client";

import { useEditor } from "@/components/editor/editor-context";
import { EditorHome } from "@/components/editor/editor-home";

export default function EditorPage() {
  const { onNewProject } = useEditor();
  return <EditorHome onNewProject={onNewProject} />;
}
