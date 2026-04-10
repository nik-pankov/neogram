"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Paperclip, Smile, Mic, Send, X, Reply, Image as ImageIcon, FileText, Camera, MapPin } from "lucide-react";
import type { MessageWithSender } from "@/types/database";
import { cn } from "@/lib/utils";
import { VoiceRecorder } from "./VoiceRecorder";

const EMOJI_PANEL = [
  "😀","😂","🥰","😎","🤔","😭","🔥","❤️","👍","👏",
  "🎉","🚀","💯","✨","🙏","😅","🤣","😊","😍","🥳",
  "😤","🤯","😱","🤩","😴","🥺","😇","🤗","😏","😬",
];

const ATTACH_OPTIONS = [
  { icon: ImageIcon, label: "Photo or Video", color: "#5288c1" },
  { icon: FileText,  label: "File",           color: "#7c5cbf" },
  { icon: Camera,    label: "Camera",          color: "#e53e3e" },
  { icon: MapPin,    label: "Location",        color: "#38a169" },
];

interface MessageInputProps {
  chatId: string;
  replyTo: MessageWithSender | null;
  onCancelReply: () => void;
  onSend: (content: string) => void;
  onSendVoice?: (blob: Blob, duration: number) => void;
}

export function MessageInput({ chatId, replyTo, onCancelReply, onSend, onSendVoice }: MessageInputProps) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasText = text.trim().length > 0;

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    setShowEmoji(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  }, [text, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) { setText((t) => t + emoji); return; }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    setText(text.slice(0, start) + emoji + text.slice(end));
    setTimeout(() => { el.selectionStart = el.selectionEnd = start + emoji.length; el.focus(); }, 0);
  };

  if (showVoice) {
    return (
      <div className="flex-shrink-0 px-3 pb-3 pt-2" style={{ background: "var(--tg-chat-bg)" }}>
        <VoiceRecorder
          onSend={(blob, dur) => { onSendVoice?.(blob, dur); setShowVoice(false); }}
          onCancel={() => setShowVoice(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex-shrink-0" style={{ background: "var(--tg-chat-bg)" }}>
      {/* Emoji panel */}
      {showEmoji && (
        <div className="px-3 py-3 grid grid-cols-10 gap-1"
          style={{ background: "var(--tg-input)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {EMOJI_PANEL.map((emoji) => (
            <button key={emoji} onClick={() => insertEmoji(emoji)}
              className="text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all hover:scale-125 active:scale-95">
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Attach panel */}
      {showAttach && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowAttach(false)} />
          <div className="mx-3 mb-2 rounded-2xl overflow-hidden shadow-xl relative z-20"
            style={{ background: "var(--tg-context-bg)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {ATTACH_OPTIONS.map(({ icon: Icon, label, color }) => (
              <button key={label} onClick={() => setShowAttach(false)}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors hover:bg-white/8"
                style={{ color: "var(--tg-text)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: color + "33" }}>
                  <Icon size={15} style={{ color }} />
                </div>
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="px-3 pb-3 pt-2">
        {/* Reply preview */}
        {replyTo && (
          <div className="flex items-center gap-2 rounded-t-xl px-3 py-2 mb-1"
            style={{ background: "var(--tg-input)", borderLeft: "2px solid var(--tg-accent)" }}>
            <Reply size={13} style={{ color: "var(--tg-accent)", flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold" style={{ color: "var(--tg-accent)" }}>
                {replyTo.sender?.full_name ?? "You"}
              </div>
              <div className="text-xs truncate" style={{ color: "var(--tg-text-secondary)" }}>
                {replyTo.content}
              </div>
            </div>
            <button onClick={onCancelReply} className="p-1 rounded-full hover:bg-white/10 flex-shrink-0"
              style={{ color: "var(--tg-text-secondary)" }}>
              <X size={13} />
            </button>
          </div>
        )}

        {/* Input bar */}
        <div className="flex items-end gap-1 rounded-2xl px-2 py-1" style={{ background: "var(--tg-input)" }}>
          <button
            onClick={() => { setShowAttach(!showAttach); setShowEmoji(false); }}
            className="flex-shrink-0 p-2 rounded-full transition-colors mb-0.5"
            style={{ color: showAttach ? "var(--tg-accent)" : "var(--tg-text-secondary)" }}
          >
            <Paperclip size={20} />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm leading-6 py-1.5 max-h-[140px] overflow-y-auto"
            style={{ color: "var(--tg-text)" }}
          />

          <button
            onClick={() => { setShowEmoji(!showEmoji); setShowAttach(false); }}
            className="flex-shrink-0 p-2 rounded-full transition-colors mb-0.5"
            style={{ color: showEmoji ? "var(--tg-accent)" : "var(--tg-text-secondary)" }}
          >
            <Smile size={20} />
          </button>

          <button
            onClick={hasText ? handleSend : () => { setShowVoice(true); setShowEmoji(false); setShowAttach(false); }}
            className={cn("flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all mb-0.5", hasText ? "" : "hover:bg-white/10")}
            style={{ background: hasText ? "var(--tg-accent)" : "transparent", color: hasText ? "#fff" : "var(--tg-text-secondary)" }}
          >
            {hasText ? <Send size={17} className="ml-0.5" /> : <Mic size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
