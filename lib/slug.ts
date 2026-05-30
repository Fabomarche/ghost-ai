export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateRoomId(name: string): string {
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${slugify(name)}-${suffix}`;
}
