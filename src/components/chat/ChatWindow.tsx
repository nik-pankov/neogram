"use client";

import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { PinnedMessage } from "./PinnedMessage";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import type { MessageWithSender } from "@/types/database";

function getMockMessages(chatId: string): MessageWithSender[] {
  const now = Date.now();
  const alice = {
    id: "other",
    username: "alice",
    full_name: "Alice Johnson",
    avatar_url: null,
    bio: null,
    phone: null,
    online_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return [
    {
      id: "1",
      chat_id: chatId,
      user_id: "other",
      content: "Hey! How's it going? 👋",
      type: "text",
      media_url: null,
      reply_to_id: null,
      forwarded_from_id: null,
      edited_at: null,
      deleted_at: null,
      pinned: false,
      created_at: new Date(now - 65 * 60000).toISOString(),
      sender: alice,
    },
    {
      id: "2",
      chat_id: chatId,
      user_id: "me",
      content: "Pretty good! Working on NeoGram — a Telegram clone 🚀",
      type: "text",
      media_url: null,
      reply_to_id: null,
      forwarded_from_id: null,
      edited_at: null,
      deleted_at: null,
      pinned: false,
      created_at: new Date(now - 63 * 60000).toISOString(),
    },
    {
      id: "3",
      chat_id: chatId,
      user_id: "other",
      content: "Oh nice! What stack are you using?",
      type: "text",
      media_url: null,
      reply_to_id: null,
      forwarded_from_id: null,
      edited_at: null,
      deleted_at: null,
      pinned: false,
      created_at: new Date(now - 62 * 60000).toISOString(),
      sender: alice,
    },
    {
      id: "4",
      chat_id: chatId,
      user_id: "me",
      content: "Next.js 16 + Supabase + Tailwind + shadcn/ui\n\nRealtime messaging with Supabase Channels, PWA support, dark theme — the whole thing!",
      type: "text",
      media_url: null,
      reply_to_id: null,
      forwarded_from_id: null,
      edited_at: null,
      deleted_at: null,
      pinned: true,
      created_at: new Date(now - 60 * 60000).toISOString(),
    },
    {
      id: "5",
      chat_id: chatId,
      user_id: "other",
      content: "That sounds absolutely amazing! 🔥",
      type: "text",
      media_url: null,
      reply_to_id: null,
      forwarded_from_id: null,
      edited_at: null,
      deleted_at: null,
      pinned: false,
      created_at: new Date(now - 35 * 60000).toISOString(),
      sender: alice,
      reactions: [
        { id: "r1", message_id: "5", user_id: "me", emoji: "🔥", created_at: new Date().toISOString() },
        { id: "r2", message_id: "5", user_id: "u2", emoji: "🔥", created_at: new Date().toISOString() },
        { id: "r3", message_id: "5", user_id: "me", emoji: "❤️", created_at: new Date().toISOString() },
      ],
    },
    {
      id: "6",
      chat_id: chatId,
      user_id: "me",
      content: "I'll send you a link when it's live!",
      type: "text",
      media_url: null,
      reply_to_id: null,
      forwarded_from_id: null,
      edited_at: null,
      deleted_at: null,
      pinned: false,
      created_at: new Date(now - 5 * 60000).toISOString(),
      reply_to: {
        id: "5",
        chat_id: chatId,
        user_id: "other",
        content: "That sounds absolutely amazing! 🔥",
        type: "text",
        media_url: null,
        reply_to_id: null,
        forwarded_from_id: null,
        edited_at: null,
        deleted_at: null,
        pinned: false,
        created_at: new Date(now - 35 * 60000).toISOString(),
        sender: alice,
      },
    },
  ];
}

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>(() => getMockMessages(chatId));
  const [replyTo, setReplyTo] = useState<MessageWithSender | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMessages(getMockMessages(chatId));
    setReplyTo(null);
    // Simulate typing after chat change
    const t = setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }, 2000);
    return () => clearTimeout(t);
  }, [chatId]);

  const pinnedMessage = messages.find((m) => m.pinned);

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

    // Simulate reply after delay
    if (typingTimer.current) clearTimeout(typingTimer.current);
    setIsTyping(true);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      const replies = [
        "Got it! 👍",
        "Sounds good!",
        "Interesting...",
        "Thanks for the info!",
        "I'll check it out 🔍",
        "Perfect! 🎉",
        "Nice one! 😄",
      ];
      const replyMsg: MessageWithSender = {
        id: (Date.now() + 1).toString(),
        chat_id: chatId,
        user_id: "other",
        content: replies[Math.floor(Math.random() * replies.length)],
        type: "text",
        media_url: null,
        reply_to_id: null,
        forwarded_from_id: null,
        edited_at: null,
        deleted_at: null,
        pinned: false,
        created_at: new Date().toISOString(),
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
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1500 + Math.random() * 1500);
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
            { id: Date.now().toString(), message_id: messageId, user_id: "me", emoji, created_at: new Date().toISOString() },
          ],
        };
      })
    );
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ background: "var(--tg-chat-bg)" }}>
      <ChatHeader chatId={chatId} />
      {pinnedMessage && <PinnedMessage message={pinnedMessage} />}
      <MessageList
        messages={messages}
        onReply={setReplyTo}
        onReaction={handleReaction}
        bottomRef={bottomRef}
        isTyping={isTyping}
        typingUser="Alice"
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
