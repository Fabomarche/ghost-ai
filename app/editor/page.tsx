import { getOwnedProjects, getSharedProjects } from "@/lib/projects";
import { EditorShell } from "@/components/editor/editor-shell";
import { EditorHome } from "@/components/editor/editor-home";

export default async function EditorPage() {
  const [ownedProjects, sharedProjects] = await Promise.all([
    getOwnedProjects(),
    getSharedProjects(),
  ]);

  const projects = [...ownedProjects, ...sharedProjects];

  return (
    <EditorShell projects={projects}>
      <EditorHome />
    </EditorShell>
  );
}
