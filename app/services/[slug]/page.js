import MarketingLayout from "@/components/MarketingLayout";
import { renderBlock } from "@/components/prose";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CALENDLY_URL } from "@/lib/links";

const RELATED = {
  "aeo-management": [
    {
      "slug": "what-is-aeo",
      "title": "What Is AEO? Answer Engine Optimization Explained"
    },
    {
      "slug": "aeo-vs-seo",
      "title": "AEO vs SEO: Stop Pretending They're the Same Job"
    },
    {
      "slug": "measure-ai-citation-roi",
      "title": "How to Measure AI Citation ROI"
    }
  ],
  "aeo-consulting": [
    {
      "slug": "what-is-aeo",
      "title": "What Is AEO? Answer Engine Optimization Explained"
    },
    {
      "slug": "aeo-vs-seo",
      "title": "AEO vs SEO: Stop Pretending They're the Same Job"
    },
    {
      "slug": "google-ai-overviews-guide",
      "title": "The Google AI Overviews Guide"
    }
  ],
  "citation-building": [
    {
      "slug": "reddit-ai-visibility-guide",
      "title": "Reddit Marketing for AI Search Visibility"
    },
    {
      "slug": "why-chatgpt-cites-reddit-threads",
      "title": "Why ChatGPT Cites Reddit Threads"
    },
    {
      "slug": "how-we-verify-reddit-threads",
      "title": "How We Verify a Reddit Thread"
    }
  ],
  "entity-optimization": [
    {
      "slug": "entity-authority-ai-citation",
      "title": "Entity Authority and AI Citation"
    },
    {
      "slug": "aeo-schema-markup-guide",
      "title": "The AEO Schema Markup Guide"
    },
    {
      "slug": "getting-cited-by-claude",
      "title": "Getting Cited by Claude"
    }
  ],
  "ai-visibility-audit": [
    {
      "slug": "measure-ai-citation-roi",
      "title": "How to Measure AI Citation ROI"
    },
    {
      "slug": "chatgpt-vs-claude-vs-gemini-citations",
      "title": "ChatGPT vs Claude vs Gemini Citations"
    },
    {
      "slug": "optimize-for-perplexity",
      "title": "How to Optimize for Perplexity"
    }
  ]
}


// Exported so app/sitemap.js derives slugs from the same source.
export const services = {
  'aeo-management': {
    title: 'AEO Management Services',
    tag: 'Full-Service AEO',
    description: 'Full-service Answer Engine Optimization management for B2B SaaS. We handle every aspect of getting your brand cited by ChatGPT, Perplexity, and Google AI.',
    hero: 'Fully Managed AEO for <em>SaaS Growth Teams</em>',
    intro: 'Our AEO Management service is a complete done-for-you program. You focus on your product; we focus on making sure every AI engine cites your brand when buyers ask.',
    benefits: [
      { title: 'Dedicated AEO Strategist', desc: 'A senior strategist who owns your AEO roadmap, reports weekly, and adjusts based on real data.' },
      { title: 'Full-Stack Execution', desc: 'Entity optimization, citation building, content creation, schema implementation: all in one package.' },
      { title: 'Multi-Platform Optimization', desc: 'We track and optimize for ChatGPT, Perplexity, Google AI Overviews, Bing Copilot, and Claude simultaneously.' },
      { title: 'Monthly Executive Reports', desc: 'Clear reporting tied to pipeline metrics, not vanity metrics. See exactly what your AEO investment returns.' },
    ],
    process: [
      { num: '01', title: 'Audit & Baseline', desc: 'We audit your current AI citation presence across every major platform and establish a measurement baseline.' },
      { num: '02', title: 'Strategy Roadmap', desc: 'Custom 12-month roadmap prioritized by your highest-intent queries and biggest competitive gaps.' },
      { num: '03', title: 'Execution', desc: 'Our team executes citation building, content creation, schema work, and entity optimization week by week.' },
      { num: '04', title: 'Report & Iterate', desc: 'Monthly reviews with pipeline attribution data. We double down on what works and cut what doesn\'t.' },
    ],
    guide: [
      {
        heading: 'What does managed AEO actually include?',
        content: `The full programme run for you, with a senior strategist owning the account. The distinction from [consulting](/services/aeo-consulting) is simple: there, your team executes and we advise. Here, we execute.\n\n• **Baseline and measurement.** A fixed query set, measured before anything changes, reported per engine with the zeroes included.\n• **Entity work.** The Organization record, naming consistency, and the profiles models read.\n• **Source material.** Finding threads that already rank, drafting replies, and the primary documentation worth citing.\n• **Reporting.** What moved, what did not, and what we think the reason is.`,
      },
      {
        heading: 'What stays your decision?',
        content: `Three things, and we will not take them off you.\n\n1. **Every reply, before it posts.** Drafted by us, reviewed by you, posted from your own account and disclosed as you.\n2. **What gets claimed.** Any number in a public reply is checkable by the person reading it, and unsourced claims do more damage in a thread than on a landing page because the rebuttal is public.\n3. **Whether to engage at all.** Sometimes the honest answer in a thread is that a competitor fits better, and saying so builds more than a placement would.`,
      },
      {
        heading: 'What we cannot promise',
        content: `A citation by a specific date, or a percentage increase by a specific month. Nobody controls what a model says, and a guaranteed number is a claim about someone else's system rather than a service level.\n\nWhat is controllable: how much good source material exists about you, whether your entity resolves cleanly, and whether the work is measured honestly enough that you can tell if it is working.\n\nA flat result is a real finding. If the number does not move we would rather tell you why than reframe the chart.`,
      },
      {
        heading: 'How does it compare to running it yourself?',
        content: `| | Self-serve | Managed |\n| --- | --- | --- |\n| Who executes | Your team | Ours |\n| Thread discovery | Tooling surfaces them | Surfaced and drafted |\n| Measurement | Dashboard | Reported with interpretation |\n| Best when | You have capacity and want control | You have budget and want the outcome |\n\nThe tooling is the same either way. [Pricing](/pricing) covers the self-serve plans; this page is the version where we do the work.`,
      },
    ],
    faqs: [
      { q: 'Who is AEO Management best for?', a: 'B2B SaaS companies generating $1M+ ARR who want to treat AEO as a serious growth channel. Typical clients are Series A to Series C companies with sales-led or PLG motions.' },
      { q: 'How long until we see results?', a: 'Initial citation improvements within 60–90 days. Meaningful share-of-voice gains typically take 4–6 months of consistent execution.' },
      { q: 'Do you work with our existing marketing team?', a: 'Yes. We integrate with your team, slot into your cadence, and provide transparent documentation so your internal team learns AEO as we execute.' },
    ],
  },

  'aeo-consulting': {
    title: 'Answer Engine Optimization Consulting',
    tag: 'Strategic Advisory',
    description: 'Answer Engine Optimization (AEO) consulting for B2B SaaS teams who execute internally. We provide the roadmap, frameworks and expertise for getting cited by ChatGPT, Claude, Gemini and Perplexity; your team ships it.',
    hero: 'Strategic <em>Answer Engine Optimization</em> Consulting for In-House Teams',
    intro: 'For SaaS companies with strong in-house marketing teams, AEO consulting gives you the strategy, frameworks, and expert guidance to build AEO capability internally, without outsourcing execution.',
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
    guide: [
      {
        heading: 'What does AEO consulting actually deliver?',
        content: `Consulting here means your team does the work and we supply the judgement, the sequence and the review. It is the right shape when you have marketing capacity and lack the specific expertise, and the wrong shape when you have neither.\n\n• **A prioritised roadmap.** Not a list of everything possible, but the order that makes each step work better than doing it alone.\n• **A fixed measurement set.** The queries your buyers actually ask, frozen so a later comparison means something.\n• **Frameworks your team keeps.** Entity checklists, thread evaluation criteria, and reply standards that outlast the engagement.\n• **Review, not execution.** We look at what your team produced and say what is wrong with it.\n\nIf you want the work done rather than taught, that is [AEO management](/services/aeo-management) instead.`,
      },
      {
        heading: 'When is consulting the wrong choice?',
        content: `Being direct about this saves everyone a call.\n\n| Your situation | Better fit |\n| --- | --- |\n| Strong marketing team, no AEO expertise | **Consulting** |\n| No spare capacity to execute | [AEO management](/services/aeo-management) |\n| Want to know where you stand first | [AI visibility audit](/services/ai-visibility-audit) |\n| Comfortable running it, want the tooling | [Self-serve plans](/pricing) |\n\nConsulting fails when nobody on the client side owns execution. A roadmap with no one to run it produces a document, not citations.`,
      },
      {
        heading: 'What does the first 90 days look like?',
        content: `1. **Weeks 1-2: baseline.** Fix the query set and measure before anything changes. Teams that skip this cannot later prove anything moved, and we would rather have an uncomfortable starting number than an unfalsifiable one.\n2. **Weeks 2-4: entity work.** Naming consistency, the Organization record, and the profiles models read. This comes first because nothing downstream compensates for an unresolvable entity — see [entity authority](/blog/entity-authority-ai-citation).\n3. **Weeks 4-10: participation.** Your team answers real questions in threads that already rank, using the criteria we set. The method is in [Reddit marketing for AI search visibility](/blog/reddit-ai-visibility-guide).\n4. **Weeks 10-13: re-measure and adjust.** Same queries, same engines, reported per engine.\n\nNo part of that promises a citation on a date. What it controls is how much good source material exists about you and whether your entity resolves.`,
      },
      {
        heading: 'How do you judge whether it worked?',
        content: `The same way you should judge any vendor in this category, including us: ask what happens when a model replies that it has never heard of the brand. That sentence contains your brand name, and a naive substring match scores it as a mention.\n\nWe shipped that bug ourselves and it inflated two reports to 100% and 75% before we caught it. The fix was to strip denial and clarification sentences before looking for the name. [How to evaluate AI visibility tools](/blog/best-ai-visibility-tools) covers the rest of the questions worth asking.\n\nA flat result is a real outcome. If the number does not move, the useful thing is knowing why, not a reframing of the chart.`,
      },
    ],
    faqs: [
      { q: 'Is consulting cheaper than full management?', a: 'Typically yes, consulting is 30–50% less than managed services. You save on execution fees by using your in-house team.' },
      { q: 'What if we don\'t have an in-house team?', a: 'We recommend AEO Management in that case. Consulting works best when you have at least 2–3 marketing team members who can execute.' },
      { q: 'Can we upgrade to full management later?', a: 'Yes. Many clients start with consulting and upgrade to full management as AEO becomes a priority channel.' },
    ],
  },

  'citation-building': {
    title: 'AI Citation Building Services',
    tag: 'Earned Citations',
    description: 'AI citation building for B2B SaaS \u2014 not local NAP directory listings. We secure mentions in the publications and directories that ChatGPT, Claude, Gemini and Perplexity draw on when answering buyer questions.',
    hero: 'Secure the <em>AI Citations</em> Engines Actually Trust',
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
    guide: [
      {
        heading: 'This is not local NAP citation building',
        content: `Worth saying plainly, because the phrase is contested. Most pages ranking for "citation building" sell local SEO directory work: getting a business name, address and phone number listed consistently across Yelp, Apple Maps and data aggregators, for map-pack rankings.\n\nThat is a real discipline and it is not this one. AI citation building means becoming a source that ChatGPT, Claude, Gemini and Perplexity draw on when answering a buyer question. No address involved, no map pack, different work entirely.`,
      },
      {
        heading: 'What actually earns an AI citation?',
        content: `A model quotes a passage because it answers the question better than the alternatives in front of it. That is the whole mechanism, and it rules out most of what gets sold.\n\n• **First-hand specificity.** "It took three weeks and the import choked above 50k rows" is citable. "Industry-leading performance" is not.\n• **Question-shaped source material.** Threads, documentation and comparisons that map onto what someone is actually asking.\n• **Independence.** A third party describing you carries weight your own page cannot.\n• **Durability.** A good thread answer keeps being read for years, which is why shortcuts that get removed cost more than they appear to.`,
      },
      {
        heading: 'What we will not do',
        content: `| Tactic | Why not |\n| --- | --- |\n| Aged or purchased accounts | Against Reddit's terms; removal takes the citation with it |\n| Coordinated upvoting | Vote manipulation, detectable, and it risks the account |\n| Undisclosed employee comments | Removed on discovery, and the reputational cost lands publicly |\n| Guaranteed citation counts | Nobody controls what a model says |\n\nEvery reply we draft is reviewed by you and posted from your own account, disclosed as you. We do not operate accounts on your behalf and we do not touch upvotes. The reasoning is in [Reddit marketing for AI search visibility](/blog/reddit-ai-visibility-guide).`,
      },
      {
        heading: 'How is it measured?',
        content: `Against a fixed query set, recorded per check including the runs where nobody mentions you, compared per engine rather than as a single blended number.\n\nThe test that matters: ask any vendor what their tool does when a model replies that it has never heard of the brand. That sentence contains the brand name, so a substring match scores the clearest proof of invisibility as a success. We shipped exactly that bug and it inflated two reports before we found it.\n\n[Measuring AI citation ROI](/blog/measure-ai-citation-roi) covers attribution once the number starts moving.`,
      },
    ],
    faqs: [
      { q: 'How many citations do I get per month?', a: 'Depends on the plan: typically 10–25 new high-quality citations per month for active campaigns.' },
      { q: 'Are these paid placements?', a: 'No. All citations are earned: expert commentary, original research placements, directory optimization. No paid link schemes.' },
      { q: 'Do citations actually move the needle?', a: 'Yes, AI engines heavily weight third-party citations. Most clients see 200–400% increase in AI citation frequency within 6 months.' },
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
    guide: [
      {
        heading: 'Why entity work comes before everything else',
        content: `An assistant resolves who you are before it decides whether to recommend you. If "your brand" is an unfamiliar string with no consistent record, there is nothing for good content or third-party mentions to attach to.\n\nThis is why teams with genuinely good content sometimes see no citations at all, while a thinner competitor gets named repeatedly. The competitor is resolvable. [Entity authority and AI citation](/blog/entity-authority-ai-citation) goes into the mechanism.`,
      },
      {
        heading: 'What a resolvable entity actually needs',
        content: `1. **One name, spelled one way.** Casing and spacing included. A brand written two ways across its own properties is two weak entities rather than one strong one.\n2. **A complete Organization record.** Name, URL, logo, description, founding date, contact point, and links to every profile you control.\n3. **Corroboration you do not own.** Profiles, listings and coverage on platforms models read. Self-referential links between your own properties are discounted.\n4. **A definitional sentence.** Somewhere on your site, in plain words: "X is a Y that does Z." Models extract it; most sites open mid-pitch and never state it.\n5. **Consistency across all of it.** The same description everywhere, not five paraphrases.`,
      },
      {
        heading: 'What about Wikidata?',
        content: `Frequently oversold, so here is the honest version. Wikidata is the structured database behind Wikipedia and it feeds Google's Knowledge Graph, so an entry genuinely helps entity resolution.\n\nBut it has a notability bar requiring serious independent references, and an entry that does not clear it gets challenged and deleted — which is worse than never having one, because it is a public record of failing the test. For most early-stage companies it is a consequence of becoming known rather than a route to it.\n\nThe work in the previous section is available today and matters more.`,
      },
      {
        heading: 'How do you know it worked?',
        content: `Entity work is slower to show up than content work and shows up more durably.\n\n• **Immediately checkable:** does your schema validate, does every profile resolve, is the name spelled consistently everywhere.\n• **Weeks:** whether assistants describe you accurately when asked directly, rather than confusing you with a similarly named thing.\n• **Months:** whether you start appearing in category answers where you previously did not.\n\nThe first is a checklist. The second and third need a fixed query set measured before you start, which is what an [AI visibility audit](/services/ai-visibility-audit) establishes.`,
      },
    ],
    faqs: [
      { q: 'Do I need entity optimization if I already have a Google Knowledge Panel?', a: 'Almost certainly yes. Most panels are incomplete or inaccurate. Optimization ensures AI engines pull the right data.' },
      { q: 'How long does entity authority take to build?', a: 'Foundation work takes 60–90 days. Full entity authority across all AI platforms typically takes 6–12 months.' },
      { q: 'Can you get us a Wikipedia page?', a: 'We can help you qualify by securing notable coverage, but Wikipedia has strict notability requirements. No agency can guarantee Wikipedia inclusion.' },
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
    guide: [
      {
        heading: 'What does an AI visibility audit measure?',
        content: `Whether assistants name you when a buyer asks a question they would actually ask, and what they say instead when they do not.\n\n• **Named or not.** For a fixed query set, across multiple engines, recorded per check rather than summarised.\n• **Who gets named instead.** Competitor share on the same queries is usually the more actionable half.\n• **Why.** Entity gaps, missing source material, or a category where nobody is cited consistently.\n• **The baseline.** A dated starting point, including the zeroes, so a later run can be compared honestly.`,
      },
      {
        heading: 'Can you do this yourself?',
        content: `Yes, and you should try before paying anyone, including us.\n\n1. Write down ten questions your buyers genuinely ask, before any vendor shows you theirs.\n2. Ask each one in ChatGPT, Claude, Gemini and Perplexity. Record what you see.\n3. Note who gets named when you do not.\n4. Repeat in a month, with the same questions.\n\nThat afternoon gives you a real baseline and a reality check against every dashboard you will be shown afterwards. What it does not give you is repetition at scale, per-engine rates over time, or the stored history that makes a before-and-after defensible.\n\nWhat you are buying from anyone here is consistency and record-keeping, not access to a secret.`,
      },
      {
        heading: 'What makes an audit worth trusting?',
        content: `| Ask the vendor | Why it matters |\n| --- | --- |\n| What happens on "I have never heard of that brand"? | That sentence contains your name. A substring match scores invisibility as a win |\n| What is the model mix? | 80% of checks on one engine means the overall number describes that engine |\n| Is every check stored, including nulls? | Without the zeroes, any trend can be presented |\n| Can you show a flat result? | A vendor with only success stories is selecting what you see |\n\nWe failed the first one ourselves: two reports scored 100% and 75% on answers where the model said it had never heard of the brand. Fixed, and worth telling you because it is the question that separates measurement from a dashboard.`,
      },
      {
        heading: 'What happens after the audit?',
        content: `An audit that produces a number and no next step is a thermometer sold as treatment.\n\nThe usual sequence: entity work first, because an assistant must resolve who you are before it recommends you; then participation where the category is actually discussed; then re-measurement against the same frozen query set.\n\nIf you want that run for you, [AEO management](/services/aeo-management) is the managed version and [consulting](/services/aeo-consulting) is the guided one. If you would rather run it yourself with tooling, the [plans](/pricing) cover it.`,
      },
    ],
    faqs: [
      { q: 'How long does the audit take?', a: 'Typically 10–14 business days from kickoff to delivery.' },
      { q: 'What do I get at the end?', a: 'A detailed PDF report, raw query data, competitor benchmarks, and a 60-minute walkthrough call.' },
      { q: 'Is this the same as the free audit?', a: 'No, the free audit is a lighter 30-minute assessment. The paid audit is comprehensive and includes 100+ queries, full benchmarking, and a detailed action plan.' },
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
    alternates: { canonical: `https://www.aeorank.tech/services/${params.slug}` },
    openGraph: {
      title: service.title,
      description: service.description,
      type: 'website',
      url: `https://www.aeorank.tech/services/${params.slug}`,
      // Points at the generated card in app/opengraph-image.js. Declaring
      // openGraph here replaces the file-convention image, so it is named
      // explicitly. No content hash: that changes whenever the card does.
      images: ["/opengraph-image"],
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.aeorank.tech' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.aeorank.tech/services' },
      { '@type': 'ListItem', position: 3, name: service.title, item: `https://www.aeorank.tech/services/${params.slug}` },
    ],
  }

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: { '@id': 'https://www.aeorank.tech/#organization' },
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
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <section className="section">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <span className="section-tag">( {service.tag} )</span>
          <h1
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
            <Link href="/signup" className="btn btn-ghost">
              Get Started
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
            <Link href="/signup" className="btn btn-ghost">
              Get Started
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

      {/* These pages averaged ~151 extractable words against SERPs held by
          agencies with named clients and full explainers. The guide sits
          inside the commercial page: it answers the question a researcher
          arrives with, without removing the offer for a reader who has
          already decided. */}
      {service.guide ? (
        <section className="section">
          <div className="container-narrow">
            {service.guide.map((sec, i) => (
              <div key={i} style={{ marginBottom: 30 }}>
                <h2 style={{ fontSize: 24, lineHeight: 1.3, marginBottom: 14, textAlign: "left" }}>
                  {sec.heading}
                </h2>
                {sec.content.split("\n\n").map((b, j) => renderBlock(b, j))}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Commercial pages linked only to /, /contact, /signup and /services.
          Nothing pointed back into the blog, so the funnel ran one way and
          the posts that explain this service had no path in. */}
      {RELATED[params.slug] ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container-narrow">
            <h2 style={{ fontSize: 22, marginBottom: 16, textAlign: "left" }}>
              Read more on this
            </h2>
            <ul style={{ paddingLeft: 22, lineHeight: 1.9 }}>
              {RELATED[params.slug].map((r) => (
                <li key={r.slug}>
                  <Link href={`/blog/${r.slug}`} style={{ color: "var(--accent)" }}>
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </MarketingLayout>
  );
}
