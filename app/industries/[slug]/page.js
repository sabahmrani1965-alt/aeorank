import Link from 'next/link'
import { notFound } from 'next/navigation'

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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section className="page-hero">
        <div className="page-hero-glow" />
        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <span className="badge">{industry.tag}</span>
          <h1 className="section-title fade-up" style={{ fontSize: 'clamp(2.2rem,4.5vw,3.6rem)', marginBottom: '20px' }} dangerouslySetInnerHTML={{ __html: industry.hero }} />
          <p className="section-sub fade-up delay-1" style={{ margin: '0 auto' }}>{industry.intro}</p>
          <div className="fade-up delay-2" style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn-gold">Book a Free Audit →</Link>
            <Link href="/case-studies" className="btn-ghost">See Case Studies</Link>
          </div>
        </div>
      </section>

      <div className="stats-band">
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', maxWidth: '820px' }}>
          {industry.results.map((r, i) => (
            <div key={i} className="stat-cell">
              <div className="stat-num">{r.num}</div>
              <div className="stat-label">{r.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <nav style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '40px' }}>
            <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>
            <span style={{ color: 'var(--text)' }}>{industry.title}</span>
          </nav>

          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="section-tag">Industry Challenges</span>
            <h2 className="section-title">Challenges We <em className="gold-text">Solve</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '20px' }} className="two-col">
            {industry.challenges.map((c, i) => (
              <div key={i} className="card">
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '10px', fontFamily: 'Fraunces, serif', letterSpacing: '-0.01em' }}>{c.title}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--navy2)' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-tag">Our Approach</span>
            <h2 className="section-title">How We <em className="gold-text">Help</em></h2>
          </div>
          <ul style={{ listStyle: 'none' }}>
            {industry.approach.map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: '16px', padding: '20px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(242,168,59,0.12)', border: '1px solid rgba(242,168,59,0.3)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>{i + 1}</span>
                <p style={{ fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.75, fontWeight: 300, paddingTop: '4px' }}>{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg,#0B1D3F,#0F2354,#0B1D3F)', borderTop: '1px solid var(--border)', padding: '90px 24px', textAlign: 'center' }}>
        <span className="section-tag" style={{ display: 'block', marginBottom: '16px' }}>Ready to Lead Your Category?</span>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2rem,4vw,3rem)', color: '#fff', marginBottom: '16px', letterSpacing: '-0.03em' }}>
          Let's Build Your <em className="gold-text">AEO Advantage</em>
        </h2>
        <p style={{ color: 'var(--muted)', maxWidth: '460px', margin: '0 auto 32px', fontWeight: 300, lineHeight: 1.7 }}>
          Book a free AEO audit tailored to your industry. We'll show you exactly where you stand and what's possible.
        </p>
        <Link href="/contact" className="btn-gold">Book a Free Audit →</Link>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
