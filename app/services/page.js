import Link from 'next/link'

export const metadata = { title: 'Services', description: 'Full-stack AEO services for B2B SaaS companies. Entity optimization, citation building, schema, content strategy and more.' }

const services = [
  { icon: '🧠', title: 'AEO Management', price: 'From $3,000/mo', desc: 'Full-service AEO management. We handle everything — strategy, execution, monitoring, and reporting. You focus on closing deals.', features: ['Monthly citation audits', 'Entity authority building', 'Citation source placement', 'Weekly reporting dashboard', 'Dedicated AEO strategist'] },
  { icon: '🎯', title: 'AEO Consulting', price: 'From $1,500/mo', desc: 'Expert guidance without full management. We audit, strategize, and advise — your team executes.', features: ['AI visibility audit', 'AEO strategy roadmap', 'Monthly strategy calls', 'Competitor analysis', 'Actionable recommendations'] },
  { icon: '🔗', title: 'Citation Building', price: 'From $1,000/mo', desc: 'We secure high-quality placements in the publications, forums, and directories that AI engines trust most.', features: ['Publication outreach', 'Forum & Reddit presence', 'Directory submissions', 'PR & earned media', 'Backlink + citation synergy'] },
  { icon: '⚙️', title: 'Entity Optimization', price: 'From $800 one-time', desc: 'We establish your brand as a recognized entity across the knowledge graph so AI confidently cites you.', features: ['Knowledge panel setup', 'Wikidata entity creation', 'Schema markup implementation', 'Brand mention audit', 'Entity consistency check'] },
  { icon: '📊', title: 'AI Visibility Audit', price: '$500 one-time', desc: 'A deep-dive audit of where your brand stands in AI-generated answers across ChatGPT, Perplexity, and Google AI.', features: ['Citation share-of-voice report', 'Competitor benchmark', 'Gap analysis', 'Priority action plan', '60-minute strategy debrief'] },
  { icon: '✍️', title: 'Authority Content', price: 'From $2,000/mo', desc: 'We build the content AI wants to cite — guides, comparisons, expert Q&As, and answer-first pages.', features: ['Answer-first content briefs', 'AI-optimized articles', 'Comparison & roundup pages', 'Expert Q&A formats', 'Content gap analysis'] },
]

const who = [
  { icon: '🚀', title: 'SaaS Companies', desc: 'Get cited when prospects compare your category. Dominate ChatGPT and Perplexity answers for your key use cases.' },
  { icon: '⚡', title: 'SaaS Startups', desc: 'Build AI visibility from day one. AEO gives startups an unfair advantage over established players.' },
  { icon: '💻', title: 'Technology & IT', desc: 'Technical buyers increasingly use AI for research. Make sure your solutions appear for high-intent queries.' },
  { icon: '🏗️', title: 'Software Companies', desc: 'From developer tools to enterprise platforms — drive AI citations that convert to demos and sign-ups.' },
]

export default function Services() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-glow" />
        <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <span className="badge">AEO Services</span>
          <h1 className="section-title fade-up" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', marginBottom: '20px' }}>
            Everything You Need to <em className="gold-text">Rank in AI</em>
          </h1>
          <p className="section-sub fade-up delay-1" style={{ margin: '0 auto 36px', textAlign: 'center' }}>
            From one-time audits to full-service AEO management — every service we offer is built to get your brand cited by AI engines and drive real pipeline.
          </p>
          <Link href="/contact" className="btn-gold fade-up delay-2">Get a Free AEO Audit →</Link>
        </div>
      </section>

      <div className="stats-band">
        <div className="stats-grid">
          {[['3×','Avg. AI citation increase'],['90%','Pipeline boost from AI'],['50+','SaaS brands optimized'],['4.9★','Client satisfaction']].map(([n,l]) => (
            <div key={n} className="stat-cell"><div className="stat-num">{n}</div><div className="stat-label">{l}</div></div>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="section-tag">What We Offer</span>
            <h2 className="section-title">Our <em className="gold-text">AEO Services</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }} className="three-col">
            {services.map((s, i) => (
              <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: 48, height: 48, borderRadius: '10px', background: 'rgba(242,168,59,0.1)', border: '1px solid rgba(242,168,59,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '16px' }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.2rem', color: '#fff', marginBottom: '6px', letterSpacing: '-0.02em' }}>{s.title}</h3>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '12px', letterSpacing: '0.04em' }}>{s.price}</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300, marginBottom: '20px', flex: 1 }}>{s.desc}</p>
                <ul style={{ listStyle: 'none', marginBottom: '24px' }}>
                  {s.features.map(f => (
                    <li key={f} style={{ fontSize: '0.82rem', color: 'var(--text)', padding: '6px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className="btn-ghost" style={{ fontSize: '0.85rem', padding: '10px 20px', justifyContent: 'center' }}>Get Started →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Work With */}
      <section className="section" style={{ background: 'var(--navy2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="section-tag">Who We Work With</span>
            <h2 className="section-title">Built for <em className="gold-text">B2B SaaS</em> Companies</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '20px' }} className="two-col">
            {who.map((w, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ width: 48, height: 48, borderRadius: '10px', background: 'rgba(242,168,59,0.1)', border: '1px solid rgba(242,168,59,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{w.icon}</div>
                <div>
                  <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.15rem', color: '#fff', marginBottom: '8px' }}>{w.title}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300 }}>{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg,#0B1D3F,#0F2354,#0B1D3F)', padding: '80px 24px', textAlign: 'center' }}>
        <span className="section-tag" style={{ display: 'block', marginBottom: '16px' }}>Not Sure Where to Start?</span>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', color: '#fff', marginBottom: '16px', letterSpacing: '-0.03em' }}>
          Start with a Free <em className="gold-text">AEO Audit</em>
        </h2>
        <p style={{ color: 'var(--muted)', marginBottom: '32px', maxWidth: '460px', margin: '0 auto 32px', fontWeight: 300 }}>
          We'll audit your AI citation presence for free and recommend the right service mix for your goals.
        </p>
        <Link href="/contact" className="btn-gold">Book a Free AEO Audit →</Link>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .three-col { grid-template-columns: 1fr !important; }
          .two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
