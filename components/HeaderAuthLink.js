"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Kept as its own tiny client component so Header.js can stay a server
// component — checking auth state here means Header doesn't need cookies(),
// which would force every page importing it into dynamic rendering.
export default function HeaderAuthLink() {
  const [loggedIn, setLoggedIn] = useState(null);

  useEffect(() => {
    // Until a real Supabase project exists, hide this entirely rather than
    // showing a "Log in" link that dead-ends for real visitors.
    if (!isSupabaseConfigured()) return;

    let supabase;
    try {
      supabase = createClient();
    } catch {
      return;
    }
    supabase.auth.getUser().then(({ data }) => setLoggedIn(Boolean(data?.user)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session?.user));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loggedIn === null) return null;

  return loggedIn ? (
    <Link href="/dashboard" className="header-link">Dashboard</Link>
  ) : (
    <Link href="/login" className="header-link">Log in</Link>
  );
}
