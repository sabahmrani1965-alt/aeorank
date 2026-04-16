import Link from 'next/link'

export const metadata = {
  title: 'Case Studies & Engagement Scenarios',
  description: 'How AEOrank approaches real AEO engagements for B2B SaaS companies. Scenarios, methodologies, and the questions we answer for every new client.',
  alternates: { canonical: 'https://aeorank.tech/case-studies' },
}

const scenarios = [
  {
    tag: 'Cybersecurity SaaS',
    situation: 'Ranks well on Google, invisible in ChatGPT',
    body: `A mid-market security vendor ranks on page one for their core keywords but cannot get cited by ChatGPT or Perplexity for queries like "best EDR tools for a mid-size team." Their buyers are researching with AI first. Their pipeline from organic is flat while category search volume is up.`,
    diagnosis: `The brand has strong on-site SEO but weak entity authority. The knowledge graph barely knows them. Third-party citations are thin — they\'re mentioned in two industry publications, versus 18+ for the incumbent they\'re trying to displace. AI engines have no reason to surface them.`,
    plan: [
      'Entity profile rebuild: knowledge panel, Wikidata draft, consistent brand data across every platform AI engines train on.',
      'Targeted citation campaign — 10–15 placements over 90 days in the specific security publications that regularly get cited by AI assistants.',
      'Answer-first content refresh on the 20 highest-intent category queries, restructured for AI extraction.',
      'Weekly citation tracking with share-of-voice benchmarking against the top three incumbents.',
    ],
    expected: 'By month 6, meaningful citation share in ChatGPT and Perplexity for core category queries. By month 12, competitive parity with category incumbents in AI-generated answers.',
  },

  {
    tag: 'DevOps Platform',
    situation: 'Outspent by incumbents, needs a different lever',
    body: `A DevOps platform competing against enterprise incumbents with 10× their marketing budget. They cannot outbid competitors on paid. They need organic channels that reward expertise over spend — and AEO is that channel.`,
    diagnosis: `Big enterprise incumbents often neglect AEO. They already have brand recognition, so they don\'t invest in entity authority work. That leaves an opening for smaller, more technical brands that execute well on AI citation — especially for specific, high-intent technical queries where incumbents give generic answers.`,
    plan: [
      'Gap analysis across 200 technical buyer queries to find the specific questions where incumbents have weak AI presence.',
      'Deep technical content at the bottom of the funnel: migration guides, architecture comparisons, tooling benchmarks.',
      'Placement in technical communities and publications that AI engines treat as authoritative sources.',
      'Developer-audience citation building in places like CNCF blogs, DZone, Dev.to, and specialized technical newsletters.',
    ],
    expected: 'Competitive AI citation rate for specific technical queries within 4–6 months, even against incumbents. This is the quickest-win profile for AEO work.',
  },

  {
    tag: 'Vertical SaaS',
    situation: 'New category, no definition yet',
    body: `A SaaS company defining a new category. The term doesn\'t exist in AI answers yet. Competitors are fragmented. First-mover advantage is real and shrinking — whoever establishes the category in AI minds owns the default recommendation.`,
    diagnosis: `Brand-new categories are AEO\'s biggest opportunity. AI engines are actively building their understanding of the space. Whichever brand shows up consistently as the authority now gets cemented as the reference point. Miss the window and you\'re fighting uphill forever.`,
    plan: [
      'Category ownership content: definitive guides, category frameworks, and comparison pages that define the space.',
      'PR and analyst outreach focused on establishing the category, not just the company.',
      'Original research and data reports that other publications will reference — the single highest-leverage citation-building move for new categories.',
      'Schema work that explicitly defines the category taxonomy for AI crawlers.',
    ],
    expected: 'Category-defining citation position in 6–9 months. These engagements compound the hardest because early entity work becomes the foundation AI engines keep citing.',
  },

  {
    tag: 'Product-Led SaaS',
    situation: 'Self-serve motion, AI is top-of-funnel',
    body: `A product-led SaaS company where most buyers sign up without ever talking to sales. Their marketing funnel starts and often ends with discovery — and AI answer engines are rapidly becoming the dominant discovery channel for their ICP.`,
    diagnosis: `PLG companies feel AEO shifts faster than most. When AI becomes the discovery layer, self-serve funnels either expand or contract depending on AI presence. These companies need to show up not just in consideration queries, but in "tools I can start using today" queries — and those require specific optimization.`,
    plan: [
      'Intent mapping across signup-adjacent queries ("best free [category] tool", "[category] with API", "quick [category] setup").',
      'Free-tier positioning throughout content so AI engines understand the self-serve motion.',
      'Integration and comparison content for every major platform in the buyer\'s existing stack.',
      'Continuous monitoring tied directly to signup attribution — AI-sourced traffic gets flagged in the CRM so the ROI picture is real.',
    ],
    expected: 'AI-sourced signup volume becoming a measurable channel within 3 months. PLG motion means AEO impact shows up in the funnel fastest.',
  },
]

export default function CaseStudies() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-glow" />
        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <span className="badge">Engagement Scenarios</span>
          <h1 className="section-title fade-up" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', marginBottom: '20px' }}>
            What We\'d Actually Do <em className="gold-text">For a Company Like Yours</em>
          </h1>
          <p className="section-sub fade-up delay-1" style={{ margin: '0 auto' }}>
            Most agency case studies are marketing fiction. Instead, here are the real scenarios we see most — the diagnosis, the plan, and what to expect. If one of these looks like your company, we can talk specifics.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '920px' }}>
          <div style={{ color: 'var(--text)', fontSize: '1rem', lineHeight: 1.8, fontWeight: 300, background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px 32px', marginBottom: '60px' }}>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>A note on this page</p>
            <p>
              AEOrank is a focused, early-stage agency. We\'re not going to pretend we have 50 signed logos to show you. What we do have is a clear, repeatable approach to AEO — and we\'d rather show you the actual thinking than lean on vanity claims. Below are the four engagement types we see most often. Yours probably looks like one of them.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {scenarios.map((s, i) => (
              <article key={i} style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(242,168,59,0.1)', border: '1px solid rgba(242,168,59,0.2)', padding: '4px 12px', borderRadius: '100px' }}>{s.tag}</span>
                </div>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(1.5rem,3vw,2rem)', color: '#fff', marginBottom: '20px', letterSpacing: '-0.025em', lineHeight: 1.25 }}>{s.situation}</h2>
                <p style={{ fontSize: '0.98rem', color: 'var(--text)', lineHeight: 1.8, fontWeight: 300, marginBottom: '28px' }}>{s.body}</p>

                <div style={{ borderLeft: '2px solid rgba(242,168,59,0.3)', paddingLeft: '20px', marginBottom: '28px' }}>
                  <h5 style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '10px' }}>The diagnosis</h5>
                  <p style={{ fontSize: '0.92rem', color: 'var(--muted)', lineHeight: 1.75, fontWeight: 300 }}>{s.diagnosis}</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h5 style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '14px' }}>What we\'d do</h5>
                  <ul style={{ listStyle: 'none' }}>
                    {s.plan.map((item, j) => (
                      <li key={j} style={{ display: 'flex', gap: '12px', padding: '10px 0', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--gold)', flexShrink: 0, fontSize: '0.85rem', marginTop: '4px' }}>•</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.7, fontWeight: 300 }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                  <h5 style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>Realistic expectation</h5>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.75, fontWeight: 300 }}>{s.expected}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '90px 24px', textAlign: 'center', background: 'var(--navy2)' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2rem,4vw,3rem)', color: '#fff', marginBottom: '16px', letterSpacing: '-0.03em' }}>
            Which one sounds like <em className="gold-text">your company?</em>
          </h2>
          <p style={{ color: 'var(--muted)', margin: '0 auto 32px', fontWeight: 300, lineHeight: 1.75 }}>
            Book a 45-minute call. We\'ll look at your specific category, run a live AI citation test on your top queries, and tell you honestly whether we think AEO is worth the investment for you right now.
          </p>
          <Link href="/contact" className="btn-gold">Book the Call →</Link>
        </div>
      </section>
    </>
  )
}
