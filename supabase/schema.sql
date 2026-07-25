-- ============================================================
-- AEOrank — Supabase Schema
-- Run this in your Supabase SQL editor (Settings → SQL Editor)
-- ============================================================

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email              TEXT NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  -- 'customer' (default) | 'poster' — posters are admin-invited accounts
  -- that fulfill tasks claimed from the shared pool, not customers
  -- themselves. See report_drafts.claimed_by below.
  role               TEXT NOT NULL DEFAULT 'customer',
  -- Set at role-flip time — either by lib/posterAccount.js (legacy
  -- admin-approval path) or app/api/poster/verify-reddit (current
  -- self-serve signup path) — the Reddit account they told us they'd
  -- post from. NULL for customers and for posters invited directly
  -- (app/api/admin/posters) without going through either apply flow.
  reddit_username    TEXT,
  -- Result of lib/reddit.js's checkRedditAccount() at the moment the role
  -- flipped to 'poster': 'active' (confirmed via Reddit OAuth, a direct
  -- fetch, or the Apify user-scraper actor — all read the account's real
  -- profile) | 'active_approx' (confirmed via Pullpush's historical
  -- archive instead — an approximation derived from post history, not
  -- the account itself) | 'unverified' (couldn't check any way — neither
  -- a rejection nor a confirmation). Never
  -- 'suspended'/'unavailable'/'too_new'/'low_karma'/'not_found'/'invalid'
  -- — those are rejected before the role ever flips.
  reddit_check_status TEXT,
  -- 'aeorank' | 'crewquest' | NULL (historical rows predating this column) —
  -- which signup flow created this account (components/SignupForm.js's
  -- `intent` prop, both the password/magic-link path and the Google OAuth
  -- path via an `oauth_intent` cookie read by app/auth/callback/route.js).
  -- Independent of `role`: role only ever flips to 'poster' after real
  -- Reddit verification (a deliberate anti-fraud gate), so someone who
  -- signs up via /apply-poster but never finishes verification stays
  -- role='customer' forever — this column is what lets admin/posters
  -- still show them as a CrewQuest signup instead of looking exactly
  -- like a genuine AEOrank customer.
  signup_source      TEXT,
  -- Which of this user's company_profiles ("brands") is currently active —
  -- resolved via lib/brands.js's getActiveCompanyProfile, which
  -- self-heals this to the user's oldest brand if it's ever null/stale/
  -- deleted. NULL for a user with zero brands. No inline REFERENCES here:
  -- company_profiles is defined later in this file and itself references
  -- public.users, so the FK is added via ALTER TABLE right after
  -- company_profiles is created below (avoids a forward-reference error
  -- on a fresh install).
  active_company_profile_id UUID,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own record"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can do anything on users"
  ON public.users FOR ALL
  USING (auth.role() = 'service_role');

-- ── SUBSCRIPTIONS ────────────────────────────────────────────
-- One row per Stripe subscription. Created at checkout.session.completed,
-- then kept in sync in place by customer.subscription.updated/.deleted and
-- invoice.payment_failed. `plan` matches the keys in lib/stripe.js PLANS.
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id     TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  -- 'comp' = granted via a redeem code (see redeem_codes below), no real
  -- Stripe subscription behind it.
  plan                   TEXT NOT NULL CHECK (plan IN ('starter', 'growth', 'scale', 'comp')),
  status                 TEXT NOT NULL, -- trialing/active/past_due/canceled/unpaid/incomplete/incomplete_expired
  brand                  TEXT,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- ── REDEEM CODES ─────────────────────────────────────────────
-- Grants free ('comp') access without going through Stripe at all.
-- Redemption (lookup + use-count increment + inserting the resulting
-- subscriptions row) always goes through the service-role admin client in
-- app/api/redeem-code/route.js — no user-facing policies, this table isn't
-- user-scoped so the usual "own row" RLS pattern doesn't apply.
CREATE TABLE IF NOT EXISTS public.redeem_codes (
  code        TEXT PRIMARY KEY,
  plan        TEXT NOT NULL DEFAULT 'comp',
  max_uses    INTEGER, -- NULL = unlimited
  uses_count  INTEGER NOT NULL DEFAULT 0,
  expires_at  TIMESTAMPTZ,
  -- Bonus credits granted alongside (or instead of) plan access — see the
  -- credit system section below. NULL = no credits attached to this code.
  credits     INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.redeem_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do anything on redeem_codes"
  ON public.redeem_codes FOR ALL
  USING (auth.role() = 'service_role');

-- ── REPORTS ──────────────────────────────────────────────────
-- One row per report generated by a LOGGED-IN visitor. This table alone is
-- the "score over time" data source (SELECT brand, score, created_at ORDER
-- BY created_at) — no separate snapshots table: every report generation IS
-- a snapshot, so a second table would just duplicate this one 1:1.
CREATE TABLE IF NOT EXISTS public.reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- Which brand this report was generated for — no inline REFERENCES:
  -- company_profiles is defined later in this file (see the deferred FK
  -- block right after it). NULL for reports generated before multi-brand
  -- support existed.
  company_profile_id UUID,
  brand       TEXT NOT NULL,
  url         TEXT,
  score       INTEGER,
  total       INTEGER NOT NULL DEFAULT 0,
  hits        INTEGER NOT NULL DEFAULT 0,
  competitors TEXT[] NOT NULL DEFAULT '{}',
  rows        JSONB, -- aiVisibility.rows: [{ query, model, live, answer, mentioned }]
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS reports_company_profile_id_idx ON public.reports(company_profile_id);

CREATE INDEX IF NOT EXISTS reports_user_id_created_at_idx ON public.reports(user_id, created_at DESC);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on reports"
  ON public.reports FOR ALL
  USING (auth.role() = 'service_role');

-- ── PROMPTS ──────────────────────────────────────────────────
-- User-authored AI-visibility test questions, checked on demand (see
-- app/api/prompts/[id]/check/route.js) against the same Gemini/Claude
-- models lib/aivisibility.js already uses. Latest result is denormalized
-- onto the row (last_*) rather than a separate history table — same
-- reasoning as the comment on `opportunities` above: nothing here asks for
-- a trend view, just current status per prompt.
CREATE TABLE IF NOT EXISTS public.prompts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- Which brand this prompt belongs to — no inline REFERENCES (see the
  -- reports.company_profile_id comment above for why). NULL for prompts
  -- created before multi-brand support existed.
  company_profile_id UUID,
  text             TEXT NOT NULL,
  -- 'commercial' | 'competitor' | 'branded' — user-selected when adding
  -- the prompt, not auto-classified.
  type             TEXT NOT NULL DEFAULT 'commercial',
  -- Free-text organizational label only — this app doesn't pass any
  -- region parameter to Gemini/Claude, so this never changes what's
  -- actually checked. Shown as a plain label, not implied to be real
  -- geo-targeting.
  location         TEXT NOT NULL DEFAULT 'Global',
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  last_checked_at  TIMESTAMPTZ,
  last_mentioned   BOOLEAN,
  last_position    INTEGER,
  last_brands      TEXT[],
  last_answer      TEXT,
  last_model       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS prompts_user_id_idx ON public.prompts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS prompts_company_profile_id_idx ON public.prompts(company_profile_id);

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own prompts"
  ON public.prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompts"
  ON public.prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts"
  ON public.prompts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts"
  ON public.prompts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on prompts"
  ON public.prompts FOR ALL
  USING (auth.role() = 'service_role');

-- ── PROMPT CHECKS ────────────────────────────────────────────
-- Immutable history log — one row per "Check now" run (see
-- app/api/prompts/[id]/check/route.js), alongside prompts.last_* which
-- stays as the current-state cache. Same split as credit_balances
-- (cache) + credit_transactions (immutable ledger). No user-facing
-- INSERT policy — written only by the check route's service-role client.
CREATE TABLE IF NOT EXISTS public.prompt_checks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id   UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mentioned   BOOLEAN,
  position    INTEGER,
  brands      TEXT[],
  answer      TEXT,
  model       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS prompt_checks_prompt_id_idx ON public.prompt_checks(prompt_id, created_at DESC);

ALTER TABLE public.prompt_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own prompt checks"
  ON public.prompt_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on prompt_checks"
  ON public.prompt_checks FOR ALL
  USING (auth.role() = 'service_role');

-- ── TRACKED KEYWORDS ─────────────────────────────────────────
-- Customer-managed list of keywords/phrases to track real Reddit
-- conversation volume for (see lib/keywordVolume.js) — genuine counts
-- from Reddit's own search (via lib/reddit.js's searchPosts), not a
-- third-party SEO/Google-search-volume estimate like the anonymous
-- report page's heuristic numbers (lib/keywords.js).
CREATE TABLE IF NOT EXISTS public.tracked_keywords (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_profile_id   UUID,
  keyword              TEXT NOT NULL,
  last_checked_at      TIMESTAMPTZ,
  last_post_count      INTEGER,
  last_top_subreddits  TEXT[],
  last_sample_posts    JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tracked_keywords_user_id_idx ON public.tracked_keywords(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS tracked_keywords_company_profile_id_idx ON public.tracked_keywords(company_profile_id);

ALTER TABLE public.tracked_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tracked keywords"
  ON public.tracked_keywords FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tracked keywords"
  ON public.tracked_keywords FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracked keywords"
  ON public.tracked_keywords FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracked keywords"
  ON public.tracked_keywords FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on tracked_keywords"
  ON public.tracked_keywords FOR ALL
  USING (auth.role() = 'service_role');

-- ── REPORT DRAFTS ────────────────────────────────────────────
-- Persisted version of the AI-drafted Reddit post suggestion + posted
-- status. Anonymous visitors never write here — PostDraftActions.js keeps
-- its current local-state-only behavior when there's no draftId. Nothing
-- in this table is ever posted to Reddit automatically; `posted` just
-- records that the customer says they posted it themselves.
CREATE TABLE IF NOT EXISTS public.report_drafts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  report_id  UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  -- Which brand this task belongs to — no inline REFERENCES (see the
  -- reports.company_profile_id comment above for why). Set at creation
  -- time (app/api/drafts/route.js) to the customer's active brand; read
  -- directly (not re-derived from user_id) by
  -- app/api/poster/tasks/[id]/regenerate/route.js, since the acting user
  -- there is the poster fulfilling the task, not its owning brand's
  -- customer. NULL for tasks created before multi-brand support existed.
  company_profile_id UUID,
  -- 'comment' | 'post' | 'reply' — which Draft Studio type this came from.
  -- NULL on rows saved before this column existed.
  type       TEXT,
  subreddit  TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  -- INPUT link: the existing thread/comment this task is aimed at, so the
  -- poster knows where to go. Required at the API for 'comment'/'reply'
  -- (a 'post' is brand new and has no target); NULL on rows created before
  -- this column existed. Do NOT confuse with `permalink` below, which is
  -- the OUTPUT — where the task ended up once posted.
  target_url TEXT,
  posted     BOOLEAN NOT NULL DEFAULT FALSE,
  posted_at  TIMESTAMPTZ,
  -- Self-reported link to the live post, once the customer has actually
  -- posted it themselves — lets Track Tasks show a "view live" link, and
  -- is what live_* below gets re-fetched from (see fetchItemStats() in
  -- lib/reddit.js — Apify only, direct fetches are blocked from cloud IPs).
  permalink  TEXT,
  -- On-demand live re-fetch of this exact permalink (not automatic — see
  -- app/api/drafts/[id]/refresh-stats, credit-metered like Opportunities'
  -- thread analysis). live_reply_count is only ever populated for a
  -- post-level permalink — comment-level reply counts aren't reliably
  -- extractable from the scraper, so it stays NULL there rather than
  -- showing a guessed number. live_removed is a best-effort signal (either
  -- the item vanished from the scrape entirely, or its body reads
  -- "[removed]"/"[deleted]") — false positives are possible if Apify just
  -- failed to find it for an unrelated reason.
  live_score        INTEGER,
  live_reply_count  INTEGER,
  live_removed      BOOLEAN,
  live_checked_at   TIMESTAMPTZ,
  -- Poster (public.users.role = 'poster') who currently holds this task —
  -- see app/poster/**. NULL = sitting in the open marketplace pool,
  -- unclaimed. Still admin-settable directly for a manual override/VIP
  -- routing (components/AssignDraftControl.js), but the primary path is
  -- now self-claim (see app/api/poster/tasks/[id]/claim).
  claimed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  -- 'available' (open in the marketplace) | 'claimed' (locked to
  -- claimed_by until claim_expires_at) | 'submitted' (permalink pasted —
  -- cosmetically "Approved" too, there's no review gate) | 'paid' (an
  -- admin has recorded a poster_payouts row covering this task's period;
  -- see lib/posterTasks.js for how "paid" gets applied).
  status     TEXT NOT NULL DEFAULT 'available',
  claimed_at TIMESTAMPTZ,
  -- Lazily enforced (no cron in this app) — a claim past this time is
  -- treated as expired/released the next time anything reads or claims
  -- it, rather than needing a background sweep.
  claim_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS report_drafts_user_id_idx ON public.report_drafts(user_id);
CREATE INDEX IF NOT EXISTS report_drafts_claimed_by_idx ON public.report_drafts(claimed_by);
CREATE INDEX IF NOT EXISTS report_drafts_company_profile_id_idx ON public.report_drafts(company_profile_id);
CREATE INDEX IF NOT EXISTS report_drafts_status_idx ON public.report_drafts(status);

ALTER TABLE public.report_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own drafts"
  ON public.report_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drafts"
  ON public.report_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts"
  ON public.report_drafts FOR UPDATE
  USING (auth.uid() = user_id);

-- A poster's own uid matching claimed_by is sufficient proof of
-- ownership — only the service-role client (admin) ever sets claimed_by
-- on a row that wasn't already theirs (the atomic claim operation), so
-- this can't be self-granted for someone else's task.
CREATE POLICY "Posters can read claimed drafts"
  ON public.report_drafts FOR SELECT
  USING (auth.uid() = claimed_by);

CREATE POLICY "Posters can update claimed drafts"
  ON public.report_drafts FOR UPDATE
  USING (auth.uid() = claimed_by);

-- No "posters can read available drafts" policy — the marketplace list
-- (unclaimed rows across ALL customers) is deliberately read only via the
-- service-role client, scoped in application code
-- (app/api/poster/tasks/route.js), not opened up via RLS. A broad
-- status='available' policy would let any authenticated customer session
-- read OTHER customers' unclaimed draft titles/subreddits too, since RLS
-- policies are OR'd together — not worth the exposure for a read that's
-- easy to do safely server-side instead.

CREATE POLICY "Service role can do anything on report_drafts"
  ON public.report_drafts FOR ALL
  USING (auth.role() = 'service_role');

-- The RLS policies above scope rows by ownership (auth.uid() = user_id /
-- = claimed_by) but don't restrict which COLUMNS an owner can write —
-- Postgres RLS can't express that on its own. Every legitimate mutation
-- of the marketplace-critical fields (status/claimed_by/claimed_at/
-- claim_expires_at/verification_status) already goes through the
-- service-role-mediated app routes (app/api/poster/tasks/[id]/claim,
-- .../submit, app/api/admin/drafts/[id]/review) — a customer's own
-- direct write only ever needs permalink/posted/posted_at
-- (app/api/drafts/[id]/route.js).
-- Without this trigger, a customer could call the Supabase REST API
-- directly with their own session and INSERT/UPDATE a row with
-- status='submitted' + claimed_by=<a poster they control>, bypassing
-- credits, atomic claiming, and daily/cooldown limits entirely — and
-- since getEarningsSummary (lib/posterPay.js) treats any
-- claimed_by=X AND status='submitted' row as real completed work, that
-- becomes a real, withdrawable payout for zero actual Reddit activity.
CREATE OR REPLACE FUNCTION public.protect_report_drafts_marketplace_fields()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS DISTINCT FROM 'available'
       OR NEW.claimed_by IS NOT NULL
       OR NEW.claim_expires_at IS NOT NULL
       OR NEW.claimed_at IS NOT NULL
       OR NEW.verification_status IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot set marketplace fields directly.';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.claimed_by IS DISTINCT FROM OLD.claimed_by
       OR NEW.claim_expires_at IS DISTINCT FROM OLD.claim_expires_at
       OR NEW.claimed_at IS DISTINCT FROM OLD.claimed_at
       OR NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
      RAISE EXCEPTION 'Not allowed to modify marketplace fields directly.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS report_drafts_protect_marketplace_fields ON public.report_drafts;
CREATE TRIGGER report_drafts_protect_marketplace_fields
  BEFORE INSERT OR UPDATE ON public.report_drafts
  FOR EACH ROW EXECUTE FUNCTION public.protect_report_drafts_marketplace_fields();

-- ── REPORT DRAFTS: target thread link ────────────────────────
-- Migration for databases created before target_url existed (the CREATE
-- TABLE above only applies to a fresh database). Left nullable on purpose:
-- existing 'comment'/'reply' rows predate the requirement and must keep
-- working — the NOT NULL-ness is enforced at the API for new rows only.
ALTER TABLE public.report_drafts
  ADD COLUMN IF NOT EXISTS target_url TEXT;
ALTER TABLE public.report_drafts ADD COLUMN IF NOT EXISTS live_score INTEGER;
ALTER TABLE public.report_drafts ADD COLUMN IF NOT EXISTS live_reply_count INTEGER;
ALTER TABLE public.report_drafts ADD COLUMN IF NOT EXISTS live_removed BOOLEAN;
ALTER TABLE public.report_drafts ADD COLUMN IF NOT EXISTS live_checked_at TIMESTAMPTZ;

-- NULL (rows submitted before this column existed — grandfathered in as
-- verified, same as every row before this review gate existed) |
-- 'verified' (fetchItemStats confirmed it genuinely live at submit time)
-- | 'needs_review' (the automated check couldn't confirm — Apify
-- unavailable, or it looked removed — see app/api/poster/tasks/[id]/
-- submit; a confident-but-possibly-wrong "removed" signal isn't grounds
-- to auto-reject given fetchItemStats' documented reliability gaps, so
-- it goes to a human instead) | 'rejected' (an admin reviewed and said
-- no, via app/api/admin/drafts/[id]/review). Only NULL/'verified' rows
-- count toward a poster's real earnings — see getEarningsSummary
-- (lib/posterPay.js).
ALTER TABLE public.report_drafts ADD COLUMN IF NOT EXISTS verification_status TEXT;

-- ── OPPORTUNITIES ────────────────────────────────────────────
-- Cached Reddit threads matched + relevance-scored against a user's
-- company profile. Refreshed on demand (via the dashboard's Refresh
-- button, not on every page load) — a refresh deletes the user's old rows
-- and inserts the new batch, it's a replace, not an append.
CREATE TABLE IF NOT EXISTS public.opportunities (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- Which brand this opportunity was scored for — no inline REFERENCES
  -- (see the reports.company_profile_id comment above for why).
  company_profile_id UUID,
  sub              TEXT NOT NULL,
  title            TEXT NOT NULL,
  snippet          TEXT,
  permalink        TEXT NOT NULL,
  ups              INTEGER NOT NULL DEFAULT 0,
  comments         INTEGER NOT NULL DEFAULT 0,
  post_created_at  TIMESTAMPTZ,
  relevance_score  INTEGER,
  relevance_reason TEXT,
  -- 2-4 short checkmark-style bullets from the same batched scoring call —
  -- backs the "Why AEOrank recommends this" list. relevance_reason (above)
  -- stays as the single-sentence version other UI (dashboard spotlight)
  -- already reads.
  relevance_reasons TEXT[],
  -- Judgment call from the same batched scoring call as relevance_score —
  -- "high"/"medium"/"low", not a fact lookup, so it belongs alongside the
  -- score rather than needing its own LLM call.
  buying_intent    TEXT,
  -- Pins a row so a refresh's delete-and-replace cache logic (below) skips
  -- it — the only way anything here survives a refresh.
  saved            BOOLEAN NOT NULL DEFAULT FALSE,
  -- On-demand deep analysis (see app/api/opportunities/analyze/route.js) —
  -- unlike relevance_score/buying_intent, these come from the thread's
  -- actual fetched body + comments, not just the title/snippet, so they're
  -- only populated when a user explicitly asks for them (separately
  -- credit-metered) rather than for every row on every refresh.
  analysis_summary               TEXT,
  analysis_pain_points           TEXT[],
  analysis_competitors_mentioned TEXT[],
  analysis_response_angle        TEXT,
  -- Real fetched thread content from the same Quick Preview call as the
  -- analysis_* fields above (fetchThread() in lib/reddit.js) — kept
  -- alongside the AI-derived fields rather than re-fetched on every view,
  -- so the detail pane can show the actual post body + top comments
  -- without a second Apify call/credit charge. thread_comments is an array
  -- of { body, ups }, no author/id (fetchThread doesn't return those).
  thread_selftext                TEXT,
  thread_comments                JSONB,
  analyzed_at                    TIMESTAMPTZ,
  fetched_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS opportunities_user_id_idx ON public.opportunities(user_id, relevance_score DESC);
CREATE INDEX IF NOT EXISTS opportunities_company_profile_id_idx ON public.opportunities(company_profile_id);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own opportunities"
  ON public.opportunities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own opportunities"
  ON public.opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Lets a user toggle their own `saved` flag directly (mirrors "Users can
-- update own drafts" on report_drafts) — the analysis_* columns are never
-- written this way, only via the service-role client in the analyze route.
CREATE POLICY "Users can update own opportunities"
  ON public.opportunities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own opportunities"
  ON public.opportunities FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on opportunities"
  ON public.opportunities FOR ALL
  USING (auth.role() = 'service_role');

-- ── OPPORTUNITIES: real fetched thread content ───────────────
-- Migration for databases created before these existed (the CREATE TABLE
-- above only applies to a fresh database).
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS thread_selftext TEXT;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS thread_comments JSONB;

-- ── MENTIONS ─────────────────────────────────────────────────
-- Read-only brand-mention monitoring: real Reddit posts/comments that
-- already mention the user's brand, with AI sentiment classification.
-- Same cache-then-refresh-on-demand pattern as opportunities. Nothing
-- here posts, votes, or otherwise touches Reddit — it only searches and
-- reads what's already public.
CREATE TABLE IF NOT EXISTS public.mentions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- Which brand this mention was searched for — no inline REFERENCES (see
  -- the reports.company_profile_id comment above for why).
  company_profile_id UUID,
  sub              TEXT NOT NULL,
  title            TEXT NOT NULL,
  snippet          TEXT,
  permalink        TEXT NOT NULL,
  ups              INTEGER NOT NULL DEFAULT 0,
  comments         INTEGER NOT NULL DEFAULT 0,
  post_created_at  TIMESTAMPTZ,
  sentiment        TEXT, -- positive / neutral / negative
  sentiment_reason TEXT,
  fetched_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mentions_user_id_idx ON public.mentions(user_id, post_created_at DESC);
CREATE INDEX IF NOT EXISTS mentions_company_profile_id_idx ON public.mentions(company_profile_id);

ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own mentions"
  ON public.mentions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mentions"
  ON public.mentions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mentions"
  ON public.mentions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on mentions"
  ON public.mentions FOR ALL
  USING (auth.role() = 'service_role');

-- ── COMPANY PROFILES ─────────────────────────────────────────
-- Multiple rows per user ("brands") — filled in by the post-signup
-- onboarding wizard (website, company details, competitors) or the
-- "+ Add brand" flow (app/api/brands/route.js), which of these a user is
-- currently working in is tracked by users.active_company_profile_id (see
-- lib/brands.js's getActiveCompanyProfile). Brand-count limits per plan
-- live in lib/brands.js's BRAND_LIMITS, enforced in app/api/brands/route.js
-- (no active plan = 1 brand, matching the original single-profile
-- behavior). `completed` is set whether the user finishes the wizard or
-- hits "Skip onboarding", so we don't re-prompt either way.
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  website           TEXT,
  company_name      TEXT,
  target_location   TEXT,
  brand_variations  TEXT[] NOT NULL DEFAULT '{}',
  description       TEXT,
  competitors       TEXT[] NOT NULL DEFAULT '{}',
  completed         BOOLEAN NOT NULL DEFAULT FALSE,
  -- Furthest step of app/onboarding/page.js's 4-step wizard this row's
  -- owner ever reached: 1 (clicked "Skip onboarding" on step 1) | 2
  -- (reached step 2 after step 1's "Continue") | 3 (reached step 3) | 4
  -- (reached step 4/pricing — same event as completed becoming true).
  -- NULL for rows created outside onboarding (e.g. "+ Add brand"), where
  -- this funnel doesn't apply. Lets drop-off be measured precisely
  -- instead of inferred from which optional fields happen to be filled.
  onboarding_step_reached SMALLINT,
  -- Whether app/dashboard/settings/page.js has already auto-generated a
  -- starter set of tracked_keywords for this brand (lib/llm.js's
  -- suggestKeywords). Only ever flips false -> true once, the first time
  -- the Keywords tab is viewed with zero keywords — prevents silently
  -- re-seeding keywords a customer deliberately deleted on a later visit.
  keywords_seeded   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS company_profiles_user_id_idx ON public.company_profiles(user_id);

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own company profile"
  ON public.company_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company profile"
  ON public.company_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company profile"
  ON public.company_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own company profile"
  ON public.company_profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on company_profiles"
  ON public.company_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Deferred FKs from the users/reports/prompts/report_drafts/opportunities/
-- mentions tables above (see each one's company_profile_id comment) —
-- company_profiles didn't exist yet at those points in the file.
ALTER TABLE public.users
  ADD CONSTRAINT users_active_company_profile_id_fkey
  FOREIGN KEY (active_company_profile_id) REFERENCES public.company_profiles(id) ON DELETE SET NULL;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_company_profile_id_fkey
  FOREIGN KEY (company_profile_id) REFERENCES public.company_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.prompts
  ADD CONSTRAINT prompts_company_profile_id_fkey
  FOREIGN KEY (company_profile_id) REFERENCES public.company_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.report_drafts
  ADD CONSTRAINT report_drafts_company_profile_id_fkey
  FOREIGN KEY (company_profile_id) REFERENCES public.company_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.opportunities
  ADD CONSTRAINT opportunities_company_profile_id_fkey
  FOREIGN KEY (company_profile_id) REFERENCES public.company_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.mentions
  ADD CONSTRAINT mentions_company_profile_id_fkey
  FOREIGN KEY (company_profile_id) REFERENCES public.company_profiles(id) ON DELETE CASCADE;

-- ── CREDIT BALANCES ──────────────────────────────────────────
-- One row per user. Every mutation goes through the deduct_credits/
-- grant_credits functions below (never a direct UPDATE), so there is no
-- user-facing INSERT/UPDATE policy here — reads only.
CREATE TABLE IF NOT EXISTS public.credit_balances (
  user_id             UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  balance             INTEGER NOT NULL DEFAULT 0,
  monthly_allowance   INTEGER NOT NULL DEFAULT 0,
  allowance_reset_at  TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own balance"
  ON public.credit_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on credit_balances"
  ON public.credit_balances FOR ALL
  USING (auth.role() = 'service_role');

-- ── CREDIT TRANSACTIONS ──────────────────────────────────────
-- Single immutable ledger — a negative amount is a usage record, a
-- positive amount is a grant/purchase/refund/renewal. Balance is always
-- reconcilable by summing this table, so there's no separate "usage"
-- table duplicating it. No user-facing write policy; all writes happen
-- via the service-role client in lib/credits.js.
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  action      TEXT NOT NULL,
  description TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON public.credit_transactions(user_id, created_at DESC);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on credit_transactions"
  ON public.credit_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- ── CREDIT PACKAGES ──────────────────────────────────────────
-- Admin-managed one-time purchase options. Publicly readable (active
-- ones only) — same visibility as the PLANS pricing already shown to
-- anonymous visitors, just DB-driven instead of code-driven so admin can
-- add packages without a deploy.
CREATE TABLE IF NOT EXISTS public.credit_packages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  credits        INTEGER NOT NULL,
  price_cents    INTEGER NOT NULL,
  currency       TEXT NOT NULL DEFAULT 'usd',
  active         BOOLEAN NOT NULL DEFAULT TRUE,
  -- Extra credits on top of `credits` — total granted on purchase is
  -- credits + bonus_credits (see app/api/checkout/route.js).
  bonus_credits  INTEGER NOT NULL DEFAULT 0,
  -- Admin-set marketing pill, e.g. "Most Popular" / "Best Value". NULL = none.
  badge          TEXT,
  description    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Packages are publicly readable"
  ON public.credit_packages FOR SELECT
  USING (active = true);

CREATE POLICY "Service role can do anything on credit_packages"
  ON public.credit_packages FOR ALL
  USING (auth.role() = 'service_role');

-- ── ATOMIC CREDIT FUNCTIONS ───────────────────────────────────
-- SECURITY DEFINER + explicitly REVOKEd from anon/authenticated: these
-- must only ever be called via the service-role admin client from server
-- code (lib/credits.js). A client-callable grant_credits would let anyone
-- mint their own credits. The atomic UPDATE...RETURNING avoids the
-- classic read-balance-then-write-separately race condition under
-- concurrent requests.
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE public.credit_balances
  SET balance = balance - p_amount, updated_at = NOW()
  WHERE user_id = p_user_id AND balance >= p_amount
  RETURNING balance INTO v_new_balance;
  RETURN v_new_balance; -- NULL = insufficient balance (or no balance row yet)
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_credits(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  INSERT INTO public.credit_balances (user_id, balance)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.credit_balances.balance + p_amount, updated_at = NOW()
  RETURNING balance INTO v_new_balance;
  RETURN v_new_balance;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.deduct_credits(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_credits(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_credits(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_credits(UUID, INTEGER) TO service_role;

-- ── AUTO-CREATE USER PROFILE ON SIGNUP ───────────────────────
-- Fires for every auth.users insert, whether from a real magic-link login
-- OR from admin.auth.admin.createUser() called by the Stripe webhook to
-- silently provision an account for someone who paid before ever logging in.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── USERS: referral tracking ─────────────────────────────────
-- Set only by the admin-approval flow (app/api/admin/poster-applications/
-- [id]/approve/route.js) from poster_applications.referred_by at
-- account-creation time — never self-reported after the fact.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS users_referred_by_idx ON public.users(referred_by);

-- Short, human-shareable code (e.g. "K7QX3M") standing in for a poster's
-- own account id in a referral link/field — a raw UUID can't practically
-- be spoken or typed by hand. Generated lazily (lib/posterPay.js's
-- ensureReferralCode) the first time a poster views /poster/refer, not at
-- signup — most users never need one. Partial unique index since almost
-- every row is NULL (only posters who've viewed that page have one).
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_uidx
  ON public.users(referral_code) WHERE referral_code IS NOT NULL;

-- "Users can update own record" above only restricts WHICH ROW a user can
-- update (auth.uid() = id), not WHICH COLUMNS — without this trigger, a
-- logged-in customer could call the Supabase REST API directly with
-- their own session and set role='poster' on their own row, bypassing
-- the real Reddit-verification gate (app/api/poster/verify-reddit)
-- entirely, or tamper with signup_source/referred_by/stripe_customer_id.
-- Same pattern as protect_report_drafts_marketplace_fields above.
-- active_company_profile_id is the one field a customer's own session is
-- actually meant to write (the sidebar brand switcher, app/api/brands),
-- so it's the only column left unguarded.
CREATE OR REPLACE FUNCTION public.protect_users_privileged_fields()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
     OR NEW.reddit_username IS DISTINCT FROM OLD.reddit_username
     OR NEW.reddit_check_status IS DISTINCT FROM OLD.reddit_check_status
     OR NEW.signup_source IS DISTINCT FROM OLD.signup_source
     OR NEW.referred_by IS DISTINCT FROM OLD.referred_by
     OR NEW.referral_code IS DISTINCT FROM OLD.referral_code THEN
    RAISE EXCEPTION 'Not allowed to modify privileged fields directly.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_protect_privileged_fields ON public.users;
CREATE TRIGGER users_protect_privileged_fields
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_users_privileged_fields();

-- ── POSTER APPLICATIONS ──────────────────────────────────────
-- Pending signups from the public "Refer a friend" apply form
-- (app/apply-poster). No self-signup exists for posters — an application
-- here never creates an account by itself; an admin must approve it via
-- app/admin/posters, which is what actually calls auth.admin.createUser.
CREATE TABLE IF NOT EXISTS public.poster_applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL,
  -- Resolved from the ?ref=<user-id> query param on the public apply form.
  -- NULL if there was no ref param, or it didn't match a real poster —
  -- the applicant is never blocked for a bad/missing ref.
  referred_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  -- Normalized username (see lib/reddit.js's normalizeRedditUsername) from
  -- whatever profile link/username the applicant entered.
  reddit_username     TEXT,
  -- 'active' (via Reddit OAuth/direct fetch/Apify user-scraper) |
  -- 'active_approx' (via Pullpush's historical archive instead — an
  -- approximation, not the account itself) | 'suspended' | 'unavailable'
  -- (Apify's actor found no profile at all — likely suspended/deleted,
  -- can't tell which) | 'not_found' | 'too_new' (younger than
  -- lib/reddit.js's MIN_ACCOUNT_AGE_MONTHS) | 'low_karma' (under
  -- MIN_KARMA) | 'unverified' (couldn't check any way) | 'invalid'
  -- (unparseable input). Everything except 'active'/'active_approx'/
  -- 'unverified' is rejected at submission time in
  -- app/api/poster-applications — this column only ever holds those
  -- three for rows that made it past that.
  reddit_check_status TEXT,
  -- 'pending' (default) | 'approved' | 'dismissed'
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS poster_applications_status_idx ON public.poster_applications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS poster_applications_referred_by_idx ON public.poster_applications(referred_by);

-- Only one *pending* application per email at a time — resubmission after
-- a dismissal is fine, but prevents duplicate pending rows piling up from
-- someone re-submitting the form.
CREATE UNIQUE INDEX IF NOT EXISTS poster_applications_email_pending_uidx
  ON public.poster_applications(email) WHERE status = 'pending';

ALTER TABLE public.poster_applications ENABLE ROW LEVEL SECURITY;

-- No public/user policies at all — every access (public submission via the
-- apply form, admin review/approve/dismiss) goes through createAdminClient()
-- (service role), same as redeem_codes.
CREATE POLICY "Service role can do anything on poster_applications"
  ON public.poster_applications FOR ALL
  USING (auth.role() = 'service_role');

-- ── POSTER PAYOUTS ────────────────────────────────────────────
-- Real payout ledger — each row is one payment event an admin recorded
-- (app/api/admin/posters/[id]/payouts), not a computed running total. A
-- poster's "Total paid" = sum of their own rows here; "Pending" = their
-- lifetime task earnings (computed from report_drafts, see
-- lib/posterTasks.js) minus that sum. Mirrors the credit system's
-- cache+ledger split (lib/credits.js) — the ledger is the source of
-- truth, nothing here is ever recomputed/overwritten.
CREATE TABLE IF NOT EXISTS public.poster_payouts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount     NUMERIC(10,2) NOT NULL,
  note       TEXT,
  -- 'paid' (admin recorded an actual payment — app/api/admin/posters/[id]/
  -- payouts) | 'requested' (poster asked to withdraw via
  -- app/api/poster/withdraw, awaiting admin action — see
  -- app/api/admin/payouts/[id] for marking it paid). Only 'paid' rows
  -- count toward totalPaid in lib/posterPay.js's getEarningsSummary.
  status     TEXT NOT NULL DEFAULT 'paid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS poster_payouts_poster_id_idx ON public.poster_payouts(poster_id, created_at DESC);

ALTER TABLE public.poster_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posters can read own payouts"
  ON public.poster_payouts FOR SELECT
  USING (auth.uid() = poster_id);

CREATE POLICY "Service role can do anything on poster_payouts"
  ON public.poster_payouts FOR ALL
  USING (auth.role() = 'service_role');

-- ── CAMPAIGNS ────────────────────────────────────────────────
-- Reddit campaign tracking: a user points this at an existing Reddit post
-- and the app tracks its real upvote/reply/removal status over time via
-- fetchItemStats() (lib/reddit.js, Apify-backed — same mechanism as
-- report_drafts.live_score). No automated voting and no third-party
-- vote-selling integration of any kind — "boost" is a clearly-labeled
-- simulation (campaign_snapshots.source = 'simulated') for demonstrating
-- the flow end-to-end; it never contacts Reddit or any vote vendor.
CREATE TABLE IF NOT EXISTS public.campaigns (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_profile_id UUID REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  target_url         TEXT NOT NULL,
  subreddit          TEXT,
  title              TEXT,
  -- 'active' | 'archived' — archived campaigns keep their snapshot history,
  -- just drop out of the main list.
  status             TEXT NOT NULL DEFAULT 'active',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS campaigns_user_id_idx ON public.campaigns(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS campaigns_company_profile_id_idx ON public.campaigns(company_profile_id);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON public.campaigns FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on campaigns"
  ON public.campaigns FOR ALL
  USING (auth.role() = 'service_role');

-- ── CAMPAIGN SNAPSHOTS ───────────────────────────────────────
-- One row per point-in-time check — the time-series history that
-- report_drafts' single live_* columns don't provide (that's a
-- "current value" cache; this is "how it changed"). `source`
-- distinguishes a real Apify-verified reading from a clearly-labeled
-- simulated demo boost — the two are never conflated in the UI or in
-- analytics math.
CREATE TABLE IF NOT EXISTS public.campaign_snapshots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  score       INTEGER,
  reply_count INTEGER,
  removed     BOOLEAN NOT NULL DEFAULT FALSE,
  -- 'real' (fetchItemStats via Apify, app/api/campaigns/[id]/check) |
  -- 'simulated' (demo boost, app/api/campaigns/[id]/boost — never a real
  -- vote, never contacts Reddit or a vote vendor).
  source      TEXT NOT NULL,
  checked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS campaign_snapshots_campaign_id_idx ON public.campaign_snapshots(campaign_id, checked_at);

ALTER TABLE public.campaign_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own campaign snapshots"
  ON public.campaign_snapshots FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_snapshots.campaign_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Service role can do anything on campaign_snapshots"
  ON public.campaign_snapshots FOR ALL
  USING (auth.role() = 'service_role');

-- ── CAMPAIGN ORDERS ──────────────────────────────────────────
-- Generic external-order lifecycle: submit -> store the provider's own
-- order id -> poll (or receive a webhook) for status -> reflect the
-- result on the campaign's chart. `provider` is just a string key into
-- lib/orders' registry (see lib/orders/registry.js) — this table and
-- every route that touches it are provider-agnostic; nothing here
-- assumes anything about what a given provider actually does.
-- `metadata`/`result` are opaque JSON owned entirely by the provider
-- implementation (round-tripped between submitOrder/pollStatus calls),
-- never interpreted by application code.
CREATE TABLE IF NOT EXISTS public.campaign_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id       UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL,
  provider_order_id TEXT,
  quantity          INTEGER NOT NULL DEFAULT 1,
  -- 'pending' | 'in_progress' | 'completed' | 'failed'
  status            TEXT NOT NULL DEFAULT 'pending',
  metadata          JSONB,
  result            JSONB,
  error             TEXT,
  submitted_at      TIMESTAMPTZ,
  last_polled_at    TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS campaign_orders_campaign_id_idx ON public.campaign_orders(campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS campaign_orders_provider_order_idx ON public.campaign_orders(provider, provider_order_id);

ALTER TABLE public.campaign_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own campaign orders"
  ON public.campaign_orders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_orders.campaign_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Service role can do anything on campaign_orders"
  ON public.campaign_orders FOR ALL
  USING (auth.role() = 'service_role');
