"use client";

import { useOthers } from "@liveblocks/react";
import { UserButton } from "@clerk/nextjs";

const MAX_VISIBLE = 5;

interface PresenceAvatarsProps {
  currentUserId: string;
}

export function PresenceAvatars({ currentUserId }: PresenceAvatarsProps) {
  const others = useOthers();

  const collaborators = others.filter(
    (other) => other.id !== currentUserId,
  );

  const visible = collaborators.slice(0, MAX_VISIBLE);
  const overflow = collaborators.length - MAX_VISIBLE;

  return (
    <div className="flex items-center gap-1.5">
      {collaborators.length > 0 && (
        <>
          <div className="flex -space-x-2">
            {visible.map((collab) => {
              const info = collab.info;
              const hasImage = info.avatar && info.avatar.length > 0;
              const initials = info.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={collab.id}
                  className="relative flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-[var(--bg-base)]"
                  style={{ backgroundColor: info.color + "33" }}
                  title={info.name}
                >
                  {hasImage ? (
                    <img
                      src={info.avatar}
                      alt={info.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className="text-[0.6rem] font-medium"
                      style={{ color: info.color }}
                    >
                      {initials}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {overflow > 0 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-elevated text-[0.6rem] font-medium text-copy-muted ring-2 ring-[var(--bg-base)]">
              +{overflow}
            </div>
          )}

          <div className="mx-1 h-5 w-px bg-surface-border" />
        </>
      )}

      <UserButton />
    </div>
  );
}
