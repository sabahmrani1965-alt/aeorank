import Link from 'next/link'

export const metadata = {
  title: 'Pricing',
  description: 'Transparent AEO pricing for B2B SaaS companies. From one-time audits to full-service monthly retainers.',
  alternates: { canonical: 'https://aeorank.tech/pricing' },
}

const plans = [
  {
    name: 'Starter', price: '$1,500', period: '/month', tag: 'Best for early-stage startups',
    desc: 'Get started with AEO fundamentals. Perfect for SaaS teams who want to establish their AI presence before scaling up.',
    features: ['AI visibility audit (monthly)', 'Entity optimization setup', 'Schema & structured data', 'Basic citation monitoring', '2× strategy calls/month', 'Monthly report'],
    cta: 'Get Started', highlight: false,
  },
  {
    name: 'Growth', price: '$3,500', period: '/month', tag: 'Recommended',
    desc: 'The full AEO program. Everything you need to dominate AI answers in your category and turn citations into pipeline.',
    features: ['Everything in Starter', 'Citation building (10/mo)', 'Answer-first content (4/mo)', 'Competitor benchmarking', 'Dedicated AEO strategist', 'Weekly reporting', 'Weekly strategy calls', 'Slack channel access'],
    cta: 'Start Growing', highlight: true,
  },
  {
    name: 'Scale', price: '$7,000', period: '/month', tag: 'For Series A+ companies',
    desc: 'Category domination. For companies ready to make AI the #1 acquisition channel and outrank every competitor in AI answers.',
    features: ['Everything in Growth', 'Citation building (25/mo)', 'Authority content (8/mo)', 'AI share-of-voice dashboard', 'Multi-platform optimization', 'PR & earned media outreach', 'Daily monitoring & alerts', 'Monthly exec review'],
    cta: 'Let\'s Scale', highlight: false,
  },
]

const addons = [
  { name: 'One-Time AEO Audit', price: '$500', desc: 'Full audit of your AI citation presence with competitor benchmark and action plan.' },
  { name: 'Entity Setup (one-time)', price: '$800', desc: 'Knowledge graph entity creation, Wikidata setup, and brand consistency audit.' },
  { name: 'Authority Content Pack', price: '$1,200', desc: '4 answer-first articles or comparison pages optimized for AI citation.' },
  { name: 'Schema Implementation', price: '$600', desc: 'Full structured data audit and implementation across your key pages.' },
]

const faqs = [
  { q: 'Is there a minimum contract length?', a: 'Two months to start, then month-to-month. The two-month minimum exists because AEO work genuinely needs that long to start showing signal — anything shorter and we\'d both be guessing. After month two, you can leave anytime.' },
  { q: 'When should I expect to see results?', a: 'Initial citation movement in 60–90 days if the baseline work is clean. Meaningful share-of-voice gains typically 4–6 months in. Anyone promising faster is selling you something. Entity work compounds — the longer you run it, the more it pays off.' },
  { q: 'Can I switch plans?', a: 'Yes, at the end of any billing month. Most clients move up (more ambitious goals), occasionally down (when in-house capability grows). No penalties either way.' },
  { q: 'Do you offer custom pricing?', a: 'For multi-product companies or complex enterprise scopes, yes. Book a call and we\'ll scope it honestly — sometimes custom pricing is just a higher number, and we\'ll tell you if that\'s the case.' },
  { q: 'What\'s in the free audit?', a: 'Live citation tests across ChatGPT, Perplexity, and Google AI on 30–50 of your top buyer queries, benchmarked against three competitors, with a prioritized list of what to fix first. Takes about 45 minutes to walk through. No obligation to buy anything after.' },
  { q: 'What if AEO isn\'t the right fit for us right now?', a: 'We\'ll tell you on the audit call. Some categories aren\'t mature enough in AI answers yet. Some companies should nail SEO basics first. We\'d rather send you away with good advice than sign a retainer we can\'t justify.' },
]

export default function Pricing() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <section className="page-hero">
        <div className="page-hero-glow" />
        <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <span className="badge">Transparent Pricing</span>
          <h1 className="section-title fade-up" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', marginBottom: '20px' }}>
            Simple, <em className="gold-text">Results-Driven</em> Pricing
          </h1>
          <p className="section-sub fade-up delay-1" style={{ margin: '0 auto' }}>
            No hidden fees. No long-term lock-ins. Just a clear investment in getting your brand cited by AI — and growing your pipeline.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="section" style={{ background: 'var(--navy2)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', alignItems: 'start' }} className="three-col">
            {plans.map((p, i) => (
              <div key={i} style={{
                background: p.highlight ? 'linear-gradient(180deg,rgba(242,168,59,0.08),rgba(242,168,59,0.03))' : 'var(--card)',
                border: p.highlight ? '1px solid rgba(242,168,59,0.4)' : '1px solid var(--border)',
                borderRadius: '14px', padding: '36px',
                position: 'relative', overflow: 'hidden',
              }}>
                {p.highlight && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,var(--gold),var(--gold2))' }} />}
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: p.highlight ? 'var(--gold)' : 'var(--muted)', marginBottom: '16px' }}>{p.tag}</div>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.6rem', color: '#fff', marginBottom: '8px', letterSpacing: '-0.03em' }}>{p.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                  <span style={{ fontFamily: 'Fraunces, serif', fontSize: '2.8rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em' }}>{p.price}</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 300 }}>{p.period}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300, marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>{p.desc}</p>
                <ul style={{ listStyle: 'none', marginBottom: '28px' }}>
                  {p.features.map(f => (
                    <li key={f} style={{ fontSize: '0.85rem', color: 'var(--text)', padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className={p.highlight ? 'btn-gold' : 'btn-ghost'} style={{ justifyContent: 'center', width: '100%', textAlign: 'center' }}>{p.cta} →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <span className="section-tag">One-Time Services</span>
            <h2 className="section-title">Add-Ons & <em className="gold-text">One-Time Packages</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }} className="four-col">
            {addons.map((a, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.04em', background: 'linear-gradient(135deg,#F2A83B,#FDE68A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px' }}>{a.price}</div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>{a.name}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.65, fontWeight: 300 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ background: 'var(--navy2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <span className="section-tag">Pricing FAQ</span>
            <h2 className="section-title">Common <em className="gold-text">Questions</em></h2>
          </div>
          <div style={{ maxWidth: '700px', margin: '52px auto 0', borderTop: '1px solid var(--border)' }}>
            {faqs.map((f, i) => (
              <div key={i} className="faq-item">
                <div style={{ padding: '22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{f.q}</h4>
                </div>
                <p style={{ paddingBottom: '22px', fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.78, fontWeight: 300 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <span className="section-tag" style={{ display: 'block', marginBottom: '16px' }}>Free First Step</span>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2rem,4vw,3rem)', color: '#fff', marginBottom: '16px', letterSpacing: '-0.03em' }}>
          Start with a <em className="gold-text">Free AEO Audit</em>
        </h2>
        <p style={{ color: 'var(--muted)', marginBottom: '32px', maxWidth: '460px', margin: '0 auto 32px', fontWeight: 300, lineHeight: 1.7 }}>
          Before you invest anything, see exactly where you stand. We'll audit your AI citation presence for free on our first call.
        </p>
        <Link href="/contact" className="btn-gold">Book Your Free Audit →</Link>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .three-col { grid-template-columns: 1fr !important; }
          .four-col { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 560px) {
          .four-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
