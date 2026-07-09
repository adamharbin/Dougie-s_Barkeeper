import { createClient } from "@supabase/supabase-js";

// Lazy singleton: avoids constructing the client (and validating the URL) at
// module-import time, which would blow up Next.js's server-side prerender of
// this client-only app before real env vars are configured.
let client;

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabase() {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}
