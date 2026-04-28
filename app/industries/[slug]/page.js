import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";

const industries = {
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
  },

  'startups': {
    title: 'AEO for Startups',
    tag: 'Startup Companies',
    description: 'AEO for early and growth-stage startups. Build category authority faster than competitors and establish your brand as the AI-recommended choice before you\'re a household name.',
    hero: 'AEO for <em>Fast-Growing Startups</em>',
    intro: 'Startups can\'t outspend incumbents on paid channels. But with the right AEO strategy, you can outrank them in AI answers — becoming the default recommendation even before you have brand recognition.',
    challenges: [
      { title: 'Limited Marketing Budget', desc: 'Every dollar needs to work hard. AEO delivers compounding returns far beyond what paid ads can match.' },
      { title: 'Weak Brand Recognition', desc: 'AI engines need signals to trust a new brand. We build those signals systematically across citations and entity data.' },
      { title: 'Fast-Moving Category Positioning', desc: 'Your category may not exist yet. We help you establish and own the category definition in AI answers.' },
      { title: 'Need for Rapid Growth', desc: 'You don\'t have years. Our 90-day sprint model gets you initial wins quickly while building toward long-term authority.' },
    ],
    approach: [
      'Category ownership strategy — be the brand AI engines default to for new or emerging categories.',
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
  },

  'tech-it': {
    title: 'AEO for Tech & IT Companies',
    tag: 'Tech & IT',
    description: 'AEO for cybersecurity, DevOps, cloud, and infrastructure companies. Get cited in the technical AI research queries that drive enterprise purchase decisions.',
    hero: 'AEO for <em>Tech & IT</em> Companies',
    intro: 'Technical buyers — CIOs, CISOs, platform engineers, DevOps leads — rely heavily on AI tools for research. We help tech and IT companies become the brand AI cites for high-intent technical queries.',
    challenges: [
      { title: 'Technical Buyer Complexity', desc: 'Your buyers ask detailed technical questions. Our content strategy answers those questions with real technical depth.' },
      { title: 'High-Stakes Evaluation', desc: 'Tech purchase decisions are high-risk. Citation placements in trusted technical publications carry enormous weight.' },
      { title: 'Compliance & Security Signals', desc: 'Buyers need to verify compliance and security credentials. We make these prominently cite-able by AI engines.' },
      { title: 'Long, Multi-Stakeholder Cycles', desc: 'Enterprise tech deals involve many evaluators. AEO ensures you\'re present for every stakeholder\'s AI research.' },
    ],
    approach: [
      'Technical authority building through original research, benchmarks, and security whitepapers.',
      'Citation placements in technical publications: Dark Reading, The Register, InfoWorld, DZone, CNCF blogs.',
      'Deep product documentation optimized for AI extraction — setup guides, architecture docs, integration references.',
      'Security and compliance schema markup (SOC 2, ISO 27001, GDPR) that AI engines can clearly identify.',
      'Monitoring of technical-specific queries and competitor positioning in enterprise AI research.',
    ],
    results: [
      { num: '+312%', label: 'Technical Query Citations' },
      { num: '+189%', label: 'Enterprise-Qualified Leads' },
      { num: '6–9mo', label: 'To Category Dominance' },
    ],
  },

  'software': {
    title: 'AEO for Software Companies',
    tag: 'Software Companies',
    description: 'AEO for software companies across every vertical. Whether you\'re building HR tech, fintech, edtech, or vertical SaaS — we help you dominate AI answers in your niche.',
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
    alternates: { canonical: `https://aeorank.tech/industries/${params.slug}` },
    openGraph: {
      title: industry.title,
      description: industry.description,
      type: 'website',
      url: `https://aeorank.tech/industries/${params.slug}`,
    },
  }
}

export default function IndustryPage({ params }) {
  const industry = industries[params.slug]
  if (!industry) notFound()

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aeorank.tech' },
      { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://aeorank.tech' },
      { '@type': 'ListItem', position: 3, name: industry.title, item: `https://aeorank.tech/industries/${params.slug}` },
    ],
  }

  // Strip the <em> tags from the hero so we can render the bracketed term
  // through the existing .accent class instead of via dangerouslySetInnerHTML.
  const heroHtml = industry.hero;

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="section">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <span className="section-tag">( {industry.tag} )</span>
          <h2
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
            <Link href="/" className="btn btn-ghost">
              Run a Free Report
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
            Run a free AEOrank report tailored to your URL. You'll see exactly
            where you stand and what's possible — no commitment.
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
            <Link href="/" className="btn btn-primary">
              Run a Free Report →
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
      <Footer />
    </>
  );
}
