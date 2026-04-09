"use client";

import { RefObject, useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import type { MessageWithSender } from "@/types/database";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: MessageWithSender[];
  onReply: (msg: MessageWithSender) => void;
  onReaction: (messageId: string, emoji: string) => void;
  bottomRef: RefObject<HTMLDivElement | null>;
  isTyping?: boolean;
  typingUser?: string;
}

function shouldShowDateSeparator(prev: MessageWithSender | null, current: MessageWithSender): boolean {
  if (!prev) return true;
  return new Date(prev.created_at).toDateString() !== new Date(current.created_at).toDateString();
}

export function MessageList({
  messages,
  onReply,
  onReaction,
  bottomRef,
  isTyping = false,
  typingUser,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const isAtBottomRef = useRef(true);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distFromBottom < 80;
    isAtBottomRef.current = atBottom;
    setShowScrollBtn(!atBottom);
    if (atBottom) setNewCount(0);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "instant" });
    setNewCount(0);
    setShowScrollBtn(false);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom(true);
    } else {
      setNewCount((n) => n + 1);
    }
  }, [messages.length, scrollToBottom]);

  // Initial scroll
  useEffect(() => {
    scrollToBottom(false);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="chat-bg h-full overflow-y-auto px-4 py-2 pb-4"
      >
        {messages.map((msg, idx) => {
          const prev = idx > 0 ? messages[idx - 1] : null;
          const next = idx < messages.length - 1 ? messages[idx + 1] : null;
          const showDate = shouldShowDateSeparator(prev, msg);
          const isMe = msg.user_id === "me";
          const isSameSenderAsPrev = !showDate && prev?.user_id === msg.user_id;
          const isSameSenderAsNext = next?.user_id === msg.user_id &&
            !shouldShowDateSeparator(msg, next);

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex justify-center my-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs select-none"
                    style={{
                      background: "rgba(14,22,33,0.75)",
                      color: "var(--tg-text-secondary)",
                      backdropFilter: "blur(8px)",
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

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start mt-1">
            <TypingIndicator name={typingUser} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom(true)}
          className={cn(
            "absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 z-10",
          )}
          style={{
            background: "var(--tg-header)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {newCount > 0 && (
            <span
              className="absolute -top-2 -right-1 min-w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center px-1"
              style={{ background: "var(--tg-accent)", color: "#fff" }}
            >
              {newCount}
            </span>
          )}
          <ChevronDown size={18} style={{ color: "var(--tg-text)" }} />
        </button>
      )}
    </div>
  );
}
