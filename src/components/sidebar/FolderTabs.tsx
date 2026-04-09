"use client";

import { useRef } from "react";

interface Folder {
  id: string | null;
  name: string;
  emoji: string | null;
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
      className="flex items-center gap-0 overflow-x-auto no-scrollbar flex-shrink-0 px-1"
      style={{ borderBottom: "1px solid var(--tg-border)" }}
    >
      {folders.map((folder) => {
        const isActive = activeFolder === folder.id;
        return (
          <button
            key={folder.id ?? "all"}
            onClick={() => onFolderChange(folder.id)}
            className="relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0"
            style={{
              color: isActive ? "var(--tg-accent)" : "var(--tg-text-secondary)",
            }}
          >
            {folder.emoji && <span className="text-base">{folder.emoji}</span>}
            <span>{folder.name}</span>
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                style={{ background: "var(--tg-accent)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
