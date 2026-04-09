"use client";

import { Check, CheckCheck, Image as ImageIcon, Mic, Volume2 } from "lucide-react";
import type { ChatWithLastMessage } from "@/types/database";
import { formatTime } from "@/lib/format";
import { ChatAvatar } from "@/components/ui/ChatAvatar";

interface ChatListItemProps {
  chat: ChatWithLastMessage;
  isSelected: boolean;
  onClick: () => void;
}

export function ChatListItem({ chat, isSelected, onClick }: ChatListItemProps) {
  const lastMsg = chat.last_message;
  const isOutgoing = lastMsg?.user_id === "me";
  const hasUnread = (chat.unread_count ?? 0) > 0;

  const getMessagePreview = () => {
    if (!lastMsg) return "";
    if (lastMsg.type === "image") return "🖼 Photo";
    if (lastMsg.type === "audio") return "🎤 Voice message";
    if (lastMsg.type === "video") return "🎬 Video";
    if (lastMsg.type === "file") return "📎 File";
    return lastMsg.content ?? "";
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 transition-colors relative"
      style={{
        background: isSelected ? "var(--tg-active)" : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.background = "var(--tg-hover)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }
      }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <ChatAvatar chat={chat} size="md" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between gap-1">
          {/* Name */}
          <div className="flex items-center gap-1 min-w-0">
            {chat.type === "channel" && (
              <Volume2 size={14} style={{ color: "var(--tg-text-secondary)", flexShrink: 0 }} />
            )}
            <span
              className="text-sm font-medium truncate"
              style={{ color: "var(--tg-text)" }}
            >
              {chat.name}
            </span>
          </div>
          {/* Time */}
          {lastMsg && (
            <span
              className="text-xs flex-shrink-0"
              style={{ color: hasUnread ? "var(--tg-accent)" : "var(--tg-text-secondary)" }}
            >
              {formatTime(lastMsg.created_at)}
            </span>
          )}
        </div>

        {/* Last message */}
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <div className="flex items-center gap-1 min-w-0">
            {/* Read status for outgoing */}
            {isOutgoing && (
              <CheckCheck
                size={14}
                className="flex-shrink-0"
                style={{ color: "var(--tg-accent)" }}
              />
            )}
            <span
              className="text-xs truncate"
              style={{ color: "var(--tg-text-secondary)" }}
            >
              {getMessagePreview()}
            </span>
          </div>

          {/* Unread badge */}
          {hasUnread && (
            <span
              className="flex-shrink-0 min-w-[20px] h-5 rounded-full text-xs font-medium flex items-center justify-center px-1"
              style={{
                background: "var(--tg-unread)",
                color: "#fff",
              }}
            >
              {(chat.unread_count ?? 0) > 99 ? "99+" : chat.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
