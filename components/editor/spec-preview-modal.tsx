"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSpecDownloadUrl } from "@/lib/spec-filename";
import type { ProjectSpecMeta } from "@/hooks/use-project-specs";

interface SpecPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  spec: ProjectSpecMeta | null;
}

function formatSpecDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SpecPreviewModal({
  open,
  onOpenChange,
  projectId,
  spec,
}: SpecPreviewModalProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !spec) {
      setContent(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const specId = spec.id;

    async function loadContent() {
      setIsLoading(true);
      setError(null);
      setContent(null);

      try {
        const response = await fetch(getSpecDownloadUrl(projectId, specId));

        if (!response.ok) {
          throw new Error("Failed to load spec content.");
        }

        const text = await response.text();

        if (!cancelled) {
          setContent(text);
        }
      } catch (loadError) {
        if (!cancelled) {
          const message =
            loadError instanceof Error
              ? loadError.message
              : "Failed to load spec content.";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, [open, projectId, spec]);

  const handleDownload = () => {
    if (!spec) return;

    const anchor = document.createElement("a");
    anchor.href = getSpecDownloadUrl(projectId, spec.id);
    anchor.download = spec.filename;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(85vh,720px)] max-h-[min(85vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-surface-border px-6 py-4">
          <DialogTitle className="truncate pr-8">
            {spec?.filename ?? "Spec preview"}
          </DialogTitle>
          {spec ? (
            <DialogDescription>
              Generated {formatSpecDate(spec.createdAt)}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <ScrollArea className="h-0 min-h-0 flex-1">
          <div className="px-6 py-4">
            {isLoading ? (
              <div className="flex min-h-[240px] items-center justify-center gap-2 text-copy-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Loading spec…</span>
              </div>
            ) : error ? (
              <div className="flex min-h-[240px] items-center justify-center px-4 text-center text-xs text-state-error">
                {error}
              </div>
            ) : content ? (
              <div className="prose-spec text-xs leading-relaxed text-copy-secondary">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : null}
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 border-t border-surface-border bg-subtle/50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            disabled={!spec || isLoading}
            className="gap-1.5 border-surface-border bg-subtle text-copy-primary hover:bg-subtle-border/40"
          >
            <Download className="h-3.5 w-3.5" />
            Download Markdown Spec
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
