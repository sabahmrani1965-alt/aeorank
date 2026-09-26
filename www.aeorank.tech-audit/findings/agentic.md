# Agentic Browsing Readiness — www.aeorank.tech

Checked 2026-09-26. Tools: `lighthouse_agentic.py`, `agentic_check.py`,
`agent_ux_check.py` (seo-agentic skill, facts dated 2026-09-23 in
`vendor-matrix.md`). No `--ua-matrix` run (not authorized for this site).

## Lighthouse Agentic Browsing fraction

PSI (PageSpeed Insights) returned HTTP 429 on both strategies: "Quota
exceeded for quota metric 'Queries' and limit 'Queries per day'... Configure
a Google API key." No key is configured for this environment.

As the skill's error-handling path allows, I ran Lighthouse locally instead
(`npx lighthouse@latest --only-categories=agentic-browsing`, Lighthouse
13.5.0, HeadlessChrome 153, same version PSI runs) and parsed the saved JSON
through `lighthouse_agentic.py --from-json`. This is a single local lab run,
not PSI's field-adjacent sampling — treat it as directional.

**Result: 2/2 on mobile and 2/2 on desktop** (Lighthouse 13.5.0, category
score 1.0 both times).

| Audit | Mode | Status | Counted |
|---|---|---|---|
| `agent-accessibility-tree` | binary | pass (0 of 33 axe rules failed) | yes |
| `cumulative-layout-shift` | numeric | pass (CLS = 0) | yes |
| `webmcp-form-coverage` | — | not-applicable (no forms found) | no |
| `webmcp-registered-tools` | — | not-applicable (no WebMCP support signalled, 0 tools) | no |
| `webmcp-schema-validity` | — | not-applicable (no tools, no issues) | no |
| `llms-txt` | binary | not-applicable (404 → N/A, not a fail) | no |
| `ard-schema` | — | not-applicable (no `ai-catalog.json` signalled or present) | no |

N is currently capped at 2 because llms.txt and ai-catalog.json are both
absent (absence drops an audit from N rather than failing it) and no WebMCP
tools are registered. Paths Lighthouse itself lists to raise N:

- Publish a valid `/llms.txt` (H1, one Markdown link, 50+ characters) → adds
  `llms-txt` as a counted audit, **3/3** if it passes.
- Publish a valid `/.well-known/ai-catalog.json` → adds `ard-schema`,
  **4/4** if valid (only worth doing if there is a real agent resource — MCP
  server, A2A agent, skill — to list; an *invalid* catalog turns this into a
  counted failure instead of raising nothing).

A higher N is not itself a better score; only add these if the resource is
real (see `references/lighthouse-agentic-category.md`).

## Agent-UX heuristic (separate from the Lighthouse fraction)

**Score: 100/100, status: complete** (real Chromium render via
`render_page.py`, no fallback).

- 5 real `<button>` elements, 15 real `<a>` elements, 0 div-with-onclick
  fake widgets.
- 11 semantic landmarks; accessibility tree has 1,651 nodes, 20 interactive,
  0 unnamed interactive elements.
- 0 inputs missing an aria-label or a `<label>`.

This is a local heuristic, not the Lighthouse `agent-accessibility-tree`
audit; both happen to agree the homepage's accessible-name and role hygiene
is clean, which is the strongest input the agentic checklist has for "can an
agent's accessibility tree act on this page."

## Findings by priority

### P0 — none currently failing
- Accessible names / valid roles / nothing hidden from the tree: **pass**
  (Lighthouse `agent-accessibility-tree` + Agent-UX 100/100, evidence above).
- CLS ≤ 0.1: **pass** (CLS = 0).
- Primary content present without JavaScript: **pass** — 1,993 words
  rendered without JS, no JS-shell marker (`server-rendered` = pass). This
  matters specifically for agents that don't execute JS before reading (some
  crawler-style agents; most browsing agents do execute JS).
- robots.txt reachable: **pass** (200, 1 group).
- WAF treatment of verified/signed agent traffic: **not tested** — would
  require `--ua-matrix`, out of scope without site-owner authorization for
  this run.

### P1
- **robots.txt has one group, not deliberate per-purpose groups.** Evidence:
  `robots-ai-groups` = info, `named_groups: []`; every AI token (GPTBot,
  ClaudeBot, OAI-SearchBot, Claude-User, PerplexityBot, Google-Agent, CCBot,
  etc.) falls into the `*` group and inherits the same Allow/Disallow
  (`/dashboard`, `/api`, `/onboarding` blocked; everything else open). This
  isn't a failure today — status is "info," not "warn" — because the same
  policy is intentionally applied to all of them. It becomes relevant the
  day AEOrank wants a different policy for training vs. search vs.
  user-triggered fetches (for example, opting out of `ai-train` while
  keeping AI search citation open). Fix: add named groups only when the
  policy actually differs; don't split groups just to have them.
- **No Content-Signal declared anywhere in robots.txt.** Evidence:
  `content-signal` = info, `lines: []`. Optional per Cloudflare's CC0 policy
  and the (expired 2026-04-04) IETF individual draft; Google has made no
  public statement and its robots.txt spec doesn't list the field (checked
  2026-09-23, `vendor-matrix.md`). Fix (optional): add e.g. `Content-Signal:
  search=yes, ai-input=yes, ai-train=<your call>` to the `*` group — ask
  the site owner for the training-data stance before choosing yes/no,
  `agentic_fix.py robots` will not decide it for you.
- **`/llms.txt` returns 404** (content-type `text/html`, i.e., a normal
  404 page, not a soft-404-with-200). Already flagged in
  `findings/ai-readiness.md` for its GEO angle; the agentic angle is
  narrower: Lighthouse drops the `llms-txt` audit from N rather than
  failing it, so there is no Lighthouse penalty for leaving it absent, only
  a missed opportunity to add a counted passing audit.
- **No Markdown delivery.** Evidence: `Vary: Accept` not sent, no
  `rel="alternate" type="text/markdown"` link, `/index.md` sibling 404s.
  Optional per RFC 9110 content negotiation; no primary source confirms any
  shipping consumer agent requests `Accept: text/markdown` today (checked
  2026-09-23) — treat as a discoverability nicety, not a requirement.
- **Private paths rely on robots.txt Disallow, not confirmed authentication.**
  `/dashboard`, `/api`, `/onboarding` are blocked in robots.txt, but
  `robots-user-agents` documents that `ChatGPT-User` "may not apply,"
  `Perplexity-User` "generally ignores," and `Google-Agent` "generally
  ignores" robots.txt for user-triggered fetches. This audit did not probe
  whether those paths actually require login (out of scope for a
  homepage-only check) — recommend the site owner confirm `/dashboard` and
  `/api` return 401/redirect-to-login for an unauthenticated request
  regardless of user-agent, since robots.txt is not an access-control
  mechanism against user-triggered agents.
- **Stable, visible confirmation states / no hover-only menus or focus
  traps: not checked.** No script evidence gathered for this item; it needs
  a manual pass, called out here per the skill's honesty rule rather than
  silently skipped.

### P2
- **No WebMCP tools, and none expected yet.** `webmcp-tools` found 0
  `registerTool(` call sites and 0 `<form>` elements on the homepage; the
  homepage's 5 buttons / 15 links appear to be navigation, not a
  transaction (a form on a pricing/signup/contact page would be the
  candidate, not one checked here). This is an opportunity, not a defect:
  WebMCP is a W3C Community Group draft, WebKit opposes it, Mozilla is
  neutral, and only ChatGPT's desktop built-in browser calls imperative
  tools by default today (checked 2026-09-23, `vendor-matrix.md`). Not
  worth building until there's a real form/transaction to bind a tool to.
- `webmcp-entry-point` (`document.modelContext` vs. legacy `navigator`):
  N/A — no WebMCP registered at all, so the entry-point distinction doesn't
  apply yet.
- API Catalog / OAuth Protected Resource / OAuth Authorization Server
  metadata: N/A (404s) — only relevant if AEOrank operates a public API;
  no evidence it does.

### P3
- **`ai-catalog.json` (Agentic Resource Discovery) absent.** `ard-catalog`
  = N/A, 404, not signalled via robots `Agentmap`, `<link rel="ai-catalog">`,
  or an HTTP `Link` header. ARD (spec 1.0, checked against Lighthouse 13.5
  `ard-schema`, checked 2026-09-23) is for listing actual agent-facing
  resources (an MCP server, an A2A agent, a "skill"). AEOrank doesn't
  appear to expose one yet, so this is correctly not-applicable rather than
  a gap — flagged here only because of the credibility angle below.
- A2A `agent-card.json`, UCP commerce profile: N/A (404s, not relevant —
  AEOrank isn't an A2A agent host or a commerce/checkout site).
- Declarative WebMCP form annotations: N/A — no forms detected on the page
  checked.

## Access policy (training, search, user-triggered — kept separate)

- **Training:** GPTBot, ClaudeBot and CCBot are all in the `*` group with
  `root_allowed: true` and no Content-Signal `ai-train` line — training
  access is open by default, undeclared either way.
- **Search:** OAI-SearchBot, Claude-SearchBot and PerplexityBot are all
  allowed at root in the same `*` group — AI-search crawling and citation
  access is open.
- **User-triggered:** Claude-User honours robots.txt and is allowed at
  root. ChatGPT-User "may not apply" robots.txt to user-triggered fetches;
  Perplexity-User and Google-Agent "generally ignore" it (vendor docs,
  checked 2026-09-23). Practically, since the `*` group already allows
  root, this doesn't create a live gap today — the caveat is `/dashboard`
  and `/api`, where robots.txt is the only declared control and several of
  these agents may not honour it (see the P1 finding above).

## Standards status (dated, from `vendor-matrix.md`, checked 2026-09-23)

- **WebMCP** — W3C Community Group draft, not a standard. WebKit opposes it
  (treats agents as closer to assistive tech); Mozilla is neutral and not
  implementing. Chrome's origin trial runs M149–M156, no ship milestone
  announced (reported end date 2026-11-17). Only ChatGPT's desktop built-in
  browser calls imperative tools by default among tested consumers.
- **Content-Signal** — Cloudflare CC0 policy; the IETF individual draft
  expired 2026-04-04; no Google statement found, and Google's robots.txt
  spec doesn't list the field. A preference signal, not an enforcement
  mechanism, even where honoured.
- **ai-catalog.json / Agentic Resource Discovery (ARD)** — spec 1.0, an
  independent community spec, validated by Lighthouse 13.5's `ard-schema`
  audit as of this check.
- **Web Bot Auth** — `draft-ietf-webbotauth-httpsig-protocol-00`
  (2026-09-01), an IETF draft; not evaluated in this run (out of scope —
  no signature headers were inspected).
- **llms.txt** — community spec (llmstxt.org), not a standard. Lighthouse
  checks it; Google Search does not consume it. No primary source shows any
  shipping consumer agent reading `Accept: text/markdown` either.

## Credibility framing for AEOrank specifically

AEOrank sells AI-visibility auditing as a product. The gaps above — no
`/llms.txt`, no Content-Signal line, no `ai-catalog.json`, no WebMCP — are
each individually optional per current standards status, but a prospect or
journalist who runs this exact checklist against AEOrank's own domain will
see the same absences this report does. That's a credibility question
("does the AI-visibility vendor apply its own checklist to itself?"), not a
technical defect and not something that affects ranking, citation or
traffic — none of these items should be promised to move any of those
metrics. If AEOrank wants a self-referential proof point, `/llms.txt` and a
declared Content-Signal line are the cheapest to ship and the two Lighthouse
already scores.

## Recommendations (in priority order)

1. **No P0 action required.** Accessibility-tree hygiene, CLS and
   server-rendering are all passing; keep them passing as the site changes
   (rerun `agent_ux_check.py` and `lighthouse_agentic.py` after any layout
   or hydration change).
2. Confirm `/dashboard` and `/api` require real authentication independent
   of robots.txt, since several user-triggered agents are documented to
   ignore robots.txt Disallow. Confirm with a direct authenticated-vs-
   unauthenticated request test, not a re-run of this checklist.
3. Decide a training-data stance with the site owner, then optionally add a
   `Content-Signal` line to the `*` group (`agentic_fix.py robots` drafts
   it; nothing is deployed automatically). Verify with `agentic_check.py`
   afterward.
4. Optionally publish a valid `/llms.txt` (H1, a `>` summary line, at least
   one Markdown link, 50+ characters) to move Lighthouse from 2/2 to 3/3
   and to close the self-referential credibility gap noted above. Verify
   with `lighthouse_agentic.py --from-json` on a fresh Lighthouse run (PSI
   once quota resets, or another local run).
5. Do not build WebMCP tools or an `ai-catalog.json` speculatively — both
   are optional drafts with narrow current consumer support. Revisit only
   when there's a real form/transaction (WebMCP) or a real agent resource
   like an MCP server or skill (ai-catalog.json) to describe.
6. Manually review hover-only menus, focus traps and confirmation-state
   stability — not covered by any script run here.
