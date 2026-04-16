'use client'
import Link from 'next/link'

export default function Home() {
  const pillars = [
    { num: '01', title: 'Entity Authority Building', desc: 'We establish your brand as a trusted, recognized entity across the knowledge graph — making AI engines confident enough to cite you.' },
    { num: '02', title: 'Answer Targeting & Intent Mapping', desc: 'We reverse-engineer what buyers ask AI tools at every funnel stage, then engineer content that directly answers those queries.' },
    { num: '03', title: 'Source & Citation Building', desc: 'We place your brand in high-authority publications that AI engines use as training sources and real-time citation references.' },
    { num: '04', title: 'Schema & Structured Data', desc: 'We implement advanced structured data so AI crawlers can parse, understand, and reliably surface your product information.' },
    { num: '05', title: 'AI Citation Monitoring', desc: 'We track where and how often AI engines cite your brand, score your share-of-voice, and optimize based on real data.' },
    { num: '06', title: 'Authority Content Strategy', desc: 'We build a content moat of guides, comparisons, and expert answers that positions you as the source AI wants to quote.' },
  ]

  const results = [
    { co: 'Cybersecurity SaaS · 9 months', v1: '+312%', l1: 'AI Citations', v2: '+189%', l2: 'AI-Sourced MQLs', title: 'From invisible to #1 cited brand', desc: 'Went from zero AI mentions to the most cited vendor across ChatGPT and Perplexity in 9 months.' },
    { co: 'DevOps Platform · 6 months', v1: '+241%', l1: 'AI Citations', v2: '+130%', l2: 'Demo Requests', title: 'Dominating AI answers in a crowded market', desc: 'Used our entity authority program to outrank larger competitors in Google AI Overviews and Bing Copilot.' },
    { co: 'IoT Analytics · 12 months', v1: '+417%', l1: 'AI Citations', v2: '+560%', l2: 'AI-Sourced Leads', title: 'Category leader in an emerging niche', desc: 'Became the default AI recommendation, driving a 5× increase in pipeline from AI-sourced traffic.' },
    { co: 'HR Tech SaaS · 8 months', v1: '+198%', l1: 'AI Citations', v2: '+95%', l2: 'Trial Sign-ups', title: 'Turning AI into a top acquisition channel', desc: 'AEO now accounts for 35% of all inbound pipeline — their fastest-growing acquisition channel.' },
  ]

  const testimonials = [
    { quote: 'Within 6 months, our brand started appearing in ChatGPT answers for our core use cases. Demos are up 130% from AI-sourced traffic alone.', name: 'Marcus Rivera', role: 'CMO · Stackwise', color: 'linear-gradient(135deg,#F2A83B,#FBBF24)', init: 'MR' },
    { quote: 'AEOrank understood the nuance of AEO better than anyone we evaluated. Their citation-building approach put us in front of buyers we\'d never have reached through traditional SEO.', name: 'Sophie Laurent', role: 'VP Marketing · Neuralify', color: 'linear-gradient(135deg,#a78bfa,#7c5cfc)', init: 'SL' },
    { quote: 'AI-sourced leads now convert 40% better than any other channel, and AEOrank got us there in under a year.', name: 'Alex Kim', role: 'CEO · Cloudpilot', color: 'linear-gradient(135deg,#34d399,#059669)', init: 'AK' },
  ]

  return (
    <>
      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '130px 24px 90px', position: 'relative', overflow: 'hidden', background: 'var(--navy)' }}>
        <div style={{ position: 'absolute', width: '700px', height: '700px', background: 'radial-gradient(circle,rgba(242,168,59,0.12) 0%,transparent 65%)', top: '-150px', left: '50%', transform: 'translateX(-50%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1px)', backgroundSize: '32px 32px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)' }} />

        <div className="badge fade-up">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
          ★★★★★ &nbsp;Rated 4.9 &nbsp;·&nbsp; 50+ B2B SaaS Clients
        </div>

        <h1 className="fade-up delay-1" style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(3rem,6.5vw,5.6rem)', lineHeight: 1.08, color: '#fff', maxWidth: '880px', marginBottom: '28px', letterSpacing: '-0.03em', position: 'relative' }}>
          Get Your SaaS Brand{' '}
          <em style={{ fontStyle: 'italic', fontWeight: 400, background: 'linear-gradient(135deg,#F2A83B,#FDE68A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Cited</em>
          <br />by ChatGPT, Perplexity & Google AI
        </h1>

        <p className="fade-up delay-2" style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '560px', marginBottom: '44px', fontWeight: 300, lineHeight: 1.78, position: 'relative' }}>
          Answer Engine Optimization services that put your product in front of high-intent buyers the moment they ask an AI. More citations. More pipeline. More revenue.
        </p>

        <div className="fade-up delay-3" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <Link href="/contact" className="btn-gold">Book a Free AEO Strategy Session →</Link>
          <Link href="/case-studies" className="btn-ghost">See Client Results</Link>
        </div>

        <div className="fade-up delay-4" style={{ marginTop: '80px', position: 'relative' }}>
          <p style={{ fontSize: '0.73rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 600 }}>Trusted by fast-growing SaaS companies</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            {['Dataform', 'Stackwise', 'Neuralify', 'Cloudpilot', 'Segmento'].map(l => (
              <span key={l} style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '1rem', color: 'rgba(255,255,255,0.2)' }}>{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-band">
        <div className="stats-grid">
          {[['3×','Avg. increase in AI citations'],['90%','Boost in AI-sourced pipeline'],['50+','SaaS brands optimized'],['4.9★','Average client rating']].map(([n,l]) => (
            <div key={n} className="stat-cell">
              <div className="stat-num">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PROGRAM */}
      <section className="section" style={{ background: 'var(--navy2)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start', marginBottom: '60px' }} className="two-col">
            <div>
              <span className="section-tag">The AEO Growth Program</span>
              <h2 className="section-title">How We Get Your SaaS<br /><em className="gold-text">Cited by AI Engines</em></h2>
            </div>
            <div style={{ paddingTop: '8px' }}>
              <p className="section-sub">Our AEO Growth Program is built on six proven pillars — creating a scalable, predictable process that gets your brand featured in AI-generated answers across ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot.</p>
              <Link href="/services" className="btn-ghost" style={{ marginTop: '24px', fontSize: '0.875rem', padding: '10px 20px' }}>Explore All Services →</Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }} className="pillars-grid">
            {pillars.map(p => (
              <div key={p.num} style={{ background: 'var(--navy)', padding: '32px 28px', transition: 'background 0.25s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#0d1e42'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--navy)'}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: 'rgba(242,168,59,0.2)', marginBottom: '16px', lineHeight: 1, letterSpacing: '-0.04em' }}>{p.num}</div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>{p.title}</h4>
                <p style={{ fontSize: '0.83rem', color: 'var(--muted)', lineHeight: 1.68, fontWeight: 300 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS PREVIEW */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '56px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-tag">AEO Success Stories</span>
              <h2 className="section-title">Real Results for <em className="gold-text">Real Companies</em></h2>
            </div>
            <Link href="/case-studies" className="btn-ghost" style={{ fontSize: '0.875rem', padding: '10px 20px' }}>View All Case Studies →</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '20px' }} className="two-col">
            {results.map((r, i) => (
              <div key={i} style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '36px', transition: 'all 0.25s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(242,168,59,0.25)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>{r.co}</div>
                <div style={{ display: 'flex', gap: '28px', padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', margin: '16px 0' }}>
                  {[[r.v1,r.l1],[r.v2,r.l2]].map(([v,l]) => (
                    <div key={l}>
                      <div style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', background: 'linear-gradient(135deg,#F2A83B,#FDE68A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{v}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--muted)', marginTop: '5px', fontWeight: 300 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.1rem', color: '#fff', marginBottom: '8px', letterSpacing: '-0.01em' }}>{r.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65, fontWeight: 300 }}>{r.desc}</p>
                <Link href="/case-studies" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gold)', fontSize: '0.83rem', fontWeight: 600, textDecoration: 'none', marginTop: '18px' }}>Read Case Study →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section" style={{ background: 'var(--navy2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="section-tag">Rated 4.9 Stars</span>
            <h2 className="section-title">Our Clients <em className="gold-text">Love</em> the Results</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }} className="three-col">
            {testimonials.map((t, i) => (
              <div key={i} className="card">
                <div style={{ color: 'var(--gold)', fontSize: '0.85rem', letterSpacing: '2px', marginBottom: '18px' }}>★★★★★</div>
                <blockquote style={{ fontFamily: 'Fraunces, serif', fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.78, marginBottom: '24px' }}>"{t.quote}"</blockquote>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '18px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#06112A', flexShrink: 0 }}>{t.init}</div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 300 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg,#0B1D3F,#0F2354,#0B1D3F)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle,rgba(242,168,59,0.09) 0%,transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto' }}>
          <span className="section-tag" style={{ display: 'block', marginBottom: '16px' }}>Start Today</span>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2.2rem,4.5vw,3.4rem)', color: '#fff', marginBottom: '20px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Book Your Free AEO<br /><em className="gold-text">Strategy Session</em>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '40px', fontWeight: 300, lineHeight: 1.78 }}>
            Our AEO experts will audit your AI citation presence live on the call and show you exactly how to get your brand cited by AI-powered buyers.
          </p>
          <Link href="/contact" className="btn-gold">Book a Free AEO Strategy Session →</Link>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '18px' }}>
            Not ready? <Link href="/pricing" style={{ color: 'var(--gold)', textDecoration: 'none' }}>View our pricing →</Link>
          </p>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .two-col { grid-template-columns: 1fr !important; gap: 32px !important; }
          .three-col { grid-template-columns: 1fr !important; }
          .pillars-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 560px) {
          .pillars-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
