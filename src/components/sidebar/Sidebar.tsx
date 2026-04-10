"use client";

import { useState } from "react";
import { SidebarHeader } from "./SidebarHeader";
import { FolderTabs } from "./FolderTabs";
import { ChatList } from "./ChatList";
import { NewChatModal } from "./NewChatModal";
import { useAppStore } from "@/store/app.store";
import { useChats } from "@/hooks/useChats";
import { Loader2 } from "lucide-react";

const FOLDERS = [
  { id: null,        name: "All",      emoji: null,  unread: 0 },
  { id: "personal",  name: "Personal", emoji: "👤",  unread: 0 },
  { id: "work",      name: "Work",     emoji: "💼",  unread: 0 },
  { id: "channels",  name: "Channels", emoji: "📢",  unread: 0 },
];

export function Sidebar() {
  const { selectedChatId, setSelectedChatId, searchQuery } = useAppStore();
  const { chats, loading } = useChats();
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);

  const filtered = chats.filter((chat) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        chat.name?.toLowerCase().includes(q) ||
        chat.last_message?.content?.toLowerCase().includes(q)
      );
    }
    if (activeFolder === "channels") return chat.type === "channel";
    if (activeFolder === "work")     return chat.type === "group";
    if (activeFolder === "personal") return chat.type === "private";
    return true;
  });

  // Inject unread counts into folder tabs
  const foldersWithCounts = FOLDERS.map((f) => ({
    ...f,
    unread: chats
      .filter((c) => {
        if (f.id === "channels") return c.type === "channel";
        if (f.id === "work")     return c.type === "group";
        if (f.id === "personal") return c.type === "private";
        return true;
      })
      .reduce((sum, c) => sum + (c.unread_count ?? 0), 0),
  }));

  return (
    <div className="flex flex-col h-full w-full" style={{ background: "var(--tg-sidebar)" }}>
      <SidebarHeader onNewChat={() => setShowNewChat(true)} />
      <FolderTabs
        folders={foldersWithCounts}
        activeFolder={activeFolder}
        onFolderChange={setActiveFolder}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--tg-text-secondary)" }} />
        </div>
      ) : (
        <ChatList
          chats={filtered}
          selectedChatId={selectedChatId}
          onChatSelect={setSelectedChatId}
        />
      )}

      {showNewChat && (
        <NewChatModal onClose={() => setShowNewChat(false)} />
      )}
    </div>
  );
}
