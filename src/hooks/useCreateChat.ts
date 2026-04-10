"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/app.store";
import type { Profile } from "@/types/database";

export function useCreateChat() {
  const [loading, setLoading] = useState(false);
  const { currentUser, setSelectedChatId } = useAppStore();
  const supabase = createClient();

  // Find or create private chat with another user
  const openPrivateChat = useCallback(
    async (otherUserId: string) => {
      if (!currentUser) return;
      setLoading(true);

      // Check if private chat already exists between these two users
      const { data: existing } = await supabase
        .from("chat_members")
        .select("chat_id")
        .eq("user_id", currentUser.id);

      if (existing?.length) {
        const myChats = existing.map((m) => m.chat_id);
        const { data: shared } = await supabase
          .from("chat_members")
          .select("chat_id, chats!inner(type)")
          .eq("user_id", otherUserId)
          .in("chat_id", myChats);

        const privateShared = (shared as { chat_id: string; chats: { type: string } }[])
          ?.find((m) => m.chats?.type === "private");

        if (privateShared) {
          setSelectedChatId(privateShared.chat_id);
          setLoading(false);
          return privateShared.chat_id;
        }
      }

      // Create new private chat
      const { data: chat } = await supabase
        .from("chats")
        .insert({ type: "private", created_by: currentUser.id })
        .select()
        .single();

      if (!chat) { setLoading(false); return null; }

      // Add both members
      await supabase.from("chat_members").insert([
        { chat_id: chat.id, user_id: currentUser.id, role: "owner" },
        { chat_id: chat.id, user_id: otherUserId, role: "member" },
      ]);

      setSelectedChatId(chat.id);
      setLoading(false);
      return chat.id;
    },
    [currentUser, supabase, setSelectedChatId]
  );

  // Search users by name or username
  const searchUsers = useCallback(
    async (query: string): Promise<Profile[]> => {
      if (!query.trim() || !currentUser) return [];

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", currentUser.id)
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(20);

      return (data as Profile[]) ?? [];
    },
    [currentUser, supabase]
  );

  return { openPrivateChat, searchUsers, loading };
}
