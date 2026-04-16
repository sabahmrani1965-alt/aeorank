# AEOrank — Next.js Website

Full Next.js website for [aeorank.tech](https://aeorank.tech)

## Pages
- `/` — Homepage
- `/services` — AEO Services
- `/case-studies` — Case Studies
- `/pricing` — Pricing Plans
- `/blog` — Blog
- `/about` — About
- `/contact` — Contact / Book a Session

## Deploy to Vercel (3 steps)

### Option A — GitHub + Vercel (recommended)
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Vercel auto-detects Next.js → click Deploy ✓

### Option B — Vercel CLI
```bash
npm install -g vercel
cd aeorank
vercel
```

## Run locally
```bash
npm install
npm run dev
# → http://localhost:3000
```

## Connect your domain
1. In Vercel dashboard → Project → Settings → Domains
2. Add `aeorank.tech` and `www.aeorank.tech`
3. Update your DNS at your registrar:
   - A record: `76.76.21.21`
   - CNAME www: `cname.vercel-dns.com`
