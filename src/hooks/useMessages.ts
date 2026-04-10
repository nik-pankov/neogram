"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MessageWithSender } from "@/types/database";
import { useAppStore } from "@/store/app.store";

export function useMessages(chatId: string | null) {
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { messages, setMessages, addMessage, currentUser } = useAppStore();
  const supabase = createClient();
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);

    const { data } = await supabase
      .from("messages")
      .select(`
        *,
        sender:profiles(*),
        reply_to:messages(
          id, content, type, user_id,
          sender:profiles(id, full_name)
        ),
        reactions(*)
      `)
      .eq("chat_id", chatId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(100);

    if (data) setMessages(chatId, data as MessageWithSender[]);
    setLoading(false);

    // Mark as read
    if (currentUser) {
      await supabase
        .from("chat_members")
        .update({ last_read_at: new Date().toISOString() })
        .eq("chat_id", chatId)
        .eq("user_id", currentUser.id);
    }
  }, [chatId, currentUser, supabase, setMessages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime: new messages
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          // Fetch full message with sender info
          const { data } = await supabase
            .from("messages")
            .select(`
              *,
              sender:profiles(*),
              reply_to:messages(id, content, type, user_id, sender:profiles(id, full_name)),
              reactions(*)
            `)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            addMessage(chatId, data as MessageWithSender);

            // Mark read if this chat is open
            if (currentUser && data.user_id !== currentUser.id) {
              await supabase
                .from("chat_members")
                .update({ last_read_at: new Date().toISOString() })
                .eq("chat_id", chatId)
                .eq("user_id", currentUser.id);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from("messages")
            .select("*, sender:profiles(*), reactions(*)")
            .eq("id", payload.new.id)
            .single();
          if (data) {
            const current = messages[chatId] ?? [];
            setMessages(
              chatId,
              current.map((m) => (m.id === data.id ? (data as MessageWithSender) : m))
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chatId, currentUser, supabase, addMessage, messages, setMessages]);

  const sendMessage = useCallback(
    async (content: string, replyToId?: string) => {
      if (!chatId || !currentUser || !content.trim()) return null;

      const { data, error } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          user_id: currentUser.id,
          content: content.trim(),
          type: "text",
          reply_to_id: replyToId ?? null,
        })
        .select("*, sender:profiles(*), reactions(*)")
        .single();

      if (error) { console.error("Send error:", error); return null; }

      // Update chat's updated_at
      await supabase
        .from("chats")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", chatId);

      return data;
    },
    [chatId, currentUser, supabase]
  );

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!currentUser) return;

      const { data: existing } = await supabase
        .from("reactions")
        .select("id")
        .eq("message_id", messageId)
        .eq("user_id", currentUser.id)
        .eq("emoji", emoji)
        .single();

      if (existing) {
        await supabase.from("reactions").delete().eq("id", existing.id);
      } else {
        await supabase.from("reactions").insert({
          message_id: messageId,
          user_id: currentUser.id,
          emoji,
        });
      }

      // Refresh reactions for this message
      const { data: updatedMsg } = await supabase
        .from("messages")
        .select("*, sender:profiles(*), reactions(*)")
        .eq("id", messageId)
        .single();

      if (updatedMsg && chatId) {
        const current = messages[chatId] ?? [];
        setMessages(
          chatId,
          current.map((m) => (m.id === messageId ? (updatedMsg as MessageWithSender) : m))
        );
      }
    },
    [currentUser, chatId, messages, setMessages, supabase]
  );

  return {
    messages: messages[chatId ?? ""] ?? [],
    loading,
    isTyping,
    sendMessage,
    toggleReaction,
    refetch: fetchMessages,
  };
}
