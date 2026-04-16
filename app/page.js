'use client'
import Link from 'next/link'

export default function Home() {
  const pillars = [
    { num: '01', title: 'Entity Authority', desc: 'Most brands are invisible to AI engines because they don\'t exist as recognized entities. We fix that — knowledge graph, Wikidata, structured data, the works.' },
    { num: '02', title: 'Query Research', desc: 'We map the exact questions your buyers type into ChatGPT, then reverse-engineer what makes an AI pick one source over another.' },
    { num: '03', title: 'Citation Placement', desc: 'We earn mentions in the publications AI engines actually pull from. Not link farms. Not guest-post factories. Real sources.' },
    { num: '04', title: 'Schema & Structured Data', desc: 'Your pages need to tell AI crawlers what they are, not just what they say. We implement the schema that makes your content machine-readable.' },
    { num: '05', title: 'Measurement', desc: 'Weekly citation checks across ChatGPT, Perplexity, Google AI, Bing Copilot. Tracked against competitors. Tied to pipeline, not vanity metrics.' },
    { num: '06', title: 'Content Infrastructure', desc: 'Answer-first pages built around high-intent queries. Not SEO fluff. Not listicles. The kind of content AI engines quote verbatim.' },
  ]

  const signals = [
    'You rank well on Google but buyers say they found you somewhere else',
    'Your competitors keep showing up in ChatGPT answers and you don\'t',
    'Sales reps are getting questions that prove buyers researched with AI first',
    'Your branded search volume is flat but your category is exploding',
    'Pipeline from organic is declining even though rankings haven\'t moved',
  ]

  return (
    <>
      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '130px 24px 90px', position: 'relative', overflow: 'hidden', background: 'var(--navy)' }}>
        <div style={{ position: 'absolute', width: '700px', height: '700px', background: 'radial-gradient(circle,rgba(242,168,59,0.12) 0%,transparent 65%)', top: '-150px', left: '50%', transform: 'translateX(-50%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1px)', backgroundSize: '32px 32px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)' }} />

        <div className="badge fade-up">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
          Answer Engine Optimization for B2B SaaS
        </div>

        <h1 className="fade-up delay-1" style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(3rem,6.5vw,5.6rem)', lineHeight: 1.08, color: '#fff', maxWidth: '880px', marginBottom: '28px', letterSpacing: '-0.03em', position: 'relative' }}>
          When a buyer asks AI about your category,{' '}
          <em style={{ fontStyle: 'italic', fontWeight: 400, background: 'linear-gradient(135deg,#F2A83B,#FDE68A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>is your brand the answer?</em>
        </h1>

        <p className="fade-up delay-2" style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '580px', marginBottom: '44px', fontWeight: 300, lineHeight: 1.78, position: 'relative' }}>
          Your next 100 buyers won\'t type into Google first. They\'ll ask ChatGPT. Or Perplexity. Or Google AI Overviews. AEOrank gets your SaaS brand cited by every major AI engine — so you\'re the name that shows up when it matters.
        </p>

        <div className="fade-up delay-3" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <Link href="/contact" className="btn-gold">Get a Free AI Visibility Audit →</Link>
          <Link href="/services" className="btn-ghost">See How It Works</Link>
        </div>

        <div className="fade-up delay-4" style={{ marginTop: '80px', position: 'relative', maxWidth: '680px' }}>
          <p style={{ fontSize: '0.73rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 600 }}>We optimize for every AI engine that matters</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
            {['ChatGPT', 'Perplexity', 'Google AI', 'Bing Copilot', 'Claude'].map(l => (
              <span key={l} style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: '1.05rem', color: 'rgba(255,255,255,0.35)' }}>{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION — replaces fake stats band */}
      <section className="section" style={{ background: 'var(--navy2)' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <span className="section-tag">Why This Matters Now</span>
            <h2 className="section-title">The Search Layer <em className="gold-text">Changed</em></h2>
          </div>

          <div style={{ color: 'var(--text)', fontSize: '1.05rem', lineHeight: 1.85, fontWeight: 300, marginBottom: '32px' }}>
            <p style={{ marginBottom: '20px' }}>
              SEO still works — but it\'s solving a shrinking problem. When your buyer opens ChatGPT and asks &quot;what\'s the best [your category] tool for a 50-person team&quot;, Google isn\'t in the conversation. You are, or you aren\'t.
            </p>
            <p style={{ marginBottom: '20px' }}>
              The brands showing up in AI answers right now aren\'t always the biggest. They\'re the ones that did the entity work early. That\'s a window that closes fast.
            </p>
            <p style={{ fontWeight: 500, color: '#fff' }}>
              You probably need AEO if any of this sounds familiar:
            </p>
          </div>

          <ul style={{ listStyle: 'none', borderTop: '1px solid var(--border)' }}>
            {signals.map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: '14px', padding: '18px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--gold)', flexShrink: 0, fontSize: '0.85rem', marginTop: '3px' }}>→</span>
                <span style={{ color: 'var(--text)', fontSize: '0.96rem', lineHeight: 1.7, fontWeight: 300 }}>{s}</span>
              </li>
            ))}
          </ul>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/contact" className="btn-ghost">Find out where you stand — free audit</Link>
          </div>
        </div>
      </section>

      {/* PROGRAM */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start', marginBottom: '60px' }} className="two-col">
            <div>
              <span className="section-tag">What We Actually Do</span>
              <h2 className="section-title">Six Levers That <em className="gold-text">Move Citations</em></h2>
            </div>
            <div style={{ paddingTop: '8px' }}>
              <p className="section-sub">
                AEO is a new discipline, but it isn\'t mysterious. There are a handful of things that genuinely change how AI engines treat your brand — and a lot of things that don\'t. We focus on the six that do.
              </p>
              <Link href="/services" className="btn-ghost" style={{ marginTop: '24px', fontSize: '0.875rem', padding: '10px 20px' }}>See full services →</Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }} className="pillars-grid">
            {pillars.map(p => (
              <div key={p.num} style={{ background: 'var(--navy)', padding: '32px 28px', transition: 'background 0.25s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#0d1e42'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--navy)'}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 700, color: 'rgba(242,168,59,0.2)', marginBottom: '16px', lineHeight: 1, letterSpacing: '-0.04em' }}>{p.num}</div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>{p.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.68, fontWeight: 300 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW WE ENGAGE */}
      <section className="section" style={{ background: 'var(--navy2)' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-tag">The Engagement</span>
            <h2 className="section-title">What Working With Us <em className="gold-text">Actually Looks Like</em></h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '24px', marginBottom: '32px', alignItems: 'start' }} className="engage-row">
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '3rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.04em', lineHeight: 1 }}>Week 1</div>
            <div>
              <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '10px', fontFamily: 'Fraunces, serif' }}>Audit and baseline</h4>
              <p style={{ color: 'var(--muted)', lineHeight: 1.75, fontWeight: 300 }}>
                We run live citation tests across every major AI engine for the 100+ queries that matter most to your pipeline. You get a brutally honest picture of where you stand versus competitors.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '24px', marginBottom: '32px', alignItems: 'start' }} className="engage-row">
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '3rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.04em', lineHeight: 1 }}>Month 1</div>
            <div>
              <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '10px', fontFamily: 'Fraunces, serif' }}>Foundation work</h4>
              <p style={{ color: 'var(--muted)', lineHeight: 1.75, fontWeight: 300 }}>
                Entity setup, knowledge graph optimization, full schema implementation, and the first wave of answer-first content. Unglamorous, foundational, and the thing most agencies skip.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '24px', marginBottom: '32px', alignItems: 'start' }} className="engage-row">
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '3rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.04em', lineHeight: 1 }}>Month 2–3</div>
            <div>
              <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '10px', fontFamily: 'Fraunces, serif' }}>Citation campaigns</h4>
              <p style={{ color: 'var(--muted)', lineHeight: 1.75, fontWeight: 300 }}>
                Targeted outreach to the publications, directories, and analyst sources that AI engines actually pull from. Earned placements, not pay-to-play listings.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '24px', alignItems: 'start' }} className="engage-row">
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '3rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.04em', lineHeight: 1 }}>Ongoing</div>
            <div>
              <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '10px', fontFamily: 'Fraunces, serif' }}>Compound work</h4>
              <p style={{ color: 'var(--muted)', lineHeight: 1.75, fontWeight: 300 }}>
                Weekly citation monitoring, monthly competitor gap analysis, and continuous content refinement. AEO isn\'t a project — it\'s a position you defend.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg,#0B1D3F,#0F2354,#0B1D3F)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle,rgba(242,168,59,0.09) 0%,transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2.2rem,4.5vw,3.4rem)', color: '#fff', marginBottom: '20px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            See where you stand in <em className="gold-text">AI answers</em>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', marginBottom: '40px', fontWeight: 300, lineHeight: 1.78 }}>
            The audit takes 45 minutes. We run live citation tests on your top buyer queries and show you exactly what buyers see when they ask AI about your category. No pitch. No obligation.
          </p>
          <Link href="/contact" className="btn-gold">Book the Audit →</Link>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '18px' }}>
            Or <Link href="/pricing" style={{ color: 'var(--gold)', textDecoration: 'none' }}>see pricing first</Link>
          </p>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .two-col { grid-template-columns: 1fr !important; gap: 32px !important; }
          .three-col { grid-template-columns: 1fr !important; }
          .pillars-grid { grid-template-columns: repeat(2,1fr) !important; }
          .engage-row { grid-template-columns: 1fr !important; gap: 8px !important; }
        }
        @media (max-width: 560px) {
          .pillars-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
