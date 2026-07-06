// Shared by both client and server code (no cookies()/next-only imports
// here) — lets UI hide auth entirely until a real Supabase project exists,
// instead of showing a login link or dashboard that just errors.
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
