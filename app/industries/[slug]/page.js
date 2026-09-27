import MarketingLayout from "@/components/MarketingLayout";
import { renderBlock } from "@/components/prose";
import Link from "next/link";
import { notFound } from "next/navigation";

const RELATED = {
  "saas": [
    {
      "slug": "what-is-aeo",
      "title": "What Is AEO? Answer Engine Optimization Explained"
    },
    {
      "slug": "aeo-vs-seo",
      "title": "AEO vs SEO: Stop Pretending They're the Same Job"
    },
    {
      "slug": "measure-ai-citation-roi",
      "title": "How to Measure AI Citation ROI"
    }
  ],
  "startups": [
    {
      "slug": "what-is-aeo",
      "title": "What Is AEO? Answer Engine Optimization Explained"
    },
    {
      "slug": "reddit-ai-visibility-guide",
      "title": "Reddit Marketing for AI Search Visibility"
    },
    {
      "slug": "entity-authority-ai-citation",
      "title": "Entity Authority and AI Citation"
    }
  ],
  "software": [
    {
      "slug": "aeo-schema-markup-guide",
      "title": "The AEO Schema Markup Guide"
    },
    {
      "slug": "entity-authority-ai-citation",
      "title": "Entity Authority and AI Citation"
    },
    {
      "slug": "google-ai-overviews-guide",
      "title": "The Google AI Overviews Guide"
    }
  ],
  "tech-it": [
    {
      "slug": "getting-cited-by-claude",
      "title": "Getting Cited by Claude"
    },
    {
      "slug": "chatgpt-vs-claude-vs-gemini-citations",
      "title": "ChatGPT vs Claude vs Gemini Citations"
    },
    {
      "slug": "what-is-aeo",
      "title": "What Is AEO? Answer Engine Optimization Explained"
    }
  ]
}


// Exported so app/sitemap.js derives slugs from the same source.
export const industries = {
  'saas': {
    title: 'AEO for SaaS Companies',
    tag: 'SaaS Companies',
    description: 'Answer Engine Optimization built for B2B SaaS. We help SaaS companies get cited by ChatGPT, Perplexity, and Google AI for their highest-intent buyer queries.',
    hero: 'AEO Built for <em>B2B SaaS</em>',
    intro: 'SaaS buyers increasingly research software through AI assistants before ever visiting a website. We help SaaS companies become the default AI recommendation in their category.',
    challenges: [
      { title: 'Long, Considered Sales Cycles', desc: 'Buyers research for weeks or months across multiple channels. AEO ensures you\'re present during every AI-powered research moment.' },
      { title: 'Competitive AI Answer Landscape', desc: 'Most SaaS categories are crowded. We help you find and win the specific AI queries where competitors are weakest.' },
      { title: 'Product-Led Discovery', desc: 'AI engines now drive product evaluation. We make sure your product features, pricing, and integrations are accurately represented.' },
      { title: 'Tight Attribution Requirements', desc: 'SaaS teams need clear ROI. We tie AI citations directly to pipeline, MQLs, and closed revenue.' },
    ],
    approach: [
      'Entity authority profile built around your SaaS category and sub-category positioning.',
      'Citation building in SaaS-focused publications: Product Hunt, SaaSWorthy, G2 Learning Hub, BetterCloud.',
      'Answer-first content targeting "best [category]", "[competitor] alternatives", and "how to choose" queries.',
      'Comprehensive Product schema with features, pricing, integrations, and verified reviews.',
      'Monitoring specifically calibrated for SaaS buyer query patterns and purchase intent signals.',
    ],
    results: [
      { num: '+312%', label: 'Average AI Citation Increase' },
      { num: '4–6mo', label: 'To Meaningful Share-of-Voice' },
      { num: '+180%', label: 'AI-Sourced Pipeline Growth' },
    ],
    guide: [
      {
        heading: 'Why B2B SaaS is different from other AEO work',
        content: `A SaaS buyer does not ask an assistant one question. They ask a sequence, over weeks, and the answers compound: what tools exist, which suits our size, how does X compare to Y, is X worth the money, what do people who left X say.\n\nThat sequence is why category-level visibility matters more here than in most verticals. Being named once in a "best tools" answer does little if you are absent from the comparison and pricing answers that follow. The queries that decide a deal are the later ones.\n\n• **Long, multi-touch research.** Buyers return to the same assistant repeatedly across a cycle measured in weeks or months.\n• **Committee decisions.** The person asking is often not the person paying, so the answers need to satisfy both.\n• **Category crowding.** Most SaaS categories have a dozen credible vendors, and assistants name three.\n• **Switching questions.** "Alternatives to X" and "X vs Y" carry more intent than the category term itself.`,
      },
      {
        heading: 'Which queries actually decide a SaaS deal?',
        content: `Ranked by how close they sit to a purchase, not by volume. Volume is inversely correlated with intent here.\n\n| Query shape | Intent | Why it matters |\n| --- | --- | --- |\n| "alternatives to [competitor]" | Highest | The buyer has already rejected someone and is actively shopping |\n| "[you] vs [competitor]" | High | A shortlist exists and you are on it |\n| "is [you] worth it" / pricing | High | Late-stage validation, often the last check before a call |\n| "best [category] for [segment]" | Medium | Shortlist formation, where absence is most costly |\n| "what is [category]" | Low | Education, rarely decisive |\n\nMost AEO effort goes into the bottom row because it is the easiest to write about. The top three are where deals are won, and they are also where Reddit threads and third-party comparisons dominate the source material an assistant draws on.`,
      },
      {
        heading: 'What the work actually involves',
        content: `In the order it should be done, because each step makes the next one work better.\n\n1. **Establish the entity.** An assistant must resolve who you are before it will recommend you. Consistent naming, a complete Organization record, and profiles on the platforms models read. Nothing downstream compensates for skipping this — see [entity authority](/blog/entity-authority-ai-citation).\n2. **Find where the category is discussed.** For most SaaS categories, a meaningful share is Reddit: comparison threads, migration post-mortems, "we tried X for six months" write-ups. The method is in [Reddit marketing for AI search visibility](/blog/reddit-ai-visibility-guide).\n3. **Participate where you have real expertise.** Disclosed, specific, and useful whether or not someone buys. The durable citations come from answers that would stand without the product mention.\n4. **Publish the primary sources.** Threads and assistants both cite documentation, benchmarks and honest comparisons. If nothing of yours is worth linking, you depend on other people's summaries of you.\n5. **Measure the answer, not the impression.** Fix a query set, record every check including the zeroes, and compare per engine. [Measuring AI citation ROI](/blog/measure-ai-citation-roi) covers the attribution side.`,
      },
      {
        heading: 'How long does it take, and what should you expect?',
        content: `Honestly: slower than paid acquisition, and nobody can promise a citation by a date. What is controllable is how much good source material exists about you, and how consistently your entity resolves.\n\n• **Weeks 1-4.** Entity work and baseline measurement. The baseline is the part most teams skip and then regret, because without it no later number means anything.\n• **Months 2-3.** Participation compounds. Threads that rank keep being read, so early answers keep working.\n• **Months 3-6.** Assistants that re-crawl the open web begin reflecting it. Anything depending on training data rather than retrieval is outside anyone's control or schedule.\n\nA vendor promising a specific percentage increase by a specific month is making a claim about someone else's system. We wrote about how to test that claim in [how to evaluate AI visibility tools](/blog/best-ai-visibility-tools).`,
      },
      {
        heading: 'Doing it yourself versus handing it over',
        content: `The mechanical parts are worth automating and the judgement is not.\n\nWorth automating: finding threads that rank, tracking which questions get asked, monitoring whether assistants name you, and watching competitors' citation share.\n\nNot worth outsourcing: which threads you answer, what you claim, and whether to answer at all. Those need someone who genuinely knows what your product does and does not do, because a confidently wrong answer posted under your own name costs more than the placement was worth.\n\nIf you want the tooling and run the work yourself, that is what the plans on our [pricing page](/pricing) cover. If you would rather hand the whole programme over, [AEO management](/services/aeo-management) is the managed version.`,
      },
    ],
  },

  'startups': {
    title: 'AEO for Startups',
    tag: 'Startup Companies',
    description: 'AEO for early and growth-stage startups. Build category authority faster than competitors and establish your brand as the AI-recommended choice before you\'re a household name.',
    hero: 'AEO for <em>Fast-Growing Startups</em>',
    intro: 'Startups can\'t outspend incumbents on paid channels. But with the right AEO strategy, you can outrank them in AI answers, becoming the default recommendation even before you have brand recognition.',
    challenges: [
      { title: 'Limited Marketing Budget', desc: 'Every dollar needs to work hard. AEO delivers compounding returns far beyond what paid ads can match.' },
      { title: 'Weak Brand Recognition', desc: 'AI engines need signals to trust a new brand. We build those signals systematically across citations and entity data.' },
      { title: 'Fast-Moving Category Positioning', desc: 'Your category may not exist yet. We help you establish and own the category definition in AI answers.' },
      { title: 'Need for Rapid Growth', desc: 'You don\'t have years. Our 90-day sprint model gets you initial wins quickly while building toward long-term authority.' },
    ],
    approach: [
      'Category ownership strategy: be the brand AI engines default to for new or emerging categories.',
      'Fast-win citation placements in startup-focused media: TechCrunch, The Information, Hacker News, Indie Hackers.',
      'Founder-led content programs that leverage your unique perspective and technical depth.',
      'Lean but comprehensive schema and entity setup that competes with much larger brands.',
      'Aggressive competitive monitoring to spot and exploit gaps in incumbent coverage.',
    ],
    results: [
      { num: '+417%', label: 'Citation Growth for Emerging Categories' },
      { num: '3–4mo', label: 'To First Meaningful Wins' },
      { num: '+560%', label: 'AI-Sourced Lead Volume' },
    ],
    guide: [
      {
        heading: 'The startup problem is different: you have no entity yet',
        content: `An established company doing AEO is correcting how it is described. A startup is establishing that it exists at all. Those are different jobs and most AEO advice quietly assumes the first.\n\nWhen an assistant has no record of you, it does not name you tentatively. It does not name you. There is no partial credit, which is why startups often see zero citations for months while doing everything the guides say.`,
      },
      {
        heading: 'What to do before you have any authority',
        content: `Ranked for a company with no budget, no backlinks and no brand recognition.\n\n1. **Narrow the category until you can win it.** "Best project management tool" is unwinnable. "Project management for architecture firms" might not be. Assistants name three tools; be one of three in a small category rather than absent from a large one.\n2. **Use the founder as the entity.** Early on, a founder with a real track record is more resolvable than the company. A named person with a history is something a model can attach to.\n3. **Publish the thing only you know.** Your build decisions, your failure modes, your benchmarks. It is the one category of content a larger competitor cannot produce.\n4. **Answer questions in public, as yourself.** Disclosed, specific, useful without the product mention. The method is in [Reddit marketing for AI search visibility](/blog/reddit-ai-visibility-guide).\n5. **Get listed everywhere legitimate.** Directories, launch platforms, category round-ups. Each is corroboration you do not own, which is what you are short of.`,
      },
      {
        heading: 'What not to spend time on yet',
        content: `| Tactic | Why not yet |\n| --- | --- |\n| Wikidata entry | Notability bar you likely fail; a deleted entry is worse than none |\n| Broad category terms | Established vendors hold them and authority decides those |\n| High-volume content | Volume without entity resolution produces nothing |\n| Paid AI-visibility tooling | Measure manually first; the answer is probably zero, and you can confirm that for free |\n\nThe honest version: at pre-traction, most AEO spend is premature. The entity groundwork and public participation are free and they are what compounds.`,
      },
      {
        heading: 'How will you know it is working?',
        content: `Not by a dashboard number, which will read zero for a while and is uninformative while it does.\n\nEarlier signals: assistants describe you accurately when asked directly by name, rather than confusing you with something similar; your own threads and documentation start appearing in answers about the problem even when the brand is not named; a competitor comparison mentions you unprompted.\n\nThose precede category citations, usually by months. A fixed query set measured from the start is what lets you see the difference between "not yet" and "not working" — an [AI visibility audit](/services/ai-visibility-audit) establishes one.`,
      },
    ],
  },

  'tech-it': {
    title: 'AEO for Tech & IT Companies',
    tag: 'Tech & IT',
    description: 'AEO for cybersecurity, DevOps, cloud, and infrastructure companies. Get cited in the technical AI research queries that drive enterprise purchase decisions.',
    hero: 'AEO for <em>Tech & IT</em> Companies',
    intro: 'Technical buyers (CIOs, CISOs, platform engineers, DevOps leads) rely heavily on AI tools for research. We help tech and IT companies become the brand AI cites for high-intent technical queries.',
    challenges: [
      { title: 'Technical Buyer Complexity', desc: 'Your buyers ask detailed technical questions. Our content strategy answers those questions with real technical depth.' },
      { title: 'High-Stakes Evaluation', desc: 'Tech purchase decisions are high-risk. Citation placements in trusted technical publications carry enormous weight.' },
      { title: 'Compliance & Security Signals', desc: 'Buyers need to verify compliance and security credentials. We make these prominently cite-able by AI engines.' },
      { title: 'Long, Multi-Stakeholder Cycles', desc: 'Enterprise tech deals involve many evaluators. AEO ensures you\'re present for every stakeholder\'s AI research.' },
    ],
    approach: [
      'Technical authority building through original research, benchmarks, and security whitepapers.',
      'Citation placements in technical publications: Dark Reading, The Register, InfoWorld, DZone, CNCF blogs.',
      'Deep product documentation optimized for AI extraction: setup guides, architecture docs, integration references.',
      'Security and compliance schema markup (SOC 2, ISO 27001, GDPR) that AI engines can clearly identify.',
      'Monitoring of technical-specific queries and competitor positioning in enterprise AI research.',
    ],
    results: [
      { num: '+312%', label: 'Technical Query Citations' },
      { num: '+189%', label: 'Enterprise-Qualified Leads' },
      { num: '6–9mo', label: 'To Category Dominance' },
    ],
    guide: [
      {
        heading: 'Technical buyers ask different questions',
        content: `A CIO, a platform engineer and a security lead do not ask "what is the best X". They ask whether it integrates with what they already run, how it fails, what the compliance story is, and what it costs at their scale.\n\nThose questions have verifiable answers, which changes the work. Marketing language scores poorly here because the reader can check it. Specificity is not a stylistic preference in this segment; it is the qualification criterion.`,
      },
      {
        heading: 'The queries that matter for technical categories',
        content: `| Query shape | What the buyer is really asking |\n| --- | --- |\n| "[tool] vs [tool] for [scale]" | Will this survive our load |\n| "does [tool] support [standard]" | Can we deploy it without a fight |\n| "[tool] SOC 2 / HIPAA / ISO" | Will security block this |\n| "[tool] pricing at [N] seats" | What does it cost when it matters |\n| "migrating from [incumbent]" | How painful is the exit |\n\nEvery one has a factual answer, and most vendor sites answer none of them in extractable form. That is the gap: assistants cannot cite what is not written down.`,
      },
      {
        heading: 'Documentation is your citation surface',
        content: `In technical categories, public documentation usually outperforms the blog as a source, because it is specific, stable and structured.\n\n• **Publish the limits.** Rate limits, supported versions, known incompatibilities. Stating constraints plainly is both citable and credible.\n• **Write the migration guide.** From the incumbent, honestly, including where it is hard. It is the highest-intent document you can publish.\n• **Keep the compliance page factual.** Certifications, dates, scope. No adjectives.\n• **Version your changes.** A dated changelog is a freshness signal and an accuracy signal at once.`,
      },
      {
        heading: 'Where technical audiences actually discuss tools',
        content: `Less concentrated than consumer categories, and the venues carry different weight: Reddit for candid experience, Hacker News for architectural debate, Stack Overflow and GitHub issues for the specific failure modes, vendor-neutral docs for the comparisons.\n\nThe practical implication is that participation has to be genuinely expert. A technical thread rejects marketing language faster than any other venue, and being caught there costs more than the placement was worth. If your answer would not stand without the product mention, it will not survive the thread — let alone get cited.\n\nThe screening and reply standards are in [how we verify a Reddit thread](/blog/how-we-verify-reddit-threads).`,
      },
    ],
  },

  'software': {
    title: 'AEO for Software Companies',
    tag: 'Software Companies',
    description: 'AEO for software companies across every vertical. Whether you\'re building HR tech, fintech, edtech, or vertical SaaS, we help you dominate AI answers in your niche.',
    hero: 'AEO for <em>Software Companies</em>',
    intro: 'From vertical SaaS to horizontal platforms, software companies across every market face the same question: will AI engines recommend us when buyers ask? We make sure the answer is yes.',
    challenges: [
      { title: 'Vertical-Specific Buyer Language', desc: 'Every vertical has unique query patterns. We map and target the exact language your buyers use with AI assistants.' },
      { title: 'Specialized Industry Knowledge Requirements', desc: 'AI engines favor brands that demonstrate deep vertical expertise. We build that signal across citations and content.' },
      { title: 'Integration and Ecosystem Signals', desc: 'Your integrations matter in AI answers. We make sure every integration, partnership, and ecosystem relationship is cite-able.' },
      { title: 'Regulatory and Compliance Nuance', desc: 'Many software verticals have regulatory requirements. We help AI engines understand and surface your compliance posture.' },
    ],
    approach: [
      'Vertical-specific entity positioning that matches how buyers and analysts describe your category.',
      'Targeted citation campaigns in vertical publications, analyst reports, and industry association resources.',
      'Comparison and alternatives content for every major competitor your buyers evaluate.',
      'Industry-specific schema markup where applicable (Medical, Legal, FinancialProduct, EducationalOrganization).',
      'Dedicated monitoring of vertical-specific AI queries that generic AEO providers miss.',
    ],
    results: [
      { num: '+241%', label: 'Vertical-Specific AI Citations' },
      { num: '+130%', label: 'Demo Requests from AI Traffic' },
      { num: '4–8mo', label: 'To Vertical Category Leadership' },
    ],
    guide: [
      {
        heading: 'Your category is the thing being decided',
        content: `For software companies the hard part is rarely the product description. It is which category an assistant files you under, because that determines which questions you are eligible to appear in at all.\n\nA horizontal platform described in its own terms ("a workflow automation layer") competes in a category buyers do not search. The same product described as what it replaces competes in a category with real demand. Vertical software has the opposite risk: described too narrowly, it never surfaces for the broader question its buyers actually ask first.`,
      },
      {
        heading: 'Vertical and horizontal need opposite corrections',
        content: `| | Vertical software | Horizontal platform |\n| --- | --- | --- |\n| Usual failure | Category too narrow to have demand | Category too abstract to be searched |\n| The fix | Claim the broader problem, then qualify | Name the concrete job you replace |\n| Query to target | "[broad tool] for [your vertical]" | "alternatives to [the incumbent]" |\n| Proof that works | Depth in one industry's specifics | Migration and comparison material |\n\nGetting this wrong is not a content problem and more content will not fix it. It is a positioning statement that needs to be consistent across your site, your schema and every third-party listing.`,
      },
      {
        heading: 'Make the category claim machine-readable',
        content: `Assistants read structure, not just prose.\n\n• **A definitional sentence.** "X is a Y for Z" somewhere plain on the site. Most software sites open mid-pitch and never state it, which leaves the category to be inferred.\n• **Consistent description everywhere.** The same one sentence on your site, your Organization schema, and every directory listing. Five paraphrases read as five weak signals.\n• **Comparison material.** "X vs Y" and "alternatives to X" are where category membership gets confirmed, and they are query shapes with high purchase intent.\n• **Documentation worth citing.** Threads and assistants both cite docs. If yours are thin, other people's descriptions of you win by default.`,
      },
      {
        heading: 'Where the source material actually lives',
        content: `For software specifically, it is rarely your own blog. It is migration write-ups, comparison threads, and "we ran X for a year" posts — places where someone with no stake describes what your product was actually like.\n\nThat is why participation matters more than publication here: you cannot write the third-party account yourself, but you can answer honestly in the threads where it is being written. [Why ChatGPT cites Reddit threads](/blog/why-chatgpt-cites-reddit-threads) covers the retrieval side, and [entity authority](/blog/entity-authority-ai-citation) covers making sure the mentions attach to you.`,
      },
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(industries).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const industry = industries[params.slug]
  if (!industry) return {}
  return {
    title: industry.title,
    description: industry.description,
    alternates: { canonical: `https://www.aeorank.tech/industries/${params.slug}` },
    openGraph: {
      title: industry.title,
      description: industry.description,
      type: 'website',
      url: `https://www.aeorank.tech/industries/${params.slug}`,
      // Points at the generated card in app/opengraph-image.js. Declaring
      // openGraph here replaces the file-convention image, so it is named
      // explicitly. No content hash: that changes whenever the card does.
      images: ["/opengraph-image"],
    },
  }
}

export default function IndustryPage({ params }) {
  const industry = industries[params.slug]
  if (!industry) notFound()

  // The same Service as /services/*, aimed at an industry rather than sold
  // separately — so audience, not a distinct serviceType. These pages
  // previously carried BreadcrumbList and nothing else.
  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: industry.title,
    description: industry.description,
    provider: { '@id': 'https://www.aeorank.tech/#organization' },
    areaServed: 'Worldwide',
    serviceType: 'Answer Engine Optimization',
    audience: { '@type': 'Audience', audienceType: industry.tag },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.aeorank.tech' },
      { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://www.aeorank.tech/industries' },
      { '@type': 'ListItem', position: 3, name: industry.title, item: `https://www.aeorank.tech/industries/${params.slug}` },
    ],
  }

  // Strip the <em> tags from the hero so we can render the bracketed term
  // through the existing .accent class instead of via dangerouslySetInnerHTML.
  const heroHtml = industry.hero;

  return (
    <MarketingLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />

      <section className="section">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <span className="section-tag">( {industry.tag} )</span>
          <h1
            style={{ marginBottom: 18 }}
            dangerouslySetInnerHTML={{
              __html: heroHtml.replace(/<em>/g, '<span class="accent">').replace(/<\/em>/g, "</span>"),
            }}
          />
          <p className="section-sub">{industry.intro}</p>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/contact" className="btn btn-primary">
              Book a Free Audit →
            </Link>
            <Link href="/signup" className="btn btn-ghost">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-alt" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div className="container">
          <div
            className="stats-band-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              maxWidth: 820,
              margin: "0 auto",
            }}
          >
            {industry.results.map((r, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  padding: 20,
                  background: "var(--card)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: "var(--accent)",
                    letterSpacing: "-0.02em",
                    marginBottom: 6,
                  }}
                >
                  {r.num}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
                  {r.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <nav
            style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 32 }}
          >
            <Link href="/" style={{ color: "var(--text-muted)" }}>
              Home
            </Link>
            <span style={{ margin: "0 8px", opacity: 0.4 }}>/</span>
            <span style={{ color: "var(--text)" }}>{industry.title}</span>
          </nav>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span className="section-tag">( industry challenges )</span>
            <h2>
              Challenges we <span className="accent">solve</span>
            </h2>
          </div>
          <div
            className="two-col"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 16,
            }}
          >
            {industry.challenges.map((c, i) => (
              <div key={i} className="card">
                <h4
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 8,
                  }}
                >
                  {c.title}
                </h4>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-dim)",
                    lineHeight: 1.7,
                  }}
                >
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container-narrow">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span className="section-tag">( our approach )</span>
            <h2>
              How we <span className="accent">help</span>
            </h2>
          </div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {industry.approach.map((item, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "18px 0",
                  borderBottom: "1px solid var(--card-border)",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </span>
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--text)",
                    lineHeight: 1.75,
                    paddingTop: 4,
                  }}
                >
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <span className="section-tag">( ready to lead your category? )</span>
          <h2 style={{ marginBottom: 14 }}>
            Let's build your <span className="accent">AEO advantage</span>
          </h2>
          <p className="section-sub">
            Sign up and get an instant AI-visibility scan tailored to your
            site. You'll see exactly where you stand and what's possible.
          </p>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/signup" className="btn btn-primary">
              Get Started →
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .two-col { grid-template-columns: 1fr !important; }
          .stats-band-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* The SERP for "answer engine optimization for B2B SaaS" is 9/9
          long-form guides and 0 vendor landing pages. A 300-word benefits
          page is the wrong page type, not merely a thin one, so the guide
          sits inside the commercial page rather than replacing it. */}
      {industry.guide ? (
        <section className="section">
          <div className="container-narrow">
            {industry.guide.map((sec, i) => (
              <div key={i} style={{ marginBottom: 30 }}>
                <h2 style={{ fontSize: 24, lineHeight: 1.3, marginBottom: 14, textAlign: "left" }}>
                  {sec.heading}
                </h2>
                {sec.content.split("\n\n").map((b, j) => renderBlock(b, j))}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Commercial pages linked only to /, /contact, /signup and /services.
          Nothing pointed back into the blog, so the funnel ran one way and
          the posts that explain this service had no path in. */}
      {RELATED[params.slug] ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container-narrow">
            <h2 style={{ fontSize: 22, marginBottom: 16, textAlign: "left" }}>
              Read more on this
            </h2>
            <ul style={{ paddingLeft: 22, lineHeight: 1.9 }}>
              {RELATED[params.slug].map((r) => (
                <li key={r.slug}>
                  <Link href={`/blog/${r.slug}`} style={{ color: "var(--accent)" }}>
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </MarketingLayout>
  );
}
