"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { useAppStore } from "@/store/app.store";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentUser } = useAppStore();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchProfile(user.id);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setCurrentUser(null);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setCurrentUser(data as Profile);
    } else {
      // Create profile if doesn't exist
      const authUser = await supabase.auth.getUser();
      const meta = authUser.data.user?.user_metadata;
      const newProfile: Profile = {
        id: userId,
        full_name: meta?.full_name ?? meta?.name ?? null,
        username: null,
        avatar_url: meta?.avatar_url ?? null,
        bio: null,
        phone: null,
        online_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await supabase.from("profiles").insert(newProfile);
      setCurrentUser(newProfile);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signOut };
}
