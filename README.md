# AEOrank — Educational Research Project

A working prototype that generates a Reddit + AI visibility report from any URL. Replicates the LaunchClub.ai report-generation funnel under the AEOrank brand for academic study.

## Purpose

This project is built **strictly for educational and research purposes** as part of a doctoral study analyzing:
- Lead-magnet funnel design in marketing-tech SaaS
- Reddit data accessibility via public APIs
- Claims around LLM training data and "AI visibility" services

## What it does

Visitor enters a website URL → the prototype:
1. Fetches the site's public meta tags
2. Extracts a brand name and category keywords
3. Queries Reddit's public JSON API for relevant subreddits and posts
4. Renders a personalized report

## What it does NOT do

- No real Reddit posting, account creation, or vote manipulation
- No payment processing
- LLM citation screenshots in the report are clearly labeled as illustrative mockups

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:3001

## Disclaimer

See `/research` for the full educational disclaimer.
