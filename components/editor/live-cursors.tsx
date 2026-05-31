"use client";

import { useOthers } from "@liveblocks/react";
import { Loader2 } from "lucide-react";

interface LiveCursorsProps {
  currentUserId: string;
}

export function LiveCursors({ currentUserId }: LiveCursorsProps) {
  const others = useOthers();

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {others.map((other) => {
        if (other.id === currentUserId) return null;

        const cursor = other.presence.cursor;
        if (!cursor) return null;

        const info = other.info;
        const color = info.color;
        const isThinking = other.presence.thinking === true;

        return (
          <div
            key={other.id}
            className="absolute left-0 top-0"
            style={{
              transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
              willChange: "transform",
            }}
          >
            <svg
              width="16"
              height="20"
              viewBox="0 0 16 20"
              fill="none"
              className="drop-shadow-sm"
            >
              <path
                d="M0.928711 0.831543L15.404 11.2615L7.34122 12.7296L3.55373 19.1685L0.928711 0.831543Z"
                fill={color}
                stroke="var(--bg-base)"
                strokeWidth="1.2"
              />
            </svg>
            <div
              className="ml-3 -mt-0.5 flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.6rem] font-medium leading-none"
              style={{
                backgroundColor: color,
                color: "var(--bg-base)",
              }}
            >
              {isThinking && (
                <Loader2 className="h-2.5 w-2.5 shrink-0 animate-spin" />
              )}
              {info.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
