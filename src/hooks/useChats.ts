"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatWithLastMessage } from "@/types/database";
import { useAppStore } from "@/store/app.store";

export function useChats() {
  const [loading, setLoading] = useState(true);
  const { chats, setChats, currentUser } = useAppStore();
  const supabase = createClient();

  const fetchChats = useCallback(async () => {
    if (!currentUser) return;

    // Get all chats where user is a member
    const { data: memberships } = await supabase
      .from("chat_members")
      .select("chat_id")
      .eq("user_id", currentUser.id);

    if (!memberships?.length) { setLoading(false); return; }

    const chatIds = memberships.map((m) => m.chat_id);

    const { data: chatsData } = await supabase
      .from("chats")
      .select(`
        *,
        members:chat_members(
          user_id, role, last_read_at,
          profile:profiles(*)
        )
      `)
      .in("id", chatIds)
      .order("updated_at", { ascending: false });

    if (!chatsData) { setLoading(false); return; }

    // For each chat, get last message + unread count
    const enriched: ChatWithLastMessage[] = await Promise.all(
      chatsData.map(async (chat) => {
        // Last message
        const { data: lastMsgData } = await supabase
          .from("messages")
          .select("*, sender:profiles(*)")
          .eq("chat_id", chat.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Unread count
        const myMembership = (chat.members as { user_id: string; last_read_at: string | null }[])
          ?.find((m) => m.user_id === currentUser.id);
        let unreadCount = 0;
        if (myMembership?.last_read_at) {
          const { count } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("chat_id", chat.id)
            .neq("user_id", currentUser.id)
            .gt("created_at", myMembership.last_read_at)
            .is("deleted_at", null);
          unreadCount = count ?? 0;
        } else {
          const { count } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("chat_id", chat.id)
            .neq("user_id", currentUser.id)
            .is("deleted_at", null);
          unreadCount = count ?? 0;
        }

        // For private chats, get the other user as display info
        let displayName = chat.name;
        let otherUser = null;
        if (chat.type === "private") {
          const other = (chat.members as { user_id: string; profile: { full_name: string | null } }[])
            ?.find((m) => m.user_id !== currentUser.id);
          if (other?.profile) {
            displayName = other.profile.full_name;
            otherUser = other.profile;
          }
        }

        return {
          ...chat,
          name: displayName,
          other_user: otherUser,
          last_message: lastMsgData ?? undefined,
          unread_count: unreadCount,
        } as ChatWithLastMessage;
      })
    );

    // Sort: by last message time desc
    enriched.sort((a, b) => {
      const aTime = a.last_message?.created_at ?? a.updated_at;
      const bTime = b.last_message?.created_at ?? b.updated_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    setChats(enriched);
    setLoading(false);
  }, [currentUser, supabase, setChats]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Realtime: subscribe to new messages → refresh chat list
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel("chats-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => fetchChats()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser, supabase, fetchChats]);

  return { chats, loading, refetch: fetchChats };
}
