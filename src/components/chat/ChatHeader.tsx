"use client";

import { ArrowLeft, Phone, Video, Search, MoreVertical } from "lucide-react";
import { useAppStore } from "@/store/app.store";
import { ChatAvatar } from "@/components/ui/ChatAvatar";

// Mock chat data lookup
const CHAT_INFO: Record<string, { name: string; subtitle: string; type: "private" | "group" | "channel" }> = {
  "1": { name: "Alice Johnson", subtitle: "online", type: "private" },
  "2": { name: "Dev Team 🚀", subtitle: "5 members", type: "group" },
  "3": { name: "Tech News 📱", subtitle: "1.2K subscribers", type: "channel" },
  "4": { name: "Bob Smith", subtitle: "last seen 1h ago", type: "private" },
  "5": { name: "Maria Garcia", subtitle: "online", type: "private" },
  "6": { name: "Family Chat ❤️", subtitle: "4 members", type: "group" },
};

interface ChatHeaderProps {
  chatId: string;
}

export function ChatHeader({ chatId }: ChatHeaderProps) {
  const { setSelectedChatId } = useAppStore();
  const info = CHAT_INFO[chatId] ?? { name: "Chat", subtitle: "", type: "private" as const };
  const isOnline = info.subtitle === "online";

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 h-14 flex-shrink-0 shadow-sm"
      style={{ background: "var(--tg-header)", borderBottom: "1px solid var(--tg-border)" }}
    >
      {/* Back button (mobile) */}
      <button
        onClick={() => setSelectedChatId(null)}
        className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
        style={{ color: "var(--tg-accent)" }}
      >
        <ArrowLeft size={20} />
      </button>

      {/* Avatar */}
      <ChatAvatar
        chat={{ id: chatId, name: info.name, avatar_url: null, type: info.type }}
        size="sm"
        showOnline={isOnline}
      />

      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer">
        <div className="text-sm font-semibold truncate" style={{ color: "var(--tg-text)" }}>
          {info.name}
        </div>
        <div
          className="text-xs truncate"
          style={{ color: isOnline ? "var(--tg-online)" : "var(--tg-text-secondary)" }}
        >
          {info.subtitle}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-0">
        <button
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          style={{ color: "var(--tg-text-secondary)" }}
        >
          <Search size={18} />
        </button>
        <button
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          style={{ color: "var(--tg-text-secondary)" }}
        >
          <Phone size={18} />
        </button>
        <button
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          style={{ color: "var(--tg-text-secondary)" }}
        >
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
}
