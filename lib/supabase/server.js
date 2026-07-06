// Server-side Supabase client — used in Server Components, Route Handlers,
// and Server Actions. Reads/writes the session via Next.js cookies(), so
// requests are scoped to whoever is actually logged in (RLS-enforced).

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component that can't set cookies (no
            // response to attach them to) — middleware refreshes the
            // session on every request, so this is safe to ignore.
          }
        },
      },
    }
  );
}
