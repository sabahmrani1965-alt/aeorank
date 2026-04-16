import Link from 'next/link'
import { notFound } from 'next/navigation'

const posts = {
  'how-to-get-cited-by-chatgpt': {
    tag: 'AEO · Strategy',
    title: 'How to Get Your SaaS Brand Cited by ChatGPT in 2026',
    description: 'A step-by-step guide to building entity authority, creating answer-first content, and securing the citations that make ChatGPT recommend your product.',
    date: 'April 10, 2026',
    updated: '2026-04-10',
    readTime: '8 min read',
    author: 'AEOrank Team',
    sections: [
      {
        heading: 'Why ChatGPT Citations Matter for SaaS',
        content: `ChatGPT processes over 200 million queries per week, and a growing share of those come from B2B buyers researching software solutions. When ChatGPT recommends your product by name, it carries an implicit endorsement — one that bypasses ad fatigue and lands with far more trust than a paid placement.\n\nUnlike traditional search where you compete for ten blue links, AI citation is binary: you're either mentioned or you're not. And the brands that get cited aren't always the biggest — they're the ones AI engines trust the most. That trust is built through entity authority, structured data, and strategic content placement.`
      },
      {
        heading: 'Step 1: Build Your Entity Authority Profile',
        content: `Entity authority is the foundation of every AI citation. AI engines don't rank pages — they evaluate entities (brands, products, people) based on how well-established and trustworthy they appear across the web.\n\nTo build entity authority:\n\n• Claim and optimize your knowledge panel on Google.\n• Ensure consistent NAP (Name, Address, Phone) data across all directories.\n• Get listed on high-authority industry directories and comparison platforms (G2, Capterra, TrustRadius).\n• Build a Wikipedia-style presence through notable third-party coverage.\n• Create a robust "About" page with structured data that clearly defines your brand as an entity.`
      },
      {
        heading: 'Step 2: Create Answer-First Content',
        content: `AI engines pull from content that directly answers user questions in a clear, authoritative format. This means restructuring your content strategy around the questions your buyers actually ask.\n\nThe answer-first content framework:\n\n1. Research the top 50 questions buyers ask about your category using tools like AlsoAsked, AnswerThePublic, and ChatGPT itself.\n2. Create dedicated pages or sections that answer each question in the first 2–3 sentences.\n3. Follow the answer with supporting evidence, data, and examples.\n4. Use clear headings (H2/H3) that match the question format.\n5. Include comparison content ("X vs Y") since these are among the most common AI queries.`
      },
      {
        heading: 'Step 3: Secure Third-Party Citations',
        content: `AI engines weight third-party mentions heavily. If trusted publications reference your brand in the context of solving a specific problem, AI tools are far more likely to cite you.\n\nEffective citation building strategies:\n\n• Contribute expert commentary to industry publications.\n• Publish original research and data that others will reference.\n• Secure product reviews on high-DA technology publications.\n• Build relationships with analysts who influence AI training data.\n• Create "best of" and comparison content on neutral domains that includes your brand.`
      },
      {
        heading: 'Step 4: Implement Comprehensive Schema Markup',
        content: `Structured data helps AI crawlers understand exactly what your product does, who it's for, and how it compares to alternatives.\n\nEssential schema types for SaaS AEO:\n\n• Organization schema with full brand details.\n• Product schema with features, pricing, and reviews.\n• FAQ schema on every page with common questions.\n• HowTo schema for tutorial and guide content.\n• Review and AggregateRating schema from real customer feedback.\n• BreadcrumbList for clear site hierarchy.`
      },
      {
        heading: 'Step 5: Monitor and Optimize Your AI Presence',
        content: `AEO is not a set-it-and-forget-it strategy. AI engines update their models and sources regularly, so continuous monitoring is essential.\n\nKey metrics to track:\n\n• Citation frequency: How often your brand appears in AI-generated answers.\n• Citation accuracy: Whether AI engines describe your product correctly.\n• Share of voice: Your citation rate vs. competitors for target queries.\n• Referral traffic: Visits from AI-powered search and chat interfaces.\n• Pipeline attribution: Leads and demos that originate from AI-sourced traffic.`
      },
    ],
  },

  'measure-ai-citation-roi': {
    tag: 'AEO · Measurement',
    title: 'How to Measure AI Citation ROI: A Framework for SaaS Marketers',
    description: 'AI citations are worthless if you can\'t measure their business impact. Here\'s the exact framework we use to tie AEO directly to pipeline and revenue.',
    date: 'April 3, 2026',
    updated: '2026-04-03',
    readTime: '6 min read',
    author: 'AEOrank Team',
    sections: [
      {
        heading: 'The AI Attribution Challenge',
        content: `Most SaaS marketers know AI citations are valuable, but few can quantify that value. The challenge is that AI-sourced traffic doesn't always show up cleanly in your analytics — users might see your brand in ChatGPT, then Google you directly, making attribution murky.\n\nThis framework solves that problem by combining direct measurement with proxy signals to build a complete picture of AEO ROI.`
      },
      {
        heading: 'Layer 1: Direct Traffic Measurement',
        content: `Start with what you can measure directly:\n\n• Referral traffic from chat.openai.com, perplexity.ai, bing.com/chat, and google.com AI Overviews.\n• UTM-tagged links from AI platforms that support them.\n• "How did you hear about us?" survey responses mentioning AI assistants.\n• Branded search volume increases that correlate with AI citation campaigns.\n• Direct traffic spikes following new AI citation appearances.`
      },
      {
        heading: 'Layer 2: Citation Scoring Model',
        content: `Not all citations are equal. Build a scoring model that weights citations by:\n\n• Query intent (high-intent buyer queries score higher than informational).\n• Citation position (primary recommendation vs. mentioned in a list).\n• Platform reach (ChatGPT citations typically drive more impact than niche AI tools).\n• Accuracy (correct product descriptions convert better than generic mentions).\n• Frequency (consistent citation across multiple queries indicates strong entity authority).`
      },
      {
        heading: 'Layer 3: Pipeline Attribution',
        content: `Connect citation data to revenue:\n\n1. Tag leads that arrive through AI-sourced channels in your CRM.\n2. Track conversion rates of AI-sourced leads vs. other channels.\n3. Measure time-to-close for AI-attributed opportunities.\n4. Calculate customer lifetime value by acquisition source.\n5. Build a monthly report comparing AEO investment to attributed pipeline.\n\nMost of our clients see AI-sourced leads converting 30–40% better than paid channels, with shorter sales cycles and higher average contract values.`
      },
      {
        heading: 'Layer 4: Competitive Share of Voice',
        content: `Track your citation share relative to competitors across your target query set:\n\n• Monitor 50–100 high-intent queries weekly across ChatGPT, Perplexity, and Google AI.\n• Calculate your share of voice (citations for your brand / total citations in category).\n• Track share of voice trends month-over-month.\n• Identify queries where competitors are cited but you're not — these are your gaps.\n• Prioritize gap-closing based on query intent and volume.`
      },
      {
        heading: 'Building Your ROI Dashboard',
        content: `Combine all four layers into a single dashboard:\n\n• Monthly AI-sourced traffic and leads.\n• Citation score trend (weighted across all tracked queries).\n• Pipeline attributed to AI channels.\n• Share of voice vs. top 3 competitors.\n• Cost per AI-sourced lead vs. other acquisition channels.\n• Projected ROI based on current trajectory.\n\nThis dashboard becomes the single source of truth for your AEO investment decisions.`
      },
    ],
  },

  'entity-authority-ai-citation': {
    tag: 'Entity SEO · AEO',
    title: 'Entity Authority: The Hidden Driver Behind Every AI Citation',
    description: 'Why some brands get cited constantly by AI engines while others never appear — and what you can do to build the entity authority that makes the difference.',
    date: 'March 27, 2026',
    updated: '2026-03-27',
    readTime: '10 min read',
    author: 'AEOrank Team',
    sections: [
      {
        heading: 'What Is Entity Authority and Why Does It Matter?',
        content: `Entity authority is how AI engines evaluate the trustworthiness, relevance, and prominence of a brand or product. Unlike traditional SEO where domain authority and backlinks drive rankings, AI citation is driven by how well-established your brand is as a recognized entity in the knowledge graph.\n\nThink of it this way: when a human expert recommends a product, they draw on their knowledge of the brand's reputation, track record, and industry presence. AI engines work similarly — they assess your entity's "reputation" across the entire web before deciding whether to cite you.`
      },
      {
        heading: 'The Three Pillars of Entity Authority',
        content: `Entity authority is built on three pillars:\n\n1. Recognition — Does the AI engine know your brand exists? This requires consistent, widespread mentions across authoritative sources.\n\n2. Relevance — Does the AI engine associate your brand with the right topics, categories, and solutions? This requires targeted content and third-party context.\n\n3. Trust — Does the AI engine consider your brand a reliable source? This requires social proof, expert endorsements, and factual accuracy across all your content.`
      },
      {
        heading: 'How AI Engines Evaluate Entities',
        content: `AI large language models build internal representations of entities during training and through retrieval-augmented generation (RAG). They evaluate:\n\n• Frequency of mentions across training data and indexed sources.\n• Context of mentions — are you mentioned as a leader, alternative, or negative example?\n• Consistency of information — do all sources agree on what your product does?\n• Authority of sources — are you mentioned by trusted publications, analysts, and experts?\n• Recency — how current are the mentions and data about your brand?`
      },
      {
        heading: 'Building Entity Authority: A Practical Roadmap',
        content: `Phase 1 (Month 1–2): Foundation\n• Audit your current entity presence across Google Knowledge Graph, Wikidata, and major directories.\n• Fix inconsistencies in brand descriptions, founding details, and product categorization.\n• Implement Organization and Product schema across your website.\n• Claim and optimize all relevant business profiles.\n\nPhase 2 (Month 3–4): Amplification\n• Secure mentions in 10–20 high-authority industry publications.\n• Publish 3–5 pieces of original research that establish thought leadership.\n• Build comparison and alternative pages that define your category position.\n• Launch a digital PR campaign targeting AI training source publications.\n\nPhase 3 (Month 5–6): Optimization\n• Monitor AI citation frequency and accuracy.\n• Identify and fill entity gaps where competitors are better represented.\n• Scale citation-building efforts based on what's working.\n• Begin measuring ROI through pipeline attribution.`
      },
      {
        heading: 'Common Entity Authority Mistakes',
        content: `Avoid these pitfalls that undermine entity authority:\n\n• Inconsistent branding across platforms (different names, descriptions, or categorizations).\n• Thin or generic product descriptions that don't differentiate your offering.\n• Lack of third-party validation — self-published content alone isn't enough.\n• Ignoring structured data — AI crawlers rely heavily on schema markup.\n• Focusing only on Google — entity authority needs to span all AI platforms.\n• Neglecting negative or incorrect mentions that confuse AI models about your brand.`
      },
    ],
  },

  'optimize-for-perplexity': {
    tag: 'AEO · Perplexity',
    title: 'How to Optimize for Perplexity AI: A B2B SaaS Guide',
    description: 'Perplexity is becoming the preferred research tool for technical buyers. Here\'s how to make sure your brand shows up when they search for solutions like yours.',
    date: 'March 20, 2026',
    updated: '2026-03-20',
    readTime: '7 min read',
    author: 'AEOrank Team',
    sections: [
      {
        heading: 'Why Perplexity Matters for B2B SaaS',
        content: `Perplexity AI has become the research tool of choice for technical buyers and decision-makers. Unlike ChatGPT, Perplexity performs real-time web searches and cites its sources directly — making it a hybrid between a search engine and an AI assistant.\n\nFor B2B SaaS, this means Perplexity users are often in active research mode: comparing solutions, reading reviews, and making shortlist decisions. If your brand appears in Perplexity's answers during this phase, you're reaching buyers at the highest-intent moment possible.`
      },
      {
        heading: 'How Perplexity Selects Sources',
        content: `Perplexity's answer engine works differently from ChatGPT:\n\n• It performs live web searches for every query, so fresh content matters.\n• It prioritizes authoritative, well-structured pages that directly answer the query.\n• It cites sources with clickable links, driving actual referral traffic.\n• It favors content with clear headings, concise answers, and supporting data.\n• It pulls from a wide range of sources but weights established publications and comparison sites heavily.`
      },
      {
        heading: 'Content Strategy for Perplexity Optimization',
        content: `Optimize your content specifically for how Perplexity retrieves and presents information:\n\n1. Answer questions directly in the first paragraph — Perplexity extracts concise answers.\n2. Use structured headings (H2/H3) that match common query patterns.\n3. Include data, statistics, and concrete examples that Perplexity can reference.\n4. Create comprehensive comparison pages (your product vs. alternatives).\n5. Publish pricing pages with clear, structured pricing information.\n6. Maintain an updated FAQ that covers the most common buyer questions.\n7. Keep content fresh — Perplexity's real-time search favors recently updated pages.`
      },
      {
        heading: 'Technical Optimization for Perplexity',
        content: `Technical SEO elements that influence Perplexity visibility:\n\n• Fast page load times — Perplexity's crawler has limited patience for slow pages.\n• Clean HTML structure with semantic markup.\n• Comprehensive schema.org structured data.\n• Mobile-responsive design (Perplexity indexes mobile-first).\n• No content behind login walls or paywalls.\n• XML sitemap with accurate last-modified dates.\n• Proper canonical tags to avoid duplicate content issues.`
      },
      {
        heading: 'Building Off-Site Authority for Perplexity',
        content: `Perplexity relies heavily on third-party sources, so your off-site presence matters:\n\n• Get featured in industry roundup articles and "best of" lists.\n• Secure product reviews on technology publications that Perplexity trusts.\n• Contribute expert content to platforms like HackerNoon, Dev.to, and industry-specific publications.\n• Maintain active and detailed profiles on G2, Capterra, and TrustRadius.\n• Publish case studies and data that other publications want to reference.\n• Engage in community discussions on platforms Perplexity indexes (Reddit, Stack Overflow, relevant forums).`
      },
      {
        heading: 'Monitoring Your Perplexity Presence',
        content: `Track your Perplexity performance systematically:\n\n• Weekly manual checks: search your target queries on Perplexity and document results.\n• Track referral traffic from perplexity.ai in your analytics.\n• Monitor which of your pages Perplexity cites most frequently.\n• Compare your citation rate against competitors for the same queries.\n• Test different content formats to see which get cited more often.\n• Track the accuracy of how Perplexity describes your product — incorrect descriptions need fixing at the source.`
      },
    ],
  },

  'aeo-vs-seo': {
    tag: 'AEO vs SEO',
    title: 'AEO vs SEO: What\'s Different and Why You Need Both',
    description: 'AEO and SEO aren\'t competitors — they\'re complements. But they require different strategies. Here\'s how to think about balancing both for maximum visibility.',
    date: 'March 13, 2026',
    updated: '2026-03-13',
    readTime: '9 min read',
    author: 'AEOrank Team',
    sections: [
      {
        heading: 'The Fundamental Difference Between AEO and SEO',
        content: `SEO optimizes for search engine results pages — the ten blue links. AEO optimizes for AI-generated answers — the direct responses from ChatGPT, Perplexity, Google AI Overviews, and other AI assistants.\n\nThe key distinction: SEO drives clicks to your website. AEO drives brand mentions and recommendations in AI conversations. Both ultimately generate pipeline, but through different mechanisms.\n\nSEO says: "Here are ten results — click one." AEO says: "Based on everything I know, I recommend X." That implicit endorsement from an AI engine is fundamentally more powerful than a search ranking.`
      },
      {
        heading: 'Where SEO and AEO Overlap',
        content: `Despite their differences, SEO and AEO share significant common ground:\n\n• Both reward high-quality, authoritative content.\n• Both benefit from strong backlink profiles and domain authority.\n• Both require technical excellence (fast loading, clean markup, structured data).\n• Both favor brands with strong entity recognition across the web.\n• Both are influenced by E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness).\n\nInvesting in SEO lays the groundwork for AEO success. A strong SEO foundation gives AI engines more data points to evaluate your brand.`
      },
      {
        heading: 'Where AEO Requires a Different Approach',
        content: `AEO diverges from SEO in several critical ways:\n\n1. Content format — AEO content needs to directly answer questions, not just target keywords. AI engines extract answers, not rank pages.\n\n2. Third-party presence — While SEO focuses on your own site, AEO requires a strong presence across third-party publications that AI engines use as sources.\n\n3. Entity optimization — AEO requires explicit work on your brand's entity profile across knowledge graphs and databases.\n\n4. Answer accuracy — AI engines penalize brands associated with inaccurate or contradictory information. Consistency across all sources is critical.\n\n5. Conversational intent — AEO targets how people ask questions in conversation ("What's the best CI/CD tool for a startup?") rather than keyword strings ("ci cd tool startup").`
      },
      {
        heading: 'The Combined Strategy: SEO + AEO',
        content: `The most effective approach combines both strategies:\n\n• Use SEO to build foundational domain authority and organic traffic.\n• Layer AEO tactics on top: entity optimization, citation building, answer-first content.\n• Create content that serves both: well-structured pages that rank on Google AND get cited by AI.\n• Invest in technical SEO (schema, site speed, structure) that benefits both channels.\n• Build thought leadership content that earns backlinks AND third-party citations.\n\nThe brands that win in 2026 and beyond won't choose between SEO and AEO — they'll build integrated strategies that capture traffic from every channel where buyers research.`
      },
      {
        heading: 'Budget Allocation: How to Split Between SEO and AEO',
        content: `For B2B SaaS companies just starting with AEO, we recommend:\n\n• Year 1: 70% SEO / 30% AEO — Build the foundation while starting entity authority work.\n• Year 2: 50% SEO / 50% AEO — Shift investment as AI channels grow.\n• Year 3+: 40% SEO / 60% AEO — AI-first approach as AI becomes the primary research channel.\n\nThese ratios vary based on your current SEO maturity, competitive landscape, and buyer behavior. Companies in technical categories (DevOps, cybersecurity, data engineering) are seeing faster AEO adoption and should shift budget sooner.`
      },
      {
        heading: 'Measuring Success Across Both Channels',
        content: `Track SEO and AEO metrics together for a complete picture:\n\n• SEO metrics: organic traffic, keyword rankings, domain authority, organic conversions.\n• AEO metrics: AI citation frequency, share of voice, AI-sourced referral traffic, citation accuracy.\n• Combined metrics: total addressable visibility, blended cost per lead, pipeline by source, revenue attribution.\n\nThe goal isn't to make AEO replace SEO — it's to ensure your brand is visible everywhere your buyers look, whether that's a Google search, a ChatGPT conversation, or a Perplexity research session.`
      },
    ],
  },

  'google-ai-overviews-guide': {
    tag: 'Google AI · AEO',
    title: 'Google AI Overviews: How to Get Featured in SGE Answers',
    description: 'Google AI Overviews are reshaping organic search. This guide covers exactly what signals Google looks for and how to position your content to get featured.',
    date: 'March 6, 2026',
    updated: '2026-03-06',
    readTime: '11 min read',
    author: 'AEOrank Team',
    sections: [
      {
        heading: 'What Are Google AI Overviews?',
        content: `Google AI Overviews (formerly Search Generative Experience / SGE) are AI-generated summaries that appear at the top of Google search results for many queries. They synthesize information from multiple sources to provide a direct answer, often pushing traditional organic results below the fold.\n\nFor B2B SaaS, AI Overviews are appearing on an increasing number of product research queries — "best project management software," "how to choose a CRM," "DevOps tool comparison." If your brand isn't represented in these overviews, you're invisible for a growing share of buyer searches.`
      },
      {
        heading: 'How Google AI Overviews Select Sources',
        content: `Google AI Overviews pull from a combination of signals:\n\n• Existing organic search rankings — pages that rank well are more likely to be cited.\n• Content quality and comprehensiveness — thorough, well-structured content wins.\n• E-E-A-T signals — demonstrated expertise, experience, and authority.\n• Schema markup — structured data helps Google understand and extract information.\n• Source diversity — Google prefers to cite multiple authoritative sources, not just one.\n• Freshness — recently updated content is favored, especially for evolving topics.`
      },
      {
        heading: 'Content Optimization for AI Overviews',
        content: `Structure your content to be easily extracted by Google's AI:\n\n1. Lead with a concise, direct answer to the query (2–3 sentences).\n2. Follow with structured supporting details using clear H2/H3 headings.\n3. Include bullet points and numbered lists — these are frequently extracted verbatim.\n4. Add data, statistics, and specific numbers that add credibility.\n5. Create comprehensive "ultimate guide" content for your core topics.\n6. Update existing content regularly with new data and insights.\n7. Include expert quotes and original perspectives that differentiate your content.`
      },
      {
        heading: 'Technical Requirements for AI Overview Inclusion',
        content: `Technical SEO is crucial for AI Overview inclusion:\n\n• Implement comprehensive schema markup (FAQ, HowTo, Product, Organization).\n• Ensure fast Core Web Vitals scores (LCP under 2.5s, CLS under 0.1).\n• Use semantic HTML with proper heading hierarchy.\n• Build a clear internal linking structure that establishes topical authority.\n• Maintain an updated XML sitemap with correct last-modified dates.\n• Implement proper canonical tags and avoid content duplication.\n• Ensure mobile-first design (Google indexes mobile versions first).`
      },
      {
        heading: 'Building Topical Authority for AI Overviews',
        content: `Google AI Overviews favor sources with demonstrated topical authority:\n\n• Create content clusters around your core topics (pillar pages + supporting articles).\n• Cover every angle of your topic: beginner guides, advanced techniques, comparisons, case studies.\n• Earn links from authoritative sites in your niche.\n• Demonstrate real-world experience through case studies, original data, and expert commentary.\n• Build author profiles with credible bios and linked expertise.\n• Cross-reference your own content to build internal topical authority signals.`
      },
      {
        heading: 'Monitoring Your AI Overview Presence',
        content: `Track your visibility in Google AI Overviews:\n\n• Search your target queries regularly and document whether AI Overviews appear and what sources are cited.\n• Use rank tracking tools that support AI Overview monitoring.\n• Track which of your pages get cited and which competitor pages appear.\n• Monitor Google Search Console for impressions and clicks from AI Overview features.\n• Test content updates: after refreshing a page, check if AI Overview inclusion changes.\n• Pay attention to which content formats get extracted most (lists, definitions, how-to steps).`
      },
      {
        heading: 'AI Overviews and the Future of Organic Search',
        content: `AI Overviews represent a fundamental shift in how Google presents search results. For B2B SaaS brands, the implications are clear:\n\n• Traditional Position 1 rankings are less valuable if an AI Overview sits above them.\n• Brands that appear in AI Overviews get an implicit Google endorsement.\n• Content strategies must evolve from "rank for keywords" to "be the source AI trusts."\n• Investment in entity authority and structured data pays increasing dividends.\n• The line between SEO and AEO blurs most in Google AI Overviews — optimize for both simultaneously.\n\nCompanies that adapt their strategies now will have a significant competitive advantage as AI Overviews expand across more query types.`
      },
    ],
  },
}

const allPosts = Object.entries(posts).map(([slug, post]) => ({ slug, ...post }))

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const post = posts[params.slug]
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.updated,
      authors: [post.author],
    },
    alternates: {
      canonical: `https://aeorank.tech/blog/${params.slug}`,
    },
  }
}

export default function BlogPost({ params }) {
  const post = posts[params.slug]
  if (!post) notFound()

  const related = allPosts.filter(p => p.slug !== params.slug).slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.updated,
    dateModified: post.updated,
    author: { '@type': 'Organization', name: 'AEOrank', url: 'https://aeorank.tech' },
    publisher: { '@type': 'Organization', name: 'AEOrank', url: 'https://aeorank.tech' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://aeorank.tech/blog/${params.slug}` },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aeorank.tech' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://aeorank.tech/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://aeorank.tech/blog/${params.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section className="page-hero" style={{ paddingBottom: '40px' }}>
        <div className="page-hero-glow" />
        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(242,168,59,0.1)', border: '1px solid rgba(242,168,59,0.2)', padding: '4px 12px', borderRadius: '100px' }}>{post.tag}</span>
          </div>
          <h1 className="section-title fade-up" style={{ fontSize: 'clamp(2rem,4.5vw,3.2rem)', marginBottom: '20px', lineHeight: 1.15 }}>
            {post.title}
          </h1>
          <div className="fade-up delay-1" style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
            <span>{post.author}</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>{post.date}</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          <nav style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '40px' }}>
            <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>
            <Link href="/blog" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Blog</Link>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>
            <span style={{ color: 'var(--text)' }}>{post.title}</span>
          </nav>

          <article>
            {post.sections.map((section, i) => (
              <div key={i} style={{ marginBottom: '48px' }}>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(1.3rem,2.5vw,1.75rem)', color: '#fff', marginBottom: '18px', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{section.heading}</h2>
                {section.content.split('\n\n').map((para, j) => (
                  <p key={j} style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: 1.85, marginBottom: '18px', fontWeight: 300 }}>{para}</p>
                ))}
              </div>
            ))}
          </article>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '48px', marginTop: '48px', textAlign: 'center' }}>
            <span className="section-tag" style={{ display: 'block', marginBottom: '14px' }}>Ready to Get Started?</span>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(1.5rem,3vw,2.2rem)', color: '#fff', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Want These Results for <em className="gold-text">Your Brand?</em>
            </h3>
            <p style={{ color: 'var(--muted)', maxWidth: '440px', margin: '0 auto 28px', fontWeight: 300, lineHeight: 1.7 }}>
              Book a free AEO audit and see exactly where your brand stands in AI-generated answers.
            </p>
            <Link href="/contact" className="btn-gold">Book a Free AEO Audit →</Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section" style={{ background: 'var(--navy2)' }}>
          <div className="container">
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', color: '#fff', marginBottom: '32px', letterSpacing: '-0.02em' }}>Related Articles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }} className="three-col">
              {related.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ height: '100%' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '10px' }}>{r.tag}</span>
                    <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '1rem', color: '#fff', lineHeight: 1.4, marginBottom: '10px', letterSpacing: '-0.01em' }}>{r.title}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.65, fontWeight: 300 }}>{r.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 900px) {
          .three-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
