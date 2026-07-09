"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSupabase, hasSupabaseConfig } from "./supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const configured = hasSupabaseConfig();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(configured);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data } = await getSupabase().from("profiles").select("*").eq("id", userId).maybeSingle();
    setProfile(data || null);
  }, []);

  useEffect(() => {
    if (!configured) return;
    const supabase = getSupabase();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      await loadProfile(session?.user?.id);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      await loadProfile(session?.user?.id);
    });

    return () => sub.subscription.unsubscribe();
  }, [configured, loadProfile]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
  }, []);

  const value = {
    user: session?.user || null,
    profile,
    role: profile?.role || null,
    isAdmin: profile?.role === "admin",
    loading,
    configured,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
