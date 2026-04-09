"use client";

import { useState } from "react";
import { SidebarHeader } from "./SidebarHeader";
import { FolderTabs } from "./FolderTabs";
import { ChatList } from "./ChatList";
import { useAppStore } from "@/store/app.store";

const MOCK_CHATS = [
  {
    id: "1",
    type: "private" as const,
    name: "Alice Johnson",
    description: null,
    avatar_url: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_pinned: true,
    is_muted: false,
    is_verified: false,
    last_message: {
      id: "m1", chat_id: "1", user_id: "other",
      content: "Hey! How are you doing?",
      type: "text" as const, media_url: null,
      reply_to_id: null, forwarded_from_id: null,
      edited_at: null, deleted_at: null, pinned: false,
      created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    unread_count: 3,
  },
  {
    id: "2",
    type: "group" as const,
    name: "Dev Team 🚀",
    description: null,
    avatar_url: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_pinned: false,
    is_muted: false,
    is_verified: false,
    last_message: {
      id: "m2", chat_id: "2", user_id: "u2",
      content: "The build is ready for review 🔍",
      type: "text" as const, media_url: null,
      reply_to_id: null, forwarded_from_id: null,
      edited_at: null, deleted_at: null, pinned: false,
      created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    unread_count: 12,
  },
  {
    id: "3",
    type: "channel" as const,
    name: "Tech News 📱",
    description: null,
    avatar_url: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_pinned: false,
    is_muted: true,
    is_verified: true,
    last_message: {
      id: "m3", chat_id: "3", user_id: null,
      content: "OpenAI releases new model with 1M context window",
      type: "text" as const, media_url: null,
      reply_to_id: null, forwarded_from_id: null,
      edited_at: null, deleted_at: null, pinned: false,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    unread_count: 0,
  },
  {
    id: "4",
    type: "private" as const,
    name: "Bob Smith",
    description: null,
    avatar_url: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_pinned: false,
    is_muted: false,
    is_verified: false,
    last_message: {
      id: "m4", chat_id: "4", user_id: "me",
      content: "Sure, let's meet tomorrow 👋",
      type: "text" as const, media_url: null,
      reply_to_id: null, forwarded_from_id: null,
      edited_at: null, deleted_at: null, pinned: false,
      created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
    unread_count: 0,
  },
  {
    id: "5",
    type: "private" as const,
    name: "Maria Garcia",
    description: null,
    avatar_url: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_pinned: false,
    is_muted: false,
    is_verified: false,
    last_message: {
      id: "m5", chat_id: "5", user_id: "u5",
      content: "Photo",
      type: "image" as const, media_url: null,
      reply_to_id: null, forwarded_from_id: null,
      edited_at: null, deleted_at: null, pinned: false,
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    unread_count: 1,
  },
  {
    id: "6",
    type: "group" as const,
    name: "Family Chat ❤️",
    description: null,
    avatar_url: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_pinned: false,
    is_muted: true,
    is_verified: false,
    last_message: {
      id: "m6", chat_id: "6", user_id: "u6",
      content: "Happy birthday! 🎂",
      type: "text" as const, media_url: null,
      reply_to_id: null, forwarded_from_id: null,
      edited_at: null, deleted_at: null, pinned: false,
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    unread_count: 0,
  },
  {
    id: "7",
    type: "private" as const,
    name: "Saved Messages",
    description: null,
    avatar_url: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_pinned: true,
    is_muted: false,
    is_verified: false,
    last_message: {
      id: "m7", chat_id: "7", user_id: "me",
      content: "Remember to deploy on Friday",
      type: "text" as const, media_url: null,
      reply_to_id: null, forwarded_from_id: null,
      edited_at: null, deleted_at: null, pinned: false,
      created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    },
    unread_count: 0,
  },
];

const FOLDERS = [
  { id: null, name: "All", emoji: null, unread: 16 },
  { id: "personal", name: "Personal", emoji: "👤", unread: 4 },
  { id: "work", name: "Work", emoji: "💼", unread: 12 },
  { id: "channels", name: "Channels", emoji: "📢", unread: 0 },
];

export function Sidebar() {
  const { selectedChatId, setSelectedChatId, searchQuery } = useAppStore();
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  const filteredChats = MOCK_CHATS.filter((chat) => {
    if (searchQuery) {
      return chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (activeFolder === "channels") return chat.type === "channel";
    if (activeFolder === "work") return chat.type === "group";
    if (activeFolder === "personal") return chat.type === "private";
    return true;
  }).sort((a, b) => {
    // Pinned first
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    // Then by time
    const aTime = a.last_message?.created_at ?? a.created_at;
    const bTime = b.last_message?.created_at ?? b.created_at;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return (
    <div className="flex flex-col h-full w-full" style={{ background: "var(--tg-sidebar)" }}>
      <SidebarHeader />
      <FolderTabs
        folders={FOLDERS}
        activeFolder={activeFolder}
        onFolderChange={setActiveFolder}
      />
      <ChatList
        chats={filteredChats}
        selectedChatId={selectedChatId}
        onChatSelect={setSelectedChatId}
      />
    </div>
  );
}
