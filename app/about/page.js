import Link from 'next/link'

export const metadata = {
  title: 'About',
  description: 'Learn about AEOrank — the AEO agency helping B2B SaaS companies get cited by ChatGPT, Perplexity and Google AI.',
  alternates: { canonical: 'https://aeorank.tech/about' },
}

const values = [
  { icon: '🎯', title: 'Results First', desc: 'We measure success in citations, pipeline, and revenue — not vanity metrics. Every action we take is tied to a business outcome.' },
  { icon: '🔬', title: 'Research-Driven', desc: 'AEO is new. We stay ahead by running our own research, testing what actually works, and sharing what we learn.' },
  { icon: '🤝', title: 'Transparent', desc: 'You always know what we\'re doing and why. Weekly reports, honest updates, and no smoke-and-mirrors.' },
  { icon: '🚀', title: 'Founder-Led', desc: 'We work with founders and CMOs — not just marketing teams. We understand what it means to be accountable to growth targets.' },
]

const team = [
  { name: 'Ilyas', role: 'Founder & AEO Strategist', bio: 'Founder of AEOrank and SaaSOffers.tech. Building at the intersection of AI and B2B growth.', init: 'IL', color: 'linear-gradient(135deg,#F2A83B,#FBBF24)' },
]

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-glow" />
        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <span className="badge">About AEOrank</span>
          <h1 className="section-title fade-up" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', marginBottom: '20px' }}>
            We Help SaaS Brands Win <em className="gold-text">the AI Era</em>
          </h1>
          <p className="section-sub fade-up delay-1" style={{ margin: '0 auto' }}>
            AEOrank was built because we saw a massive shift happening — buyers were moving from Google to AI. Most SaaS companies had no strategy for it. We built one.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section" style={{ background: 'var(--navy2)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '72px', alignItems: 'center' }} className="two-col">
            <div>
              <span className="section-tag">Our Mission</span>
              <h2 className="section-title" style={{ marginBottom: '20px' }}>
                Make Every SaaS Brand <em className="gold-text">Visible to AI</em>
              </h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.78, fontWeight: 300, marginBottom: '20px' }}>
                AI answer engines are becoming the first stop for B2B buyers researching software. ChatGPT, Perplexity, and Google AI don't rank websites — they cite sources. If your brand isn't one of those sources, you're invisible at the moment of intent.
              </p>
              <p style={{ color: 'var(--muted)', lineHeight: 1.78, fontWeight: 300, marginBottom: '32px' }}>
                We exist to fix that. AEOrank gives B2B SaaS companies the strategy, execution, and infrastructure to become the brand AI recommends — consistently, credibly, and at scale.
              </p>
              <Link href="/contact" className="btn-gold">Work With Us →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[['50+','SaaS brands optimized'],['3×','Avg. citation increase'],['90%','Pipeline boost'],['4.9★','Client rating']].map(([n,l]) => (
                <div key={l} style={{ background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.04em', background: 'linear-gradient(135deg,#F2A83B,#FDE68A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px' }}>{n}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 300 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="section-tag">How We Work</span>
            <h2 className="section-title">Our <em className="gold-text">Values</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }} className="four-col">
            {values.map((v, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>{v.icon}</div>
                <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.1rem', color: '#fff', marginBottom: '10px' }}>{v.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.68, fontWeight: 300 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section" style={{ background: 'var(--navy2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="section-tag">The Team</span>
            <h2 className="section-title">Who's Behind <em className="gold-text">AEOrank</em></h2>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {team.map((t, i) => (
              <div key={i} className="card" style={{ maxWidth: '320px', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: '1.5rem', fontWeight: 700, color: '#06112A', margin: '0 auto 20px' }}>{t.init}</div>
                <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.2rem', color: '#fff', marginBottom: '6px' }}>{t.name}</h4>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold)', marginBottom: '14px', letterSpacing: '0.04em' }}>{t.role}</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.68, fontWeight: 300 }}>{t.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <span className="section-tag" style={{ display: 'block', marginBottom: '16px' }}>Let's Work Together</span>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2rem,4vw,3rem)', color: '#fff', marginBottom: '16px', letterSpacing: '-0.03em' }}>
          Ready to Get <em className="gold-text">Cited by AI?</em>
        </h2>
        <p style={{ color: 'var(--muted)', maxWidth: '420px', margin: '0 auto 32px', fontWeight: 300, lineHeight: 1.7 }}>Book a free strategy session and let's talk about what AEO can do for your business.</p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/contact" className="btn-gold">Book a Free AEO Session →</Link>
          <Link href="/case-studies" className="btn-ghost">See Our Results</Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .two-col { grid-template-columns: 1fr !important; }
          .four-col { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 560px) {
          .four-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
