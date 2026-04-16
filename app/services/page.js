import Link from 'next/link'

export const metadata = {
  title: 'Services',
  description: 'AEO services for B2B SaaS: entity authority, citation building, schema, content, and full-service management. Priced transparently. Built around the work that actually moves AI citations.',
  alternates: { canonical: 'https://aeorank.tech/services' },
}

const services = [
  { icon: '🧠', title: 'AEO Management', slug: 'aeo-management', price: 'From $3,000/mo', blurb: 'Full-service. We run the whole program — strategy, execution, monitoring — with a senior AEO strategist owning your account.', bullets: ['Monthly citation audits', 'Entity work, citation outreach, content', 'Weekly reporting, monthly reviews', 'Dedicated strategist'] },
  { icon: '🎯', title: 'AEO Consulting', slug: 'aeo-consulting', price: 'From $1,500/mo', blurb: 'For teams with strong in-house marketers. We bring the strategy and frameworks; your team executes with our guidance.', bullets: ['Audit + 12-month roadmap', 'Team training on AEO', 'Monthly strategy calls', 'Quarterly reviews'] },
  { icon: '🔗', title: 'Citation Building', slug: 'citation-building', price: 'From $1,000/mo', blurb: 'Earned mentions in the specific publications, directories, and analyst sources AI engines actually pull from. Not paid links.', bullets: ['Publication placements', 'G2, Capterra, TrustRadius work', 'Analyst relationships', 'Citation monitoring'] },
  { icon: '⚙️', title: 'Entity Optimization', slug: 'entity-optimization', price: 'From $800 one-time', blurb: 'The unsexy foundational work most brands skip. Knowledge graph, Wikidata, schema, consistency across every platform that feeds AI training data.', bullets: ['Knowledge panel optimization', 'Wikidata setup', 'Organization + Product schema', 'Entity consistency audit'] },
  { icon: '📊', title: 'AI Visibility Audit', slug: 'ai-visibility-audit', price: '$500 one-time', blurb: 'A real diagnostic. We test 100+ of your buyer queries live across every major AI engine and tell you where you stand versus competitors.', bullets: ['100+ query live tests', 'Share-of-voice benchmarking', 'Gap analysis', '60-minute debrief call'] },
  { icon: '✍️', title: 'Authority Content', slug: 'aeo-management', price: 'From $2,000/mo', blurb: 'Answer-first content that AI engines actually cite. Built around specific buyer questions, not keyword targeting.', bullets: ['Query research', 'Answer-first page builds', 'Comparison content', 'Expert Q&A formats'] },
]

export default function Services() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-glow" />
        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <span className="badge">AEO Services</span>
          <h1 className="section-title fade-up" style={{ fontSize: 'clamp(2.4rem,5vw,3.8rem)', marginBottom: '20px' }}>
            Six services. One goal: <em className="gold-text">get you cited.</em>
          </h1>
          <p className="section-sub fade-up delay-1" style={{ margin: '0 auto 36px' }}>
            Every service below is built around something that actually moves AI citations. No fluff retainers, no "content strategy" that\'s just a blog calendar. Pick what you need or let us recommend the mix on an audit call.
          </p>
          <Link href="/contact" className="btn-gold fade-up delay-2">Start with a Free Audit →</Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }} className="three-col">
            {services.map((s, i) => (
              <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: 48, height: 48, borderRadius: '10px', background: 'rgba(242,168,59,0.1)', border: '1px solid rgba(242,168,59,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '16px' }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.2rem', color: '#fff', marginBottom: '6px', letterSpacing: '-0.02em' }}>{s.title}</h3>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '12px', letterSpacing: '0.04em' }}>{s.price}</div>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300, marginBottom: '18px', flex: 1 }}>{s.blurb}</p>
                <ul style={{ listStyle: 'none', marginBottom: '22px' }}>
                  {s.bullets.map(f => (
                    <li key={f} style={{ fontSize: '0.82rem', color: 'var(--text)', padding: '6px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/services/${s.slug}`} className="btn-ghost" style={{ fontSize: '0.85rem', padding: '10px 20px', justifyContent: 'center' }}>Learn more →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--navy2)' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span className="section-tag">How to Choose</span>
            <h2 className="section-title">Not sure what you need?</h2>
          </div>

          <div style={{ color: 'var(--text)', fontSize: '1rem', lineHeight: 1.8, fontWeight: 300 }}>
            <p style={{ marginBottom: '20px' }}>
              Most new engagements start with the <strong style={{ color: '#fff' }}>AI Visibility Audit</strong>. It\'s a flat $500, it takes about two weeks, and you get back a real diagnostic of where you stand — not a sales deck dressed as an audit. About half of audit clients then decide AEO management makes sense. The other half don\'t, and we\'re fine with that.
            </p>
            <p style={{ marginBottom: '20px' }}>
              If you already know you want to move on AEO and have the budget for it, <strong style={{ color: '#fff' }}>AEO Management</strong> is the fastest path. Senior strategist, full execution, monthly reviews. This is where most of our best work happens.
            </p>
            <p style={{ marginBottom: '20px' }}>
              If you have a capable in-house marketing team, <strong style={{ color: '#fff' }}>AEO Consulting</strong> often gives better ROI. We provide the strategy and frameworks; your team executes. You save money and build internal AEO capability.
            </p>
            <p style={{ marginBottom: '32px' }}>
              The one-off services (<strong style={{ color: '#fff' }}>Entity Optimization</strong>, <strong style={{ color: '#fff' }}>Citation Building</strong>) are usually for companies that want to tackle a specific weakness without committing to a full program. Legitimate, but rarely as high-leverage as doing the work together.
            </p>
            <div style={{ textAlign: 'center', padding: '28px', borderTop: '1px solid var(--border)' }}>
              <Link href="/contact" className="btn-gold">Book a Call to Talk It Through →</Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .three-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
