"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check, Link2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Collaborator {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  isOwner: boolean;
  createdAt: string;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  roomId: string;
  isOwner: boolean;
}

export function ShareDialog({
  open,
  onOpenChange,
  projectId,
  roomId,
  isOwner,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCollaborators = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (res.ok) {
        const data = await res.json();
        setCollaborators(data);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (open) {
      fetchCollaborators();
      setEmail("");
      setError(null);
      setCopied(false);
    }
  }, [open, fetchCollaborators]);

  const handleInvite = async () => {
    if (!email.trim()) return;

    setInviting(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setError(data.error || "Failed to add collaborator");
        } catch {
          setError("Failed to add collaborator");
        }
        return;
      }

      setEmail("");
      await fetchCollaborators();
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/collaborators/${collaboratorId}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        await fetchCollaborators();
      }
    } catch {
      // Silently fail
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/editor/${roomId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email.trim()) {
      e.preventDefault();
      handleInvite();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
          <DialogDescription className="text-copy-secondary">
            Invite collaborators, copy the workspace link, and manage access.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-surface-border bg-subtle/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-copy-primary">
                  Workspace link
                </p>
                <p className="mt-0.5 text-xs text-copy-muted">
                  Share a direct link with teammates after you grant them access.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" />
                    Copy link
                  </>
                )}
              </Button>
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-copy-faint" />
                <Input
                  placeholder="teammate@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={inviting}
                  className="pl-9"
                />
              </div>
              <Button
                type="button"
                onClick={handleInvite}
                disabled={!email.trim() || inviting}
              >
                {inviting ? "Adding..." : "Invite"}
              </Button>
            </div>
          )}

          {error && <p className="text-xs text-state-error">{error}</p>}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-copy-primary">
                People with access
              </p>
              <p className="text-xs text-copy-muted">
                {loading ? "..." : `${collaborators.length} total`}
              </p>
            </div>

            {loading ? (
              <p className="text-xs text-copy-muted">Loading...</p>
            ) : collaborators.length === 0 ? (
              <p className="text-xs text-copy-muted">
                No collaborators yet. Invite someone to get started.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center gap-3 rounded-2xl border border-surface-border bg-subtle/30 px-4 py-3"
                  >
                    {collab.imageUrl ? (
                      <img
                        src={collab.imageUrl}
                        alt=""
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-dim text-sm font-medium text-brand">
                        {collab.name
                          ? collab.name.charAt(0).toUpperCase()
                          : collab.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-copy-primary">
                          {collab.name || collab.email}
                        </p>
                        {collab.isOwner && (
                          <span className="shrink-0 rounded-md bg-brand/20 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-brand">
                            Owner
                          </span>
                        )}
                      </div>
                      {collab.name && (
                        <p className="truncate text-xs text-copy-muted">
                          {collab.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
