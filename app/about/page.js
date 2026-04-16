import Link from 'next/link'

export const metadata = {
  title: 'About',
  description: 'AEOrank is an independent Answer Engine Optimization agency focused on B2B SaaS. Built to help brands get cited by ChatGPT, Perplexity, and Google AI.',
  alternates: { canonical: 'https://aeorank.tech/about' },
}

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-glow" />
        <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <span className="badge">About AEOrank</span>
          <h1 className="section-title fade-up" style={{ fontSize: 'clamp(2.4rem,5vw,3.6rem)', marginBottom: '20px' }}>
            A small, focused agency for <em className="gold-text">a specific problem</em>
          </h1>
          <p className="section-sub fade-up delay-1" style={{ margin: '0 auto' }}>
            AEOrank exists because Answer Engine Optimization needs specialists, not generalists bolting it onto SEO retainers. This page explains who we are and how we think about the work.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '780px' }}>
          <div style={{ fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.85, fontWeight: 300 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', color: '#fff', marginBottom: '20px', letterSpacing: '-0.02em' }}>Why this exists</h2>
            <p style={{ marginBottom: '20px' }}>
              Watch how B2B buyers research software today. They don\'t start with a Google search. They open ChatGPT or Perplexity, describe their problem in plain language, and get a short list — often with three specific product names. The brands on that short list get evaluated. The brands that aren\'t, don\'t.
            </p>
            <p style={{ marginBottom: '20px' }}>
              That shift is already happening across every technical B2B category, and it\'s accelerating. SEO agencies are mostly still solving the old problem: get the blue link to rank. That still matters. But it\'s no longer sufficient, and in some categories it\'s no longer the point.
            </p>
            <p style={{ marginBottom: '40px' }}>
              AEOrank is built around the new problem: showing up when AI engines answer the question. That\'s a different discipline — different levers, different measurement, different content strategy. We built a team and a method around it.
            </p>

            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', color: '#fff', marginBottom: '20px', letterSpacing: '-0.02em' }}>How we work</h2>
            <p style={{ marginBottom: '16px' }}>
              A few principles shape every engagement:
            </p>

            <div style={{ borderLeft: '2px solid rgba(242,168,59,0.3)', paddingLeft: '20px', marginBottom: '20px' }}>
              <p style={{ color: '#fff', fontWeight: 500, marginBottom: '6px' }}>We measure against pipeline, not citations.</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Citations are the leading indicator. Qualified pipeline is the real scoreboard. If the work isn\'t connecting to pipeline within 6–9 months, something\'s wrong with the plan.</p>
            </div>

            <div style={{ borderLeft: '2px solid rgba(242,168,59,0.3)', paddingLeft: '20px', marginBottom: '20px' }}>
              <p style={{ color: '#fff', fontWeight: 500, marginBottom: '6px' }}>We say no to clients we can\'t help.</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Some companies aren\'t ready for AEO yet. Some categories aren\'t mature enough in AI answers. We tell people that on the first call instead of taking a retainer we don\'t deserve.</p>
            </div>

            <div style={{ borderLeft: '2px solid rgba(242,168,59,0.3)', paddingLeft: '20px', marginBottom: '20px' }}>
              <p style={{ color: '#fff', fontWeight: 500, marginBottom: '6px' }}>We write our own playbook as we go.</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>AEO is new. The best practices aren\'t settled. We run our own experiments, track what moves, and share what we learn — on the blog and with clients. No rented wisdom.</p>
            </div>

            <div style={{ borderLeft: '2px solid rgba(242,168,59,0.3)', paddingLeft: '20px', marginBottom: '40px' }}>
              <p style={{ color: '#fff', fontWeight: 500, marginBottom: '6px' }}>We keep the team small on purpose.</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>Most AEO work is senior work. We don\'t pass engagements to juniors. The strategist you meet in the first call is the strategist who runs your account.</p>
            </div>

            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', color: '#fff', marginBottom: '20px', letterSpacing: '-0.02em' }}>Who we work with</h2>
            <p style={{ marginBottom: '20px' }}>
              Best fit: B2B SaaS companies past product-market fit, with a clear ICP, actively competing in a category where buyers research with AI. That usually means DevOps, cybersecurity, data tooling, vertical SaaS, and PLG companies in technical spaces.
            </p>
            <p style={{ marginBottom: '40px' }}>
              Not a fit: Pre-PMF startups, companies whose buyers don\'t use AI (some niches still aren\'t there), or teams looking for paid-link SEO. We won\'t take that work.
            </p>

            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.8rem', color: '#fff', marginBottom: '20px', letterSpacing: '-0.02em' }}>Who\'s behind it</h2>
            <p style={{ marginBottom: '12px' }}>
              AEOrank is founded and run by <strong style={{ color: '#fff', fontWeight: 500 }}>Ilyas Mrani</strong>, who also runs SaaSOffers.tech. Background in B2B growth, SEO, and distribution — with the last two years focused almost entirely on how AI answer engines are rewriting the discovery layer for SaaS.
            </p>
            <p style={{ marginBottom: '40px' }}>
              If you\'re going to work with an agency, it should be one where you know exactly who you\'re talking to. That\'s the whole reason this page exists.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '48px 32px', background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '14px' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.6rem', color: '#fff', marginBottom: '14px', letterSpacing: '-0.02em' }}>Want to talk?</h3>
            <p style={{ color: 'var(--muted)', fontWeight: 300, lineHeight: 1.7, marginBottom: '24px' }}>
              45-minute call. We\'ll look at your category, run a live AI citation test on your top queries, and be honest about whether AEO is worth doing right now.
            </p>
            <Link href="/contact" className="btn-gold">Book a Free Audit Call →</Link>
          </div>
        </div>
      </section>
    </>
  )
}
