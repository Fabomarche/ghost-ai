"use client";

import { useState } from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main className="flex flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
