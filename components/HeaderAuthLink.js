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
  const [isAdmin, setIsAdmin] = useState(false);

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

    function checkAdmin(user) {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      // ADMIN_EMAILS is server-only, so this asks the server rather than
      // shipping the allowlist to the client bundle.
      fetch("/api/is-admin")
        .then((res) => res.json())
        .then((data) => setIsAdmin(Boolean(data?.isAdmin)))
        .catch(() => setIsAdmin(false));
    }

    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(Boolean(data?.user));
      checkAdmin(data?.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session?.user));
      checkAdmin(session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loggedIn === null) return null;

  if (!loggedIn) {
    return <Link href="/login" className="header-link">Log in</Link>;
  }

  return (
    <>
      {isAdmin && <Link href="/admin" className="header-link">Admin</Link>}
      <Link href="/dashboard" className="header-link">Dashboard</Link>
    </>
  );
}
