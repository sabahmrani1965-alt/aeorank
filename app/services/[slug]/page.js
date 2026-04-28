import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CALENDLY_URL } from "@/lib/links";

const services = {
  'aeo-management': {
    title: 'AEO Management Services',
    tag: 'Full-Service AEO',
    description: 'Full-service Answer Engine Optimization management for B2B SaaS. We handle every aspect of getting your brand cited by ChatGPT, Perplexity, and Google AI.',
    hero: 'Fully Managed AEO for <em>SaaS Growth Teams</em>',
    intro: 'Our AEO Management service is a complete done-for-you program. You focus on your product; we focus on making sure every AI engine cites your brand when buyers ask.',
    benefits: [
      { title: 'Dedicated AEO Strategist', desc: 'A senior strategist who owns your AEO roadmap, reports weekly, and adjusts based on real data.' },
      { title: 'Full-Stack Execution', desc: 'Entity optimization, citation building, content creation, schema implementation — all in one package.' },
      { title: 'Multi-Platform Optimization', desc: 'We track and optimize for ChatGPT, Perplexity, Google AI Overviews, Bing Copilot, and Claude simultaneously.' },
      { title: 'Monthly Executive Reports', desc: 'Clear reporting tied to pipeline metrics — not vanity metrics. See exactly what your AEO investment returns.' },
    ],
    process: [
      { num: '01', title: 'Audit & Baseline', desc: 'We audit your current AI citation presence across every major platform and establish a measurement baseline.' },
      { num: '02', title: 'Strategy Roadmap', desc: 'Custom 12-month roadmap prioritized by your highest-intent queries and biggest competitive gaps.' },
      { num: '03', title: 'Execution', desc: 'Our team executes citation building, content creation, schema work, and entity optimization week by week.' },
      { num: '04', title: 'Report & Iterate', desc: 'Monthly reviews with pipeline attribution data. We double down on what works and cut what doesn\'t.' },
    ],
    faqs: [
      { q: 'Who is AEO Management best for?', a: 'B2B SaaS companies generating $1M+ ARR who want to treat AEO as a serious growth channel. Typical clients are Series A to Series C companies with sales-led or PLG motions.' },
      { q: 'How long until we see results?', a: 'Initial citation improvements within 60–90 days. Meaningful share-of-voice gains typically take 4–6 months of consistent execution.' },
      { q: 'Do you work with our existing marketing team?', a: 'Yes. We integrate with your team, slot into your cadence, and provide transparent documentation so your internal team learns AEO as we execute.' },
    ],
  },

  'aeo-consulting': {
    title: 'AEO Consulting Services',
    tag: 'Strategic Advisory',
    description: 'Strategic AEO consulting for B2B SaaS teams who want to execute internally. We provide the roadmap, frameworks, and expertise; you execute with our guidance.',
    hero: 'Strategic <em>AEO Consulting</em> for In-House Teams',
    intro: 'For SaaS companies with strong in-house marketing teams, AEO consulting gives you the strategy, frameworks, and expert guidance to build AEO capability internally — without outsourcing execution.',
    benefits: [
      { title: 'Custom AEO Roadmap', desc: 'A prioritized 12-month roadmap built around your specific product, market, and competitive landscape.' },
      { title: 'Team Training & Enablement', desc: 'Workshops and frameworks that upskill your content, SEO, and demand gen teams on AEO best practices.' },
      { title: 'Ongoing Advisory Access', desc: 'Direct access to senior AEO strategists for real-time guidance as you execute your roadmap.' },
      { title: 'Quarterly Business Reviews', desc: 'We review your progress, audit outcomes, and recalibrate the roadmap every 90 days.' },
    ],
    process: [
      { num: '01', title: 'Discovery & Assessment', desc: 'Deep dive into your current state, team capabilities, tooling, and strategic goals.' },
      { num: '02', title: 'Strategy Development', desc: 'Custom AEO strategy document covering entity authority, content, citation, and measurement playbooks.' },
      { num: '03', title: 'Team Enablement', desc: 'Hands-on training sessions that equip your team to execute the strategy with confidence.' },
      { num: '04', title: 'Ongoing Advisory', desc: 'Monthly strategy calls, async Slack access, and quarterly reviews to keep you on track.' },
    ],
    faqs: [
      { q: 'Is consulting cheaper than full management?', a: 'Typically yes — consulting is 30–50% less than managed services. You save on execution fees by using your in-house team.' },
      { q: 'What if we don\'t have an in-house team?', a: 'We recommend AEO Management in that case. Consulting works best when you have at least 2–3 marketing team members who can execute.' },
      { q: 'Can we upgrade to full management later?', a: 'Yes. Many clients start with consulting and upgrade to full management as AEO becomes a priority channel.' },
    ],
  },

  'citation-building': {
    title: 'Citation Building Services',
    tag: 'Earned Citations',
    description: 'Strategic citation building for B2B SaaS. We secure mentions in the high-authority publications and directories that AI engines use as training data and real-time citation sources.',
    hero: 'Secure the <em>Citations</em> AI Engines Trust',
    intro: 'Citations are the single strongest external signal AI engines use to decide which brands to recommend. Our citation building service secures mentions in the exact publications and directories that influence AI citation behavior.',
    benefits: [
      { title: 'Targeted Publication Outreach', desc: 'Placements in 20+ high-authority publications that AI engines reference regularly.' },
      { title: 'Directory & Platform Listings', desc: 'Optimized profiles on G2, Capterra, TrustRadius, Gartner, Forrester, and industry-specific directories.' },
      { title: 'Earned Media Campaigns', desc: 'Original research, data reports, and expert commentary that gets you quoted in top publications.' },
      { title: 'Citation Monitoring', desc: 'Continuous tracking of new citations, mention accuracy, and competitive share-of-voice.' },
    ],
    process: [
      { num: '01', title: 'Citation Audit', desc: 'We map your existing citations, identify gaps vs competitors, and prioritize target publications.' },
      { num: '02', title: 'Outreach Strategy', desc: 'Custom outreach plan targeting the highest-impact citation opportunities for your category.' },
      { num: '03', title: 'Placement & Content', desc: 'We secure placements, create supporting content, and coordinate with editors and analysts.' },
      { num: '04', title: 'Amplify & Monitor', desc: 'Once citations land, we amplify them and monitor how AI engines surface the new mentions.' },
    ],
    faqs: [
      { q: 'How many citations do I get per month?', a: 'Depends on the plan — typically 10–25 new high-quality citations per month for active campaigns.' },
      { q: 'Are these paid placements?', a: 'No. All citations are earned — expert commentary, original research placements, directory optimization. No paid link schemes.' },
      { q: 'Do citations actually move the needle?', a: 'Yes — AI engines heavily weight third-party citations. Most clients see 200–400% increase in AI citation frequency within 6 months.' },
    ],
  },

  'entity-optimization': {
    title: 'Entity Optimization Services',
    tag: 'Knowledge Graph Authority',
    description: 'Entity optimization for B2B SaaS. We establish your brand as a recognized, trusted entity across the knowledge graph so AI engines confidently cite you.',
    hero: 'Establish <em>Entity Authority</em> Across the Knowledge Graph',
    intro: 'Entity authority is the foundation of every AI citation. Our entity optimization service makes your brand a first-class entity in Google\'s Knowledge Graph, Wikidata, and every major AI training source.',
    benefits: [
      { title: 'Knowledge Graph Optimization', desc: 'Full Google Knowledge Panel optimization including facts, founding details, and product categorization.' },
      { title: 'Wikidata & Wikipedia Strategy', desc: 'Notable third-party coverage that qualifies your brand for Wikidata entries and Wikipedia mentions.' },
      { title: 'Entity Consistency Audit', desc: 'We fix naming, description, and categorization inconsistencies across all platforms where your brand appears.' },
      { title: 'Structured Data Implementation', desc: 'Comprehensive Organization and Product schema that tells AI crawlers exactly what your brand is and does.' },
    ],
    process: [
      { num: '01', title: 'Entity Audit', desc: 'We map your entity presence across Google, Bing, Wikidata, and major directories. Find the gaps.' },
      { num: '02', title: 'Foundation Setup', desc: 'Fix inconsistencies, implement schema, optimize knowledge panel, and claim all relevant entity profiles.' },
      { num: '03', title: 'Third-Party Validation', desc: 'Secure the notable coverage and citations needed to qualify for Wikidata and strengthen entity authority.' },
      { num: '04', title: 'Ongoing Maintenance', desc: 'Quarterly audits to keep entity data accurate as your company evolves (funding, products, leadership).' },
    ],
    faqs: [
      { q: 'Do I need entity optimization if I already have a Google Knowledge Panel?', a: 'Almost certainly yes. Most panels are incomplete or inaccurate. Optimization ensures AI engines pull the right data.' },
      { q: 'How long does entity authority take to build?', a: 'Foundation work takes 60–90 days. Full entity authority across all AI platforms typically takes 6–12 months.' },
      { q: 'Can you get us a Wikipedia page?', a: 'We can help you qualify by securing notable coverage, but Wikipedia has strict notability requirements — no agency can guarantee Wikipedia inclusion.' },
    ],
  },

  'ai-visibility-audit': {
    title: 'AI Visibility Audit',
    tag: 'Diagnostic Report',
    description: 'Comprehensive AI visibility audit for B2B SaaS. See exactly where your brand stands in AI-generated answers across ChatGPT, Perplexity, Google AI, and more.',
    hero: 'See Exactly Where Your <em>Brand Stands</em> in AI Answers',
    intro: 'Before you invest in AEO, know your starting point. Our AI Visibility Audit gives you a complete diagnostic of your current AI citation presence, competitive gaps, and prioritized action plan.',
    benefits: [
      { title: 'Live Citation Testing', desc: 'We test 100+ buyer queries across ChatGPT, Perplexity, Google AI Overviews, Bing Copilot, and Claude.' },
      { title: 'Competitor Benchmarking', desc: 'See how your citation rate compares to the top 3–5 competitors in your category.' },
      { title: 'Entity Authority Score', desc: 'A complete evaluation of your entity presence across knowledge graphs and AI training sources.' },
      { title: '90-Day Action Plan', desc: 'Prioritized roadmap with the exact steps to close the biggest gaps first.' },
    ],
    process: [
      { num: '01', title: 'Query Selection', desc: 'We define the 100+ highest-intent buyer queries that matter most for your pipeline.' },
      { num: '02', title: 'Multi-Platform Testing', desc: 'Live testing across every major AI platform to capture your real citation presence.' },
      { num: '03', title: 'Analysis & Benchmarking', desc: 'We score your visibility, compare to competitors, and identify the highest-leverage opportunities.' },
      { num: '04', title: 'Audit Delivery', desc: 'Detailed audit report + 60-minute walkthrough call with concrete next steps.' },
    ],
    faqs: [
      { q: 'How long does the audit take?', a: 'Typically 10–14 business days from kickoff to delivery.' },
      { q: 'What do I get at the end?', a: 'A detailed PDF report, raw query data, competitor benchmarks, and a 60-minute walkthrough call.' },
      { q: 'Is this the same as the free audit?', a: 'No — the free audit is a lighter 30-minute assessment. The paid audit is comprehensive and includes 100+ queries, full benchmarking, and a detailed action plan.' },
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(services).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const service = services[params.slug]
  if (!service) return {}
  return {
    title: service.title,
    description: service.description,
    alternates: { canonical: `https://aeorank.tech/services/${params.slug}` },
    openGraph: {
      title: service.title,
      description: service.description,
      type: 'website',
      url: `https://aeorank.tech/services/${params.slug}`,
    },
  }
}

export default function ServicePage({ params }) {
  const service = services[params.slug]
  if (!service) notFound()

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aeorank.tech' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://aeorank.tech/services' },
      { '@type': 'ListItem', position: 3, name: service.title, item: `https://aeorank.tech/services/${params.slug}` },
    ],
  }

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: { '@type': 'Organization', name: 'AEOrank', url: 'https://aeorank.tech' },
    areaServed: 'Worldwide',
    serviceType: 'Answer Engine Optimization',
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <section className="section">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <span className="section-tag">( {service.tag} )</span>
          <h2
            style={{ marginBottom: 18 }}
            dangerouslySetInnerHTML={{
              __html: service.hero
                .replace(/<em>/g, '<span class="accent">')
                .replace(/<\/em>/g, "</span>"),
            }}
          />
          <p className="section-sub">{service.intro}</p>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Book a Free Strategy Call →
            </a>
            <Link href="/" className="btn btn-ghost">
              Run a Free Report
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <nav style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 32 }}>
            <Link href="/" style={{ color: "var(--text-muted)" }}>
              Home
            </Link>
            <span style={{ margin: "0 8px", opacity: 0.4 }}>/</span>
            <Link href="/services" style={{ color: "var(--text-muted)" }}>
              Services
            </Link>
            <span style={{ margin: "0 8px", opacity: 0.4 }}>/</span>
            <span style={{ color: "var(--text)" }}>{service.title}</span>
          </nav>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span className="section-tag">( what you get )</span>
            <h2>
              Key <span className="accent">benefits</span>
            </h2>
          </div>
          <div
            className="two-col"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 16,
            }}
          >
            {service.benefits.map((b, i) => (
              <div key={i} className="card">
                <h4 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>
                  {b.title}
                </h4>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span className="section-tag">( how it works )</span>
            <h2>
              Our <span className="accent">process</span>
            </h2>
          </div>
          <div
            className="four-col"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
            }}
          >
            {service.process.map((p, i) => (
              <div
                key={i}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: "var(--accent-dim)",
                    marginBottom: 12,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {p.num}
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                  {p.title}
                </h4>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.65 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span className="section-tag">( faq )</span>
            <h2>
              Common <span className="accent">questions</span>
            </h2>
          </div>
          <div className="faq">
            {service.faqs.map((f, i) => (
              <details key={i}>
                <summary>{f.q}</summary>
                <div className="faq-body">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <span className="section-tag">( ready to start? )</span>
          <h2 style={{ marginBottom: 14 }}>
            Book your free <span className="accent">AEO strategy call</span>
          </h2>
          <p className="section-sub">
            45 minutes with a senior AEO strategist. Real insights, custom roadmap, zero sales pressure.
          </p>
          <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Book a Strategy Call →
            </a>
            <Link href="/" className="btn btn-ghost">
              Run a Free Report
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1100px) {
          .four-col { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 700px) {
          .two-col { grid-template-columns: 1fr !important; }
          .four-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Footer />
    </>
  );
}
