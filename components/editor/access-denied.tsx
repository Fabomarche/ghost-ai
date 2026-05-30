import Link from "next/link";
import { Lock } from "lucide-react";

export function AccessDenied() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <Lock className="h-12 w-12 text-copy-faint" />
      <h1 className="text-lg font-medium text-copy-primary">Access Denied</h1>
      <p className="text-sm text-copy-muted">
        You don&apos;t have access to this project.
      </p>
      <Link
        href="/editor"
        className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Back to Editor
      </Link>
    </div>
  );
}
