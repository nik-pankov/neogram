"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Paperclip, Smile, Mic, Send, X, Reply } from "lucide-react";
import type { MessageWithSender } from "@/types/database";

interface MessageInputProps {
  chatId: string;
  replyTo: MessageWithSender | null;
  onCancelReply: () => void;
  onSend: (content: string) => void;
}

export function MessageInput({ chatId, replyTo, onCancelReply, onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  };

  const hasText = text.trim().length > 0;

  return (
    <div
      className="flex-shrink-0 px-3 pb-3 pt-2"
      style={{ background: "var(--tg-chat-bg)" }}
    >
      {/* Reply preview */}
      {replyTo && (
        <div
          className="flex items-center gap-2 rounded-t-xl px-3 py-2 mb-1"
          style={{ background: "var(--tg-input)", borderLeft: "3px solid var(--tg-accent)" }}
        >
          <Reply size={14} style={{ color: "var(--tg-accent)" }} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold" style={{ color: "var(--tg-accent)" }}>
              {replyTo.user_id === "me" ? "You" : replyTo.sender?.full_name ?? "Unknown"}
            </div>
            <div className="text-xs truncate" style={{ color: "var(--tg-text-secondary)" }}>
              {replyTo.content}
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/10"
            style={{ color: "var(--tg-text-secondary)" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input bar */}
      <div
        className="flex items-end gap-2 rounded-2xl px-3 py-2"
        style={{ background: "var(--tg-input)" }}
      >
        {/* Attach */}
        <button
          className="flex-shrink-0 p-1 mb-0.5 rounded-full hover:bg-white/10 transition-colors"
          style={{ color: "var(--tg-text-secondary)" }}
        >
          <Paperclip size={20} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none text-sm leading-6 max-h-[150px] overflow-y-auto"
          style={{
            color: "var(--tg-text)",
          }}
        />

        {/* Emoji */}
        <button
          className="flex-shrink-0 p-1 mb-0.5 rounded-full hover:bg-white/10 transition-colors"
          style={{ color: "var(--tg-text-secondary)" }}
        >
          <Smile size={20} />
        </button>

        {/* Send / Mic */}
        <button
          onClick={hasText ? handleSend : undefined}
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{
            background: hasText ? "var(--tg-accent)" : "transparent",
            color: hasText ? "#fff" : "var(--tg-text-secondary)",
          }}
        >
          {hasText ? <Send size={18} /> : <Mic size={20} />}
        </button>
      </div>
    </div>
  );
}
