"use client";

import { RefObject, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import type { MessageWithSender } from "@/types/database";
import { formatDate } from "@/lib/format";

interface MessageListProps {
  messages: MessageWithSender[];
  onReply: (msg: MessageWithSender) => void;
  onReaction: (messageId: string, emoji: string) => void;
  bottomRef: RefObject<HTMLDivElement | null>;
}

function shouldShowDateSeparator(prev: MessageWithSender | null, current: MessageWithSender): boolean {
  if (!prev) return true;
  const prevDate = new Date(prev.created_at).toDateString();
  const currDate = new Date(current.created_at).toDateString();
  return prevDate !== currDate;
}

export function MessageList({ messages, onReply, onReaction, bottomRef }: MessageListProps) {
  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-2"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(82, 136, 193, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(82, 136, 193, 0.03) 0%, transparent 50%)
        `,
      }}
    >
      {messages.map((msg, idx) => {
        const prev = idx > 0 ? messages[idx - 1] : null;
        const next = idx < messages.length - 1 ? messages[idx + 1] : null;
        const showDate = shouldShowDateSeparator(prev, msg);
        const isMe = msg.user_id === "me";
        const isSameSenderAsPrev =
          !showDate && prev?.user_id === msg.user_id;
        const isSameSenderAsNext = next?.user_id === msg.user_id && !shouldShowDateSeparator(msg, next);

        return (
          <div key={msg.id}>
            {showDate && (
              <div className="flex justify-center my-4">
                <span
                  className="px-3 py-1 rounded-full text-xs"
                  style={{
                    background: "rgba(23,33,43,0.8)",
                    color: "var(--tg-text-secondary)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {formatDate(msg.created_at)}
                </span>
              </div>
            )}
            <MessageBubble
              message={msg}
              isMe={isMe}
              isFirstInGroup={!isSameSenderAsPrev}
              isLastInGroup={!isSameSenderAsNext}
              onReply={() => onReply(msg)}
              onReaction={(emoji) => onReaction(msg.id, emoji)}
            />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
