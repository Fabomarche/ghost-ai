import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

interface PersistedSpec {
  specId: string;
  filePath: string;
}

export async function persistGeneratedSpec(
  projectId: string,
  content: string,
): Promise<PersistedSpec> {
  const specId = randomUUID();

  const blob = await put(`specs/${projectId}/${specId}.md`, content, {
    access: "private",
    contentType: "text/markdown; charset=utf-8",
    allowOverwrite: true,
  });

  await prisma.projectSpec.create({
    data: {
      id: specId,
      projectId,
      filePath: blob.url,
    },
  });

  return { specId, filePath: blob.url };
}
