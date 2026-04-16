'use client'
import Link from 'next/link'

const posts = [
  { tag: 'AEO · Strategy', emoji: '🤖', title: 'How to Get Your SaaS Brand Cited by ChatGPT in 2025', excerpt: 'A step-by-step guide to building entity authority, creating answer-first content, and securing the citations that make ChatGPT recommend your product.', date: 'April 10, 2025', readTime: '8 min read', slug: 'how-to-get-cited-by-chatgpt' },
  { tag: 'AEO · Measurement', emoji: '📈', title: 'How to Measure AI Citation ROI: A Framework for SaaS Marketers', excerpt: 'AI citations are worthless if you can\'t measure their business impact. Here\'s the exact framework we use to tie AEO directly to pipeline and revenue.', date: 'April 3, 2025', readTime: '6 min read', slug: 'measure-ai-citation-roi' },
  { tag: 'Entity SEO · AEO', emoji: '🔍', title: 'Entity Authority: The Hidden Driver Behind Every AI Citation', excerpt: 'Why some brands get cited constantly by AI engines while others never appear — and what you can do to build the entity authority that makes the difference.', date: 'March 27, 2025', readTime: '10 min read', slug: 'entity-authority-ai-citation' },
  { tag: 'AEO · Perplexity', emoji: '⚡', title: 'How to Optimize for Perplexity AI: A B2B SaaS Guide', excerpt: 'Perplexity is becoming the preferred research tool for technical buyers. Here\'s how to make sure your brand shows up when they search for solutions like yours.', date: 'March 20, 2025', readTime: '7 min read', slug: 'optimize-for-perplexity' },
  { tag: 'AEO vs SEO', emoji: '🆚', title: 'AEO vs SEO: What\'s Different and Why You Need Both', excerpt: 'AEO and SEO aren\'t competitors — they\'re complements. But they require different strategies. Here\'s how to think about balancing both for maximum visibility.', date: 'March 13, 2025', readTime: '9 min read', slug: 'aeo-vs-seo' },
  { tag: 'Google AI · AEO', emoji: '🌐', title: 'Google AI Overviews: How to Get Featured in SGE Answers', excerpt: 'Google AI Overviews are reshaping organic search. This guide covers exactly what signals Google looks for and how to position your content to get featured.', date: 'March 6, 2025', readTime: '11 min read', slug: 'google-ai-overviews-guide' },
]

const categories = ['All', 'AEO Strategy', 'Measurement', 'Entity SEO', 'Platforms', 'Case Studies']

export default function Blog() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-glow" />
        <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <span className="badge">AEO Insights</span>
          <h1 className="section-title fade-up" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', marginBottom: '20px' }}>
            The <em className="gold-text">AEOrank</em> Blog
          </h1>
          <p className="section-sub fade-up delay-1" style={{ margin: '0 auto' }}>
            Practical AEO strategies, research, and guides for B2B SaaS marketers who want to win in the age of AI search.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Categories */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '52px' }}>
            {categories.map((c, i) => (
              <button key={c} style={{
                padding: '8px 18px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 500,
                background: i === 0 ? 'var(--gold)' : 'transparent',
                color: i === 0 ? '#06112A' : 'var(--muted)',
                border: i === 0 ? '1px solid var(--gold)' : '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>{c}</button>
            ))}
          </div>

          {/* Featured post */}
          <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="featured-post">
            <div style={{ background: 'linear-gradient(135deg,var(--navy2),var(--navy3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', minHeight: '260px' }}>
              {posts[0].emoji}
            </div>
            <div style={{ padding: '40px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '12px' }}>Featured · {posts[0].tag}</span>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', color: '#fff', marginBottom: '14px', lineHeight: 1.3, letterSpacing: '-0.02em' }}>{posts[0].title}</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.72, fontWeight: 300, marginBottom: '24px' }}>{posts[0].excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{posts[0].date}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>·</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{posts[0].readTime}</span>
              </div>
              <Link href={`/blog/${posts[0].slug}`} className="btn-gold" style={{ fontSize: '0.875rem', padding: '11px 22px' }}>Read Article →</Link>
            </div>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }} className="three-col">
            {posts.slice(1).map((p, i) => (
              <Link key={i} href={`/blog/${p.slug}`} style={{ textDecoration: 'none', display: 'block', background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(242,168,59,0.3)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ height: '140px', background: 'linear-gradient(135deg,var(--navy),var(--navy3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', borderBottom: '1px solid var(--border)' }}>
                  {p.emoji}
                </div>
                <div style={{ padding: '24px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '10px' }}>{p.tag}</span>
                  <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1rem', color: '#fff', lineHeight: 1.4, marginBottom: '10px', letterSpacing: '-0.01em' }}>{p.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.65, fontWeight: 300, marginBottom: '16px' }}>{p.excerpt}</p>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.73rem', color: 'var(--muted)' }}>
                    <span>{p.date}</span><span>·</span><span>{p.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ background: 'var(--navy2)', padding: '80px 24px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <span className="section-tag" style={{ display: 'block', marginBottom: '14px' }}>Stay Ahead</span>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', color: '#fff', marginBottom: '14px', letterSpacing: '-0.03em' }}>
          Get AEO Insights in Your <em className="gold-text">Inbox</em>
        </h2>
        <p style={{ color: 'var(--muted)', maxWidth: '420px', margin: '0 auto 32px', fontWeight: 300, lineHeight: 1.7 }}>
          Monthly AEO strategies, research, and case studies. No spam — just actionable insights.
        </p>
        <div style={{ display: 'flex', gap: '10px', maxWidth: '440px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input type="email" placeholder="your@email.com" style={{
            flex: 1, minWidth: '220px', padding: '13px 18px', borderRadius: '8px',
            background: 'var(--card)', border: '1px solid var(--border2)',
            color: '#fff', fontSize: '0.9rem', outline: 'none',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }} />
          <button className="btn-gold" style={{ whiteSpace: 'nowrap' }}>Subscribe →</button>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .three-col { grid-template-columns: 1fr !important; }
          .featured-post { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
