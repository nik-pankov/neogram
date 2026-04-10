"use client";

import { useState, useRef } from "react";
import { ChatHeader } from "./ChatHeader";
import { PinnedMessage } from "./PinnedMessage";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useMessages } from "@/hooks/useMessages";
import { useAppStore } from "@/store/app.store";
import type { MessageWithSender } from "@/types/database";
import { Loader2 } from "lucide-react";

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { messages, loading, isTyping, sendMessage, toggleReaction } = useMessages(chatId);
  const { chats } = useAppStore();
  const [replyTo, setReplyTo] = useState<MessageWithSender | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chat = chats.find((c) => c.id === chatId);
  const pinnedMessage = messages.find((m) => m.pinned);

  const handleSend = async (content: string) => {
    await sendMessage(content, replyTo?.id);
    setReplyTo(null);
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    await toggleReaction(messageId, emoji);
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ background: "var(--tg-chat-bg)" }}>
      <ChatHeader chatId={chatId} chat={chat} />
      {pinnedMessage && <PinnedMessage message={pinnedMessage} />}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--tg-text-secondary)" }} />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center chat-bg">
          <div className="text-center px-6">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-sm" style={{ color: "var(--tg-text-secondary)" }}>
              No messages yet. Say hello!
            </p>
          </div>
        </div>
      ) : (
        <MessageList
          messages={messages}
          onReply={setReplyTo}
          onReaction={handleReaction}
          bottomRef={bottomRef}
          isTyping={isTyping}
        />
      )}

      <MessageInput
        chatId={chatId}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSend={handleSend}
      />
    </div>
  );
}
