"use client";

import { ArrowLeft, Phone, Video, Search, MoreVertical, Bell, BellOff, Trash2, UserX } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/store/app.store";
import { ChatAvatar } from "@/components/ui/ChatAvatar";

const CHAT_INFO: Record<string, {
  name: string;
  subtitle: string;
  type: "private" | "group" | "channel";
  members?: number;
}> = {
  "1": { name: "Alice Johnson", subtitle: "online", type: "private" },
  "2": { name: "Dev Team 🚀", subtitle: "5 members, 2 online", type: "group", members: 5 },
  "3": { name: "Tech News 📱", subtitle: "1,241 subscribers", type: "channel" },
  "4": { name: "Bob Smith", subtitle: "last seen 1h ago", type: "private" },
  "5": { name: "Maria Garcia", subtitle: "online", type: "private" },
  "6": { name: "Family Chat ❤️", subtitle: "4 members", type: "group", members: 4 },
  "7": { name: "Saved Messages", subtitle: "your cloud storage", type: "private" },
};

interface ChatHeaderProps {
  chatId: string;
}

export function ChatHeader({ chatId }: ChatHeaderProps) {
  const { setSelectedChatId } = useAppStore();
  const [showMenu, setShowMenu] = useState(false);
  const info = CHAT_INFO[chatId] ?? { name: "Chat", subtitle: "", type: "private" as const };
  const isOnline = info.subtitle === "online";

  const menuItems = [
    { icon: Search, label: "Search" },
    { icon: Bell, label: "Mute notifications" },
    { icon: Trash2, label: "Clear history", danger: true },
    { icon: UserX, label: "Delete chat", danger: true },
  ];

  return (
    <div
      className="flex items-center gap-1 px-2 h-14 flex-shrink-0 relative"
      style={{
        background: "var(--tg-header)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }}
    >
      {/* Back (mobile) */}
      <button
        onClick={() => setSelectedChatId(null)}
        className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
        style={{ color: "var(--tg-accent)" }}
      >
        <ArrowLeft size={20} />
      </button>

      {/* Avatar + info — clickable for profile */}
      <button className="flex items-center gap-2.5 flex-1 min-w-0 rounded-lg px-1 py-1 hover:bg-white/5 transition-colors">
        <ChatAvatar
          chat={{ id: chatId, name: info.name, avatar_url: null, type: info.type }}
          size="sm"
          showOnline={isOnline}
        />
        <div className="text-left min-w-0">
          <div className="text-sm font-semibold truncate leading-tight" style={{ color: "var(--tg-text)" }}>
            {info.name}
          </div>
          <div
            className="text-xs truncate leading-tight"
            style={{ color: isOnline ? "var(--tg-online)" : "var(--tg-text-secondary)" }}
          >
            {info.subtitle}
          </div>
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center">
        {info.type !== "channel" && (
          <>
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
              <Video size={18} />
            </button>
          </>
        )}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            style={{ color: "var(--tg-text-secondary)" }}
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div
                className="absolute right-0 top-10 w-52 rounded-xl overflow-hidden shadow-xl z-50 context-menu"
              >
                {menuItems.map(({ icon: Icon, label, danger }) => (
                  <button
                    key={label}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors hover:bg-white/8"
                    style={{ color: danger ? "#ef4444" : "var(--tg-text)" }}
                    onClick={() => setShowMenu(false)}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
