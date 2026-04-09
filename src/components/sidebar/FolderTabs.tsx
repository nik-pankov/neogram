"use client";

import { useRef } from "react";

interface Folder {
  id: string | null;
  name: string;
  emoji: string | null;
  unread?: number;
}

interface FolderTabsProps {
  folders: Folder[];
  activeFolder: string | null;
  onFolderChange: (id: string | null) => void;
}

export function FolderTabs({ folders, activeFolder, onFolderChange }: FolderTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (folders.length <= 1) return null;

  return (
    <div
      ref={scrollRef}
      className="flex items-center overflow-x-auto no-scrollbar flex-shrink-0"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      {folders.map((folder) => {
        const isActive = activeFolder === folder.id;
        return (
          <button
            key={folder.id ?? "all"}
            onClick={() => onFolderChange(folder.id)}
            className="relative flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0"
            style={{ color: isActive ? "var(--tg-accent)" : "var(--tg-text-secondary)" }}
          >
            {folder.emoji && <span className="text-sm">{folder.emoji}</span>}
            <span className="uppercase tracking-wide text-[11px]">{folder.name}</span>
            {(folder.unread ?? 0) > 0 && !isActive && (
              <span
                className="min-w-[16px] h-4 rounded-full text-[10px] font-semibold flex items-center justify-center px-1"
                style={{ background: "var(--tg-unread)", color: "#fff" }}
              >
                {folder.unread}
              </span>
            )}
            {isActive && (
              <span
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                style={{ background: "var(--tg-accent)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
