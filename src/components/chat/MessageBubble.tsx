"use client";

import { useState } from "react";
import { Check, CheckCheck, Reply, Smile } from "lucide-react";
import type { MessageWithSender } from "@/types/database";
import { formatFullTime } from "@/lib/format";
import { UserAvatar } from "@/components/ui/ChatAvatar";

const EMOJI_QUICK = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

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
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const bgColor = isMe ? "var(--tg-message-out)" : "var(--tg-message-in)";

  // Group reactions by emoji
  const reactionGroups = (message.reactions ?? []).reduce<Record<string, number>>(
    (acc, r) => {
      acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div
      className={`flex gap-2 mb-0.5 group ${isMe ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowEmojiPicker(false);
      }}
    >
      {/* Avatar for incoming messages (group chats) */}
      {!isMe && isLastInGroup && message.sender && (
        <div className="flex-shrink-0 self-end mb-1">
          <UserAvatar user={message.sender} size="sm" />
        </div>
      )}
      {!isMe && !isLastInGroup && <div className="w-8 flex-shrink-0" />}

      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%] md:max-w-[65%]`}>
        {/* Sender name (group chats, not me) */}
        {!isMe && isFirstInGroup && message.sender && (
          <span
            className="text-xs font-semibold ml-2 mb-1"
            style={{ color: "var(--tg-accent)" }}
          >
            {message.sender.full_name}
          </span>
        )}

        {/* Reply preview */}
        {message.reply_to && (
          <div
            className={`
              flex items-stretch gap-2 rounded-t-xl px-3 py-2 mb-0.5 text-xs max-w-full
              ${isMe ? "self-end" : "self-start"}
            `}
            style={{ background: isMe ? "rgba(43,82,120,0.6)" : "rgba(24,37,51,0.8)" }}
          >
            <div className="w-0.5 rounded-full flex-shrink-0" style={{ background: "var(--tg-accent)" }} />
            <div className="min-w-0">
              <div className="font-semibold truncate" style={{ color: "var(--tg-accent)" }}>
                {message.reply_to.user_id === "me" ? "You" : message.reply_to.sender?.full_name ?? "Unknown"}
              </div>
              <div className="truncate" style={{ color: "var(--tg-text-secondary)" }}>
                {message.reply_to.content}
              </div>
            </div>
          </div>
        )}

        {/* Bubble */}
        <div className="relative">
          {/* Action buttons */}
          {showActions && (
            <div
              className={`
                absolute top-1/2 -translate-y-1/2 flex items-center gap-1 z-10
                ${isMe ? "right-full mr-2" : "left-full ml-2"}
              `}
            >
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <Smile size={14} style={{ color: "var(--tg-text-secondary)" }} />
              </button>
              <button
                onClick={onReply}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <Reply size={14} style={{ color: "var(--tg-text-secondary)" }} />
              </button>

              {/* Emoji picker */}
              {showEmojiPicker && (
                <div
                  className={`
                    absolute top-8 flex items-center gap-1 rounded-full px-2 py-1.5 shadow-xl z-20
                    ${isMe ? "right-0" : "left-0"}
                  `}
                  style={{ background: "#243447" }}
                >
                  {EMOJI_QUICK.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReaction(emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-lg hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Message content */}
          <div
            className={`
              px-3 py-2 rounded-2xl
              ${isMe ? "rounded-br-sm" : "rounded-bl-sm"}
              ${message.reply_to ? (isMe ? "rounded-tr-sm" : "rounded-tl-sm") : ""}
            `}
            style={{ background: bgColor }}
          >
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap break-words"
              style={{ color: "var(--tg-text)" }}
            >
              {message.content}
            </p>

            {/* Time + read status */}
            <div
              className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-end"}`}
            >
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                {formatFullTime(message.created_at)}
                {message.edited_at && " (edited)"}
              </span>
              {isMe && (
                <CheckCheck size={14} style={{ color: "var(--tg-accent)" }} />
              )}
            </div>
          </div>
        </div>

        {/* Reactions */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
            {Object.entries(reactionGroups).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReaction(emoji)}
                className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs transition-colors hover:opacity-80"
                style={{ background: "rgba(82,136,193,0.3)", border: "1px solid rgba(82,136,193,0.4)" }}
              >
                <span>{emoji}</span>
                {count > 1 && <span style={{ color: "var(--tg-accent)" }}>{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
