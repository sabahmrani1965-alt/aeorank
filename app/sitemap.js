const BASE_URL = "https://aeorank.tech";

const blogSlugs = [
  "how-to-get-cited-by-chatgpt",
  "measure-ai-citation-roi",
  "entity-authority-ai-citation",
  "optimize-for-perplexity",
  "aeo-vs-seo",
  "google-ai-overviews-guide",
];

const industrySlugs = ["saas", "startups", "tech-it", "software"];

const serviceSlugs = [
  "aeo-management",
  "aeo-consulting",
  "citation-building",
  "entity-optimization",
  "ai-visibility-audit",
];

export default function sitemap() {
  const lastModified = new Date().toISOString().slice(0, 10);

  const staticPages = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogPages = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const industryPages = industrySlugs.map((slug) => ({
    url: `${BASE_URL}/industries/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const servicePages = serviceSlugs.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...blogPages,
    ...industryPages,
    ...servicePages,
  ].map((p) => ({ ...p, lastModified }));
}
