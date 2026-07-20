// Client-side helper: is the current browser hostname the dedicated
// poster domain (see middleware.js)? Used to decide whether shared pages
// like /login should render KarmaCrew branding instead of AEOrank's.
export function isPosterHost(hostname) {
  const url = process.env.NEXT_PUBLIC_POSTER_SITE_URL;
  if (!url || !hostname) return false;
  try {
    return new URL(url).hostname === hostname;
  } catch {
    return false;
  }
}
