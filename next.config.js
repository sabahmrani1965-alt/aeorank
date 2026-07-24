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
  // manual refresh. Setting this to 0 makes every client-side navigation
  // to a dynamic route re-fetch from the server, matching what
  // force-dynamic already implies server-side.
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
};

module.exports = nextConfig;
