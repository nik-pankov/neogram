"use client";

import { useState, useRef, useCallback } from "react";
import { Check, CheckCheck, Reply, Forward, Trash2, Pin, Copy, Smile } from "lucide-react";
import type { MessageWithSender } from "@/types/database";
import { formatFullTime } from "@/lib/format";
import { UserAvatar } from "@/components/ui/ChatAvatar";
import { AudioMessage } from "./AudioMessage";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app.store";

const EMOJI_QUICK = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];

interface ContextItem {
  icon: React.ElementType;
  label: string;
  danger?: boolean;
  action: () => void;
}

interface MessageBubbleProps {
  message: MessageWithSender;
  isMe: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  onReply: () => void;
  onReaction: (emoji: string) => void;
}

export function MessageBubble({
  message,
  isMe,
  isFirstInGroup,
  isLastInGroup,
  onReply,
  onReaction,
}: MessageBubbleProps) {
  const [showContext, setShowContext] = useState(false);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { currentUser } = useAppStore();

  const bgColor = isMe ? "var(--tg-message-out)" : "var(--tg-message-in)";

  // Group reactions
  const reactionGroups = (message.reactions ?? []).reduce<Record<string, { count: number; mine: boolean }>>(
    (acc, r) => {
      if (!acc[r.emoji]) acc[r.emoji] = { count: 0, mine: false };
      acc[r.emoji].count++;
      if (r.user_id === currentUser?.id) acc[r.emoji].mine = true;
      return acc;
    },
    {}
  );

  const openContext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 280);
    setContextPos({ x, y });
    setShowContext(true);
    setShowEmojiBar(false);
  }, []);

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setShowContext(true);
    }, 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const contextItems: ContextItem[] = [
    { icon: Reply, label: "Reply", action: () => { onReply(); setShowContext(false); } },
    { icon: Copy, label: "Copy", action: () => { navigator.clipboard.writeText(message.content ?? ""); setShowContext(false); } },
    { icon: Pin, label: "Pin", action: () => setShowContext(false) },
    { icon: Forward, label: "Forward", action: () => setShowContext(false) },
    { icon: Trash2, label: "Delete", danger: true, action: () => setShowContext(false) },
  ];

  return (
    <>
      {/* Context menu overlay */}
      {showContext && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setShowContext(false)}
        >
          {/* Emoji reaction bar */}
          <div
            className="absolute flex items-center gap-1 rounded-full px-3 py-2 shadow-xl context-menu"
            style={{
              left: Math.min(contextPos.x, window.innerWidth - 290),
              top: Math.max(contextPos.y - 56, 8),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {EMOJI_QUICK.map((emoji) => (
              <button
                key={emoji}
                onClick={() => { onReaction(emoji); setShowContext(false); }}
                className="text-xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-all hover:scale-125 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Context actions */}
          <div
            className="absolute rounded-xl overflow-hidden shadow-xl z-50 w-48 context-menu"
            style={{
              left: Math.min(contextPos.x, window.innerWidth - 200),
              top: contextPos.y + 4,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextItems.map(({ icon: Icon, label, danger, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors hover:bg-white/8"
                style={{ color: danger ? "#ef4444" : "var(--tg-text)" }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex gap-1.5 mb-0.5 group relative msg-appear",
          isMe ? "justify-end" : "justify-start",
          selected && "msg-selected rounded-lg"
        )}
        onContextMenu={openContext}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Incoming avatar */}
        {!isMe && (
          <div className="flex-shrink-0 self-end mb-1 w-8">
            {isLastInGroup && message.sender && (
              <UserAvatar user={message.sender} size="sm" />
            )}
          </div>
        )}

        <div className={cn("flex flex-col max-w-[72%] md:max-w-[65%]", isMe ? "items-end" : "items-start")}>

          {/* Sender name in groups */}
          {!isMe && isFirstInGroup && message.sender && (
            <span className="text-xs font-semibold ml-3 mb-0.5" style={{ color: "var(--tg-accent)" }}>
              {message.sender.full_name}
            </span>
          )}

          {/* Reply preview above bubble */}
          {message.reply_to && (
            <div
              className={cn(
                "flex items-stretch gap-2 px-3 py-1.5 mb-px text-xs max-w-full rounded-t-2xl",
                isMe ? "rounded-br-sm self-end" : "rounded-bl-sm self-start"
              )}
              style={{ background: bgColor, opacity: 0.9 }}
            >
              <div className="w-0.5 rounded-full flex-shrink-0 self-stretch" style={{ background: "var(--tg-accent)" }} />
              <div className="min-w-0">
                <div className="font-semibold truncate" style={{ color: "var(--tg-accent)" }}>
                  {message.reply_to.user_id === currentUser?.id ? "You" : message.reply_to.sender?.full_name ?? "Unknown"}
                </div>
                <div className="truncate opacity-70" style={{ color: "var(--tg-text)" }}>
                  {message.reply_to.content}
                </div>
              </div>
            </div>
          )}

          {/* Bubble */}
          <div
            className={cn(
              "relative px-3 py-2 rounded-2xl",
              isMe
                ? cn("rounded-br-sm", message.reply_to && "rounded-tr-none")
                : cn("rounded-bl-sm", message.reply_to && "rounded-tl-none"),
              isMe && isLastInGroup ? "bubble-out" : "",
              !isMe && isLastInGroup ? "bubble-in" : "",
            )}
            style={{ background: bgColor }}
          >
            {/* Hover actions (desktop) */}
            <div
              className={cn(
                "absolute top-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10",
                isMe ? "-left-20" : "-right-20"
              )}
            >
              <button
                onClick={() => setShowEmojiBar(!showEmojiBar)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <Smile size={14} style={{ color: "var(--tg-text-secondary)" }} />
              </button>
              <button
                onClick={onReply}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <Reply size={14} style={{ color: "var(--tg-text-secondary)" }} />
              </button>
            </div>

            {/* Inline emoji bar (hover) */}
            {showEmojiBar && (
              <div
                className={cn(
                  "absolute -top-12 flex items-center gap-0.5 rounded-full px-2 py-1.5 shadow-xl z-20",
                  isMe ? "right-0" : "left-0"
                )}
                style={{ background: "var(--tg-context-bg)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {EMOJI_QUICK.slice(0, 6).map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => { onReaction(emoji); setShowEmojiBar(false); }}
                    className="text-lg w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            {message.type === "audio" && message.media_url ? (
              <AudioMessage url={message.media_url} isMe={isMe} />
            ) : (
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                style={{ color: "var(--tg-text)" }}
              >
                {message.content}
              </p>
            )}

            {/* Time + status row */}
            <div className="flex items-center justify-end gap-1 mt-1 -mb-0.5">
              {message.edited_at && (
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>edited</span>
              )}
              <span className="text-[10px] leading-none" style={{ color: "rgba(255,255,255,0.45)" }}>
                {formatFullTime(message.created_at)}
              </span>
              {isMe && (
                <CheckCheck size={13} style={{ color: "var(--tg-accent)" }} />
              )}
            </div>
          </div>

          {/* Reactions */}
          {Object.keys(reactionGroups).length > 0 && (
            <div className={cn("flex flex-wrap gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
              {Object.entries(reactionGroups).map(([emoji, { count, mine }]) => (
                <button
                  key={emoji}
                  onClick={() => onReaction(emoji)}
                  className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: mine ? "rgba(82,136,193,0.35)" : "rgba(255,255,255,0.08)",
                    border: mine ? "1px solid rgba(82,136,193,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span className="text-sm">{emoji}</span>
                  {count > 1 && (
                    <span style={{ color: mine ? "var(--tg-accent)" : "var(--tg-text-secondary)" }}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
