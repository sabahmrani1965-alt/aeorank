const BASE_URL = 'https://aeorank.tech'

const blogSlugs = [
  'how-to-get-cited-by-chatgpt',
  'measure-ai-citation-roi',
  'entity-authority-ai-citation',
  'optimize-for-perplexity',
  'aeo-vs-seo',
  'google-ai-overviews-guide',
]

const serviceSlugs = [
  'aeo-management',
  'aeo-consulting',
  'citation-building',
  'entity-optimization',
  'ai-visibility-audit',
]

const industrySlugs = ['saas', 'startups', 'tech-it', 'software']

export default function sitemap() {
  const staticPages = [
    { url: BASE_URL, lastModified: '2026-04-16', changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/services`, lastModified: '2026-04-16', changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/case-studies`, lastModified: '2026-04-16', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: '2026-04-16', changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: '2026-04-16', changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: '2026-04-16', changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: '2026-04-16', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/privacy`, lastModified: '2026-04-16', changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: '2026-04-16', changeFrequency: 'yearly', priority: 0.3 },
  ]

  const blogPages = blogSlugs.map(slug => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: '2026-04-16',
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const servicePages = serviceSlugs.map(slug => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: '2026-04-16',
    changeFrequency: 'monthly',
    priority: 0.85,
  }))

  const industryPages = industrySlugs.map(slug => ({
    url: `${BASE_URL}/industries/${slug}`,
    lastModified: '2026-04-16',
    changeFrequency: 'monthly',
    priority: 0.75,
  }))

  return [...staticPages, ...servicePages, ...industryPages, ...blogPages]
}
