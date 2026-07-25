import { searchPosts } from "@/lib/reddit";

// Real Reddit search volume for a tracked keyword — not a third-party SEO
// estimate. "Volume" here is genuinely however many real posts Reddit's
// own search (via lib/reddit.js's searchPosts, same OAuth/Tavily/Pullpush/
// Apify fallback chain used everywhere else) returns for this phrase in
// the last month, capped at SAMPLE_CAP — a real signal for "is this
// actually discussed on Reddit," even though it isn't a precise
// monthly-search-count the way a Google-keyword-planner-style number is.
const SAMPLE_CAP = 25;

export async function checkKeywordVolume(keyword) {
  const posts = await searchPosts(keyword, SAMPLE_CAP);

  const subCounts = new Map();
  for (const p of posts) {
    subCounts.set(p.sub, (subCounts.get(p.sub) || 0) + 1);
  }
  const topSubreddits = [...subCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([sub]) => sub);

  const samplePosts = posts
    .slice()
    .sort((a, b) => b.ups - a.ups)
    .slice(0, 3)
    .map((p) => ({ title: p.title, sub: p.sub, permalink: p.permalink, ups: p.ups }));

  return { postCount: posts.length, topSubreddits, samplePosts };
}
