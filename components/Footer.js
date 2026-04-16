import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const cols = [
    {
      title: 'Services',
      links: [
        { label: 'AEO Management', href: '/services' },
        { label: 'AEO Consulting', href: '/services' },
        { label: 'Citation Building', href: '/services' },
        { label: 'Entity Optimization', href: '/services' },
        { label: 'AI Visibility Audit', href: '/services' },
      ],
    },
    {
      title: 'We Work With',
      links: [
        { label: 'SaaS Companies', href: '/services' },
        { label: 'Startup Companies', href: '/services' },
        { label: 'Tech & IT Companies', href: '/services' },
        { label: 'Software Companies', href: '/services' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Case Studies', href: '/case-studies' },
        { label: 'Blog', href: '/blog' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'AEO Guides',
      links: [
        { label: 'AEO for SaaS', href: '/blog' },
        { label: 'ChatGPT Optimization', href: '/blog' },
        { label: 'Perplexity SEO', href: '/blog' },
        { label: 'Google AI Overviews', href: '/blog' },
        { label: 'Entity SEO Guide', href: '/blog' },
      ],
    },
  ]

  return (
    <footer style={{
      background: '#03090F',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '72px 24px 36px',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2.2fr repeat(4, 1fr)',
          gap: '40px',
          marginBottom: '56px',
        }} className="footer-grid">
          <div>
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', marginBottom: '16px' }}>
              <Image src="/logo.svg" alt="AEOrank" width={160} height={36} />
            </Link>
            <p style={{ fontSize: '0.84rem', color: '#8A96B0', lineHeight: 1.72, fontWeight: 300, maxWidth: '280px' }}>
              AEOrank helps B2B SaaS companies get cited by ChatGPT, Perplexity, and Google AI — turning AI engines into your top acquisition channel.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              {['LinkedIn', 'Twitter', 'Blog'].map(s => (
                <a key={s} href="#" style={{
                  fontSize: '0.78rem', color: '#8A96B0', textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px',
                  borderRadius: '4px', transition: 'all 0.2s',
                }}>{s}</a>
              ))}
            </div>
          </div>

          {cols.map(col => (
            <div key={col.title}>
              <h5 style={{
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '18px',
              }}>{col.title}</h5>
              <ul style={{ listStyle: 'none' }}>
                {col.links.map(l => (
                  <li key={l.label} style={{ marginBottom: '11px' }}>
                    <Link href={l.href} style={{
                      color: '#8A96B0', textDecoration: 'none',
                      fontSize: '0.84rem', fontWeight: 300, transition: 'color 0.2s',
                    }}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          paddingTop: '28px', borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <p style={{ fontSize: '0.78rem', color: '#8A96B0', fontWeight: 300 }}>
            © 2025 AEOrank — AEO Agency for SaaS & Technology Companies. All Rights Reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/privacy" style={{ fontSize: '0.78rem', color: '#8A96B0', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ fontSize: '0.78rem', color: '#8A96B0', textDecoration: 'none' }}>Terms of Service</Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  )
}
