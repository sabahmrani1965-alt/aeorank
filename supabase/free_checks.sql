-- Free AI visibility checker (/free-ai-visibility-checker).
-- Run once in the Supabase SQL editor. Until this table exists the public
-- checker refuses to run, so it can never run without its rate limits.

CREATE TABLE IF NOT EXISTS public.free_checks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  ip_hash     TEXT NOT NULL,
  domain      TEXT NOT NULL,
  brand       TEXT,
  score       INTEGER,
  total       INTEGER,
  hits        INTEGER,
  competitors JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS free_checks_created_idx ON public.free_checks(created_at DESC);
CREATE INDEX IF NOT EXISTS free_checks_email_idx ON public.free_checks(email, created_at DESC);
CREATE INDEX IF NOT EXISTS free_checks_ip_idx ON public.free_checks(ip_hash, created_at DESC);

-- Service role only: no policies, so the anon and authenticated keys see nothing.
ALTER TABLE public.free_checks ENABLE ROW LEVEL SECURITY;
