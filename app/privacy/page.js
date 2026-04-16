import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy',
  description: 'AEOrank privacy policy. Learn how we collect, use, and protect your personal information.',
  alternates: { canonical: 'https://aeorank.tech/privacy' },
}

export default function Privacy() {
  const sections = [
    {
      title: 'Information We Collect',
      content: `We collect information you provide directly to us when you:\n\n• Fill out our contact or audit request forms (name, email, company name, website URL, phone number).\n• Subscribe to our newsletter (email address).\n• Communicate with us via email or other channels.\n\nWe also automatically collect certain technical information when you visit our website, including your IP address, browser type, operating system, referring URLs, pages viewed, and time spent on pages. This data is collected through cookies and similar tracking technologies.`,
    },
    {
      title: 'How We Use Your Information',
      content: `We use the information we collect to:\n\n• Respond to your inquiries and provide requested services.\n• Send you AEO audits, reports, and strategy recommendations.\n• Deliver our newsletter and marketing communications (with your consent).\n• Improve and optimize our website and services.\n• Analyze website traffic and usage patterns.\n• Comply with legal obligations.\n\nWe do not sell, rent, or share your personal information with third parties for their marketing purposes.`,
    },
    {
      title: 'Cookies and Tracking',
      content: `Our website uses cookies and similar technologies to enhance your experience:\n\n• Essential cookies — Required for the website to function properly.\n• Analytics cookies — Help us understand how visitors interact with our website (e.g., Google Analytics).\n• Marketing cookies — Used to deliver relevant advertisements and track campaign performance.\n\nYou can control cookie preferences through your browser settings. Disabling certain cookies may affect website functionality.`,
    },
    {
      title: 'Data Security',
      content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encrypted data transmission (SSL/TLS), secure data storage, and regular security assessments.\n\nHowever, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.`,
    },
    {
      title: 'Third-Party Services',
      content: `We may use third-party services that collect, monitor, and analyze data to improve our service. These include:\n\n• Google Analytics — For website traffic analysis.\n• Vercel Analytics — For performance monitoring.\n• Email service providers — For newsletter delivery.\n\nThese third parties have their own privacy policies governing how they use your information.`,
    },
    {
      title: 'Your Rights',
      content: `Depending on your location, you may have the following rights regarding your personal data:\n\n• Access — Request a copy of the personal data we hold about you.\n• Correction — Request correction of inaccurate or incomplete data.\n• Deletion — Request deletion of your personal data.\n• Opt-out — Unsubscribe from marketing communications at any time.\n• Portability — Request your data in a structured, machine-readable format.\n\nTo exercise any of these rights, contact us at privacy@aeorank.tech.`,
    },
    {
      title: 'Changes to This Policy',
      content: `We may update this privacy policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on this page with a revised effective date.\n\nWe encourage you to review this policy periodically.`,
    },
    {
      title: 'Contact Us',
      content: `If you have any questions about this privacy policy or our data practices, please contact us at:\n\n• Email: privacy@aeorank.tech\n• Website: aeorank.tech/contact`,
    },
  ]

  return (
    <>
      <section className="page-hero" style={{ paddingBottom: '40px' }}>
        <div className="page-hero-glow" />
        <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <h1 className="section-title fade-up" style={{ fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: '16px' }}>
            Privacy <em className="gold-text">Policy</em>
          </h1>
          <p className="fade-up delay-1" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Effective date: January 1, 2026 &nbsp;·&nbsp; Last updated: April 1, 2026
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          <p style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: 1.85, marginBottom: '48px', fontWeight: 300 }}>
            AEOrank (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website at aeorank.tech or engage with our services.
          </p>

          {sections.map((s, i) => (
            <div key={i} style={{ marginBottom: '40px' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.4rem', color: '#fff', marginBottom: '16px', letterSpacing: '-0.02em' }}>{s.title}</h2>
              {s.content.split('\n\n').map((para, j) => (
                <p key={j} style={{ fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.85, marginBottom: '14px', fontWeight: 300 }}>{para}</p>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
