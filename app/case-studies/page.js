import Link from 'next/link'

export const metadata = { title: 'Case Studies', description: 'Real AEO results for real SaaS companies. See how AEOrank helped B2B SaaS brands get cited by ChatGPT, Perplexity and Google AI.' }

const cases = [
  { tag: 'Cybersecurity SaaS', duration: '9 months', title: 'From Invisible to #1 Cited Brand in Category', summary: 'A cybersecurity SaaS had zero presence in AI-generated answers despite strong Google SEO. Within 9 months of our AEO program, they became the most cited vendor across ChatGPT and Perplexity for their core category queries.', challenge: 'The company ranked well on Google but was completely absent from AI answers. Their competitors were being cited regularly, and buyers were increasingly using ChatGPT to research security tools before ever visiting a website.', solution: 'We built a comprehensive entity authority profile, secured citations in 40+ security-focused publications, implemented answer-first content for the top 25 buyer questions, and deployed full schema coverage across product pages.', m1: '+312%', l1: 'AI Citations', m2: '+189%', l2: 'MQLs from AI', m3: '9mo', l3: 'Timeline' },
  { tag: 'DevOps Platform', duration: '6 months', title: 'Dominating AI Answers in a Crowded Market', summary: 'A DevOps platform used our entity authority program to outrank larger, better-funded competitors in Google AI Overviews and Bing Copilot responses — at a fraction of their marketing spend.', challenge: 'Competing against enterprise vendors with 10× the marketing budget. AI engines were defaulting to well-known brands, even when the client had a superior product.', solution: 'We focused on answer-gap analysis — finding the specific questions buyers asked where competitors had weak or no AI presence. We then created targeted authority content and citation placements for those exact queries.', m1: '+241%', l1: 'AI Citations', m2: '+130%', l2: 'Demo Requests', m3: '6mo', l3: 'Timeline' },
  { tag: 'IoT Analytics', duration: '12 months', title: 'Category Leader in an Emerging Niche', summary: 'An IoT analytics company became the default AI recommendation for their category, driving a 5× increase in pipeline from AI-sourced traffic and establishing unassailable category leadership.', challenge: 'The IoT analytics space was fragmented with no clear leader. The client needed to establish category authority before competitors caught on to AEO.', solution: 'We executed a full category ownership strategy — creating the definitive guides for IoT analytics, building entity authority, and establishing the brand as the go-to source across every major AI platform.', m1: '+417%', l1: 'AI Citations', m2: '+560%', l2: 'AI-Sourced Leads', m3: '12mo', l3: 'Timeline' },
  { tag: 'HR Tech SaaS', duration: '8 months', title: 'Turning AI into a Top Acquisition Channel', summary: 'An HR software company transformed AEO into their fastest-growing acquisition channel — with AI-sourced leads now accounting for 35% of all inbound pipeline and converting 40% better than other channels.', challenge: 'Heavy reliance on paid ads with rising CAC. The team needed a scalable, lower-cost acquisition channel that could grow organically over time.', solution: 'We built a 12-month AEO roadmap focused on the highest-intent HR software queries, secured placements in the top HR publications AI engines trust, and created a buyer journey content library optimized for AI citation.', m1: '+198%', l1: 'AI Citations', m2: '+95%', l2: 'Trial Sign-ups', m3: '8mo', l3: 'Timeline' },
]

export default function CaseStudies() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-glow" />
        <div style={{ position: 'relative', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <span className="badge">Success Stories</span>
          <h1 className="section-title fade-up" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', marginBottom: '20px' }}>
            Real Results for <em className="gold-text">Real Companies</em>
          </h1>
          <p className="section-sub fade-up delay-1" style={{ margin: '0 auto' }}>
            See how we've helped B2B SaaS companies earn AI citations, grow pipeline, and build category authority with AEO.
          </p>
        </div>
      </section>

      <div className="stats-band">
        <div className="stats-grid">
          {[['50+','SaaS brands optimized'],['3×','Avg. AI citation increase'],['90%','Avg. pipeline boost'],['4.9★','Client satisfaction']].map(([n,l]) => (
            <div key={n} className="stat-cell"><div className="stat-num">{n}</div><div className="stat-label">{l}</div></div>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
            {cases.map((c, i) => (
              <div key={i} style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '48px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '48px', alignItems: 'start' }} className="case-inner">
                  <div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(242,168,59,0.1)', border: '1px solid rgba(242,168,59,0.2)', padding: '4px 12px', borderRadius: '100px' }}>{c.tag}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', background: 'var(--card)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: '100px' }}>{c.duration}</span>
                    </div>
                    <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(1.5rem,3vw,2rem)', color: '#fff', marginBottom: '16px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>{c.title}</h2>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.75, marginBottom: '28px', fontWeight: 300 }}>{c.summary}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
                      <div>
                        <h5 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>The Challenge</h5>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65, fontWeight: 300 }}>{c.challenge}</p>
                      </div>
                      <div>
                        <h5 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>Our Solution</h5>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65, fontWeight: 300 }}>{c.solution}</p>
                      </div>
                    </div>
                    <Link href="/contact" className="btn-gold" style={{ fontSize: '0.875rem', padding: '11px 22px' }}>Get Similar Results →</Link>
                  </div>

                  <div style={{ background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px' }}>
                    <h5 style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '24px' }}>Results</h5>
                    {[[c.m1,c.l1],[c.m2,c.l2],[c.m3,c.l3]].map(([v,l]) => (
                      <div key={l} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontFamily: 'Fraunces, serif', fontSize: '2.5rem', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', background: 'linear-gradient(135deg,#F2A83B,#FDE68A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '6px' }}>{v}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 300 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px', textAlign: 'center', background: 'var(--navy2)' }}>
        <span className="section-tag" style={{ display: 'block', marginBottom: '16px' }}>Your Company Next</span>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2rem,4vw,3rem)', color: '#fff', marginBottom: '16px', letterSpacing: '-0.03em' }}>
          Ready to Build Your <em className="gold-text">Success Story?</em>
        </h2>
        <p style={{ color: 'var(--muted)', maxWidth: '440px', margin: '0 auto 32px', fontWeight: 300, lineHeight: 1.7 }}>
          Book a free AEO audit and see exactly where you stand — and what's possible.
        </p>
        <Link href="/contact" className="btn-gold">Book a Free AEO Audit →</Link>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .case-inner { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
