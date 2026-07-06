// Service-role Supabase client — bypasses Row Level Security. Server-only,
// never import this from a client component. Used exclusively by the
// Stripe webhook, which has no user session/cookie to key requests off of
// (a checkout can complete for someone who has never logged in yet).

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let _admin = null;
export function createAdminClient() {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _admin = createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}

// Resolve the auth.users id for an email, creating the account if it
// doesn't exist yet (e.g. someone paid before ever logging in). Falls back
// to a lookup against public.users (populated by the handle_new_user
// trigger) rather than paginating admin.auth.admin.listUsers(), which is
// slower and versions differently across supabase-js releases.
export async function ensureUserId(admin, email) {
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (!createErr && created?.user?.id) return created.user.id;

  const { data: existing, error: lookupErr } = await admin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (lookupErr) throw lookupErr;
  if (!existing?.id) throw createErr || new Error(`No user found for ${email}`);
  return existing.id;
}
