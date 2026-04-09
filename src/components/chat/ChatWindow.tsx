"use client";

import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import type { MessageWithSender } from "@/types/database";

// Mock messages for demo
function getMockMessages(chatId: string): MessageWithSender[] {
  const now = Date.now();
  const msgs: MessageWithSender[] = [
    {
      id: "1",
      chat_id: chatId,
      user_id: "other",
      content: "Hey! How's it going?",
      type: "text",
      media_url: null,
      reply_to_id: null,
      forwarded_from_id: null,
      edited_at: null,
      deleted_at: null,
      pinned: false,
      created_at: new Date(now - 60 * 60000).toISOString(),
      sender: {
        id: "other",
        username: "alice",
        full_name: "Alice Johnson",
        avatar_url: null,
        bio: null,
        phone: null,
        online_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    {
      id: "2",
      chat_id: chatId,
      user_id: "me",
      content: "Pretty good! Working on a new project 🚀",
      type: "text",
      media_url: null,
      reply_to_id: null,
      forwarded_from_id: null,
      edited_at: null,
      deleted_at: null,
      pinned: false,
      created_at: new Date(now - 58 * 60000).toISOString(),
    },
    {
      id: "3",
      chat_id: chatId,
      user_id: "other",
      content: "Oh nice! What kind of project?",
      type: "text",
      media_url: null,
      reply_to_id: null,
      forwarded_from_id: null,
      edited_at: null,
      deleted_at: null,
      pinned: false,
      created_at: new Date(now - 55 * 60000).toISOString(),
      sender: {
        id: "other",
        username: "alice",
        full_name: "Alice Johnson",
        avatar_url: null,
        bio: null,
        phone: null,
        online_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    {
      id: "4",
      chat_id: chatId,
      user_id: "me",
      content: "Building a Telegram clone! NeoGram 😎\nIt's gonna be awesome with realtime messaging, reactions, voice messages and everything.",
      type: "text",
      media_url: null,
      reply_to_id: null,
      forwarded_from_id: null,
      edited_at: null,
      deleted_at: null,
      pinned: false,
      created_at: new Date(now - 50 * 60000).toISOString(),
    },
    {
      id: "5",
      chat_id: chatId,
      user_id: "other",
      content: "That sounds amazing! I'd love to try it 🔥",
      type: "text",
      media_url: null,
      reply_to_id: null,
      forwarded_from_id: null,
      edited_at: null,
      deleted_at: null,
      pinned: false,
      created_at: new Date(now - 30 * 60000).toISOString(),
      sender: {
        id: "other",
        username: "alice",
        full_name: "Alice Johnson",
        avatar_url: null,
        bio: null,
        phone: null,
        online_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      reactions: [
        {
          id: "r1",
          message_id: "5",
          user_id: "me",
          emoji: "👍",
          created_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: "6",
      chat_id: chatId,
      user_id: "me",
      content: "I'll send you a link when it's ready!",
      type: "text",
      media_url: null,
      reply_to_id: null,
      forwarded_from_id: null,
      edited_at: null,
      deleted_at: null,
      pinned: false,
      created_at: new Date(now - 5 * 60000).toISOString(),
    },
  ];
  return msgs;
}

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>(() =>
    getMockMessages(chatId)
  );
  const [replyTo, setReplyTo] = useState<MessageWithSender | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(getMockMessages(chatId));
    setReplyTo(null);
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (content: string) => {
    const newMsg: MessageWithSender = {
      id: Date.now().toString(),
      chat_id: chatId,
      user_id: "me",
      content,
      type: "text",
      media_url: null,
      reply_to_id: replyTo?.id ?? null,
      forwarded_from_id: null,
      edited_at: null,
      deleted_at: null,
      pinned: false,
      created_at: new Date().toISOString(),
      reply_to: replyTo ?? undefined,
    };
    setMessages((prev) => [...prev, newMsg]);
    setReplyTo(null);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = m.reactions ?? [];
        const existing = reactions.find((r) => r.emoji === emoji && r.user_id === "me");
        if (existing) {
          return { ...m, reactions: reactions.filter((r) => r.id !== existing.id) };
        }
        return {
          ...m,
          reactions: [
            ...reactions,
            {
              id: Date.now().toString(),
              message_id: messageId,
              user_id: "me",
              emoji,
              created_at: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ background: "var(--tg-chat-bg)" }}>
      <ChatHeader chatId={chatId} />
      <MessageList
        messages={messages}
        onReply={setReplyTo}
        onReaction={handleReaction}
        bottomRef={bottomRef}
      />
      <MessageInput
        chatId={chatId}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSend={handleSend}
      />
    </div>
  );
}
