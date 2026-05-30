import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AccessDenied } from "@/components/editor/access-denied";
import { getProjectForUser } from "@/lib/project-access";
import { getOwnedProjects, getSharedProjects } from "@/lib/projects";
import { WorkspaceShell } from "@/components/editor/workspace-shell";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { roomId } = await params;
  const project = await getProjectForUser(roomId);

  if (!project) return <AccessDenied />;

  const [ownedProjects, sharedProjects] = await Promise.all([
    getOwnedProjects(),
    getSharedProjects(),
  ]);

  const projects = [...ownedProjects, ...sharedProjects];

  return (
    <WorkspaceShell project={project} projects={projects} />
  );
}
