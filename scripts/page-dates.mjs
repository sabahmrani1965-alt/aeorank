// Writes lib/pageDates.json: for each marketing page, the date its source
// last changed in git. app/sitemap.js reads it, so <lastmod> means "this page
// changed", not "the site was rebuilt". Runs before `npm run build`.
//
// A shallow clone (Vercel may build from one) can't see the real history and
// would date every page to the latest commit, so there the committed file is
// kept as is. Run `node scripts/page-dates.mjs` locally after editing pages.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

try {
  if (git("rev-parse", "--is-shallow-repository") === "true") {
    console.log("[page-dates] shallow clone, keeping lib/pageDates.json");
    process.exit(0);
  }
} catch {
  console.log("[page-dates] no git, keeping lib/pageDates.json");
  process.exit(0);
}

// Route -> the files whose edits change what that page says.
const PAGES = {
  "/": ["app/page.js"],
  "/services": ["app/services/page.js"],
  "/services/*": ["app/services/[slug]/page.js"],
  "/pricing": ["app/pricing/page.js", "components/PricingTiers.js"],
  "/proof": ["app/proof/page.js"],
  "/blog": ["app/blog/page.js"],
  "/industries": ["app/industries/page.js"],
  "/industries/*": ["app/industries/[slug]/page.js"],
  "/about": ["app/about/page.js"],
  "/contact": ["app/contact/page.js"],
  "/privacy": ["app/privacy/page.js"],
  "/terms": ["app/terms/page.js"],
  "/free-ai-visibility-checker": ["app/free-ai-visibility-checker/page.js", "components/tools/FreeVisibilityChecker.js"],
  "/tools": ["app/tools/page.js"],
  "/tools/reddit-markdown-formatter": ["app/tools/reddit-markdown-formatter"],
  "/tools/reddit-title-checker": ["app/tools/reddit-title-checker"],
  "/tools/reddit-self-promotion-checker": ["app/tools/reddit-self-promotion-checker"],
  "/affiliates": ["app/affiliates/page.js"],
};

const dates = {};
for (const [route, files] of Object.entries(PAGES)) {
  const d = files
    .map((f) => {
      try {
        return git("log", "-1", "--format=%cs", "--", f);
      } catch {
        return "";
      }
    })
    .filter(Boolean)
    .sort()
    .pop();
  if (d) dates[route] = d;
}
writeFileSync(new URL("../lib/pageDates.json", import.meta.url), JSON.stringify(dates, null, 2) + "\n");
console.log(`[page-dates] ${Object.keys(dates).length} pages dated`);
