/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // export const dynamic = "force-dynamic" on a page only controls SERVER-
  // side rendering (no static generation, no server response caching) — it
  // does nothing about the separate CLIENT-side Router Cache, which by
  // default still reuses a dynamic route's last-fetched RSC payload for
  // ~30s on any client-side navigation (Link/router.push/redirect after
  // login — anything short of a hard reload). That's exactly why admin
  // pages showed stale data right after logging in but fresh data on a
  // manual refresh.
  //
  // Deliberately 1, not 0: confirmed live that 0 doesn't actually disable
  // this in Next 14.2.5 (still served ~30s-stale data on navigation after
  // deploying it) — a known falsy-value quirk in how this framework
  // version reads staleTimes.dynamic, worked around by the community with
  // any small positive number instead. 1 second is imperceptible but
  // isn't falsy, so it reliably takes effect.
  experimental: {
    staleTimes: {
      dynamic: 1,
    },
  },
};

module.exports = nextConfig;
