# AEOrank

Help your brand show up in ChatGPT, Claude, and Gemini answers through measurable Reddit engagement.

## What it does

Visitor enters a website URL → AEOrank generates a custom report covering:
- Top subreddits where the audience already discusses related topics
- Top relevant Reddit posts (live, via Reddit's public API)
- Estimated keyword opportunities
- Live AI citation samples (ChatGPT / Claude / Gemini-style answers)
- Pricing tiers and a contact form for paid engagements

A summary email is sent to the user via Resend.

## Tech

- Next.js 14 (App Router)
- Reddit public JSON API (read-only)
- Anthropic API for live LLM answers (optional)
- Resend for transactional email (optional)

## Run locally

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY + RESEND_API_KEY
npm run dev
```

Then open http://localhost:3001
