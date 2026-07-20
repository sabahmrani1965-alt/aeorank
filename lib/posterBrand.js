// Client-side helper: is the current browser hostname the dedicated
// poster domain (see middleware.js)? Used to decide whether shared pages
// like /login should render CrewQuest branding instead of AEOrank's.
//
// www.-agnostic (see middleware.js's stripWww for why) — Vercel's
// apex/www redirect means the env var and the actual browser hostname
// can differ only by a "www." prefix; that shouldn't cause a mismatch.
function stripWww(hostname) {
  return hostname.replace(/^www\./, "");
}

export function isPosterHost(hostname) {
  const url = process.env.NEXT_PUBLIC_POSTER_SITE_URL;
  if (!url || !hostname) return false;
  try {
    return stripWww(new URL(url).hostname) === stripWww(hostname);
  } catch {
    return false;
  }
}
