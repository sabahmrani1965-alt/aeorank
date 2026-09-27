import { posts } from "./blog/page";
import { services } from "./services/[slug]/page";
import { industries } from "./industries/[slug]/page";

// Derived, not hand-maintained. The previous version copied three slug
// arrays by hand and had already drifted: /blog/what-is-aeo was live and
// linked from /blog but missing from the sitemap entirely.

const BASE_URL = "https://www.aeorank.tech";

/// Posts carry a human date ("August 28, 2026"). Fall back to the build
/// date only when a post has none, rather than stamping today on all of
/// them, which told crawlers every page changed on every deploy.
function postDate(post, fallback) {
  if (!post?.date) return fallback;
  const parsed = new Date(post.date);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString().slice(0, 10);
}

export default function sitemap() {
  const buildDate = new Date().toISOString().slice(0, 10);

  const staticPages = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/industries`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ].map((p) => ({ ...p, lastModified: buildDate }));

  const blogPages = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: postDate(post, buildDate),
  }));

  const industryPages = Object.keys(industries).map((slug) => ({
    url: `${BASE_URL}/industries/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: buildDate,
  }));

  const servicePages = Object.keys(services).map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: buildDate,
  }));

  return [...staticPages, ...blogPages, ...industryPages, ...servicePages];
}
