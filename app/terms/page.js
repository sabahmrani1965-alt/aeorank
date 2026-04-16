import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service',
  description: 'AEOrank terms of service. Read our terms and conditions for using our website and AEO services.',
  alternates: { canonical: 'https://aeorank.tech/terms' },
}

export default function Terms() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing or using the AEOrank website (aeorank.tech) or engaging our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.\n\nWe reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.`,
    },
    {
      title: '2. Services',
      content: `AEOrank provides Answer Engine Optimization (AEO) services for B2B SaaS companies, including but not limited to:\n\n• Entity authority building and optimization.\n• AI citation monitoring and strategy.\n• Content strategy and creation for AI visibility.\n• Schema markup and structured data implementation.\n• AEO audits and consulting.\n\nThe specific scope of services will be outlined in individual service agreements or statements of work between AEOrank and the client.`,
    },
    {
      title: '3. Client Obligations',
      content: `As a client, you agree to:\n\n• Provide accurate and complete information necessary for us to deliver services.\n• Grant necessary access to your website, analytics, and relevant platforms as required.\n• Review and provide timely feedback on deliverables.\n• Comply with all applicable laws and regulations in connection with the services.\n• Not use our services for any unlawful or prohibited purpose.`,
    },
    {
      title: '4. Payment Terms',
      content: `Payment terms are outlined in individual service agreements. General terms include:\n\n• Invoices are due within 30 days of receipt unless otherwise agreed.\n• All fees are quoted in USD unless otherwise specified.\n• Late payments may incur interest at 1.5% per month.\n• We reserve the right to suspend services for overdue accounts.\n• Refunds are handled on a case-by-case basis as outlined in your service agreement.`,
    },
    {
      title: '5. Intellectual Property',
      content: `All content, materials, and methodologies created by AEOrank remain our intellectual property unless explicitly transferred in writing.\n\n• Deliverables — Custom content, strategies, and reports created for clients become the client's property upon full payment.\n• Proprietary methods — Our AEO frameworks, tools, processes, and proprietary methodologies remain AEOrank's intellectual property.\n• Website content — All content on aeorank.tech, including text, graphics, logos, and code, is owned by AEOrank and protected by copyright law.\n\nYou may not reproduce, distribute, or create derivative works from our proprietary content without written permission.`,
    },
    {
      title: '6. Confidentiality',
      content: `Both parties agree to maintain the confidentiality of proprietary information shared during the course of the engagement. This includes business strategies, analytics data, client lists, pricing, and any other information designated as confidential.\n\nConfidentiality obligations survive termination of the service agreement for a period of two years.`,
    },
    {
      title: '7. Results and Disclaimers',
      content: `AEO results depend on many factors outside our control, including AI engine algorithm changes, competitive activity, and market conditions.\n\n• We do not guarantee specific ranking positions, citation counts, or traffic numbers.\n• Case studies and reported results reflect specific client outcomes and may not be typical.\n• Past performance does not guarantee future results.\n• We provide our professional best efforts based on industry expertise and proven methodologies.`,
    },
    {
      title: '8. Limitation of Liability',
      content: `To the maximum extent permitted by law, AEOrank shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services or website.\n\nOur total liability for any claim arising from our services shall not exceed the total fees paid by you in the six months preceding the claim.`,
    },
    {
      title: '9. Termination',
      content: `Either party may terminate a service agreement with 30 days written notice unless otherwise specified in the agreement.\n\nUpon termination:\n\n• All outstanding fees become immediately due.\n• We will deliver any completed work product.\n• Both parties' confidentiality obligations remain in effect.\n• Access to proprietary tools and platforms will be revoked.`,
    },
    {
      title: '10. Governing Law',
      content: `These Terms of Service shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms or our services shall be resolved through good-faith negotiation, and if necessary, binding arbitration.`,
    },
    {
      title: '11. Contact',
      content: `For questions about these Terms of Service, please contact us at:\n\n• Email: legal@aeorank.tech\n• Website: aeorank.tech/contact`,
    },
  ]

  return (
    <>
      <section className="page-hero" style={{ paddingBottom: '40px' }}>
        <div className="page-hero-glow" />
        <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <h1 className="section-title fade-up" style={{ fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: '16px' }}>
            Terms of <em className="gold-text">Service</em>
          </h1>
          <p className="fade-up delay-1" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Effective date: January 1, 2026 &nbsp;·&nbsp; Last updated: April 1, 2026
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          <p style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: 1.85, marginBottom: '48px', fontWeight: 300 }}>
            These Terms of Service govern your use of the AEOrank website and services. Please read them carefully before using our website or engaging our services.
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
