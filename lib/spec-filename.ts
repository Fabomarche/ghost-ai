export function getSpecFilename(specId: string): string {
  return `spec-${specId}.md`;
}

export function getSpecDownloadUrl(projectId: string, specId: string): string {
  return `/api/projects/${projectId}/specs/${specId}/download`;
}
