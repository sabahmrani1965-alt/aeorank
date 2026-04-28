import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";

const posts = {
  'how-to-get-cited-by-chatgpt': {
    tag: 'AEO · Strategy',
    title: 'Getting Your SaaS Cited by ChatGPT: What Actually Works in 2026',
    description: 'After six months of testing what moves AI citations and what doesn\'t, here\'s the honest version. Entity work matters more than content volume. Third-party citations matter more than either.',
    date: 'April 10, 2026',
    updated: '2026-04-10',
    readTime: '9 min read',
    author: 'Ilyas Mrani',
    sections: [
      {
        heading: null,
        content: `Most articles on "how to get cited by ChatGPT" are recycled SEO advice with the keyword swapped. They tell you to write "helpful, authoritative content," build backlinks, and implement schema — the same playbook that was written for Google in 2019.\n\nThat advice isn\'t wrong, exactly. It\'s just missing the point. AI citation doesn\'t work like ranking.\n\nOver the last year we\'ve tested what actually moves citations for B2B SaaS brands — entity work, content rewrites, different citation sources, schema variations, outreach patterns. A lot of things that feel important don\'t move the needle. A few things that feel unglamorous move it a lot. This is the honest version.`
      },
      {
        heading: 'The one thing nobody tells you about ChatGPT citations',
        content: `ChatGPT doesn\'t "rank" your page. It doesn\'t pick the best-written article. What it does is retrieve a set of source snippets based on its search and internal knowledge, then synthesize an answer that reflects the consensus across those snippets.\n\nThe brands cited aren\'t the ones with the best blog posts. They\'re the brands AI has built a strong internal representation of — because they appear consistently across many trusted sources, described in compatible ways.\n\nThis matters because it means publishing more content isn\'t the fix. If the underlying entity is weak, great content just sits there. Fix the entity first.`
      },
      {
        heading: 'Start with the knowledge graph, not the blog',
        content: `When we audit new clients, we almost always find the same thing: the company is invisible or barely visible in Google\'s Knowledge Graph. No panel. Sparse Wikidata. Inconsistent descriptions across directories. Google doesn\'t really know what they are.\n\nThat matters because ChatGPT, Perplexity, and Google AI all lean on structured entity data during retrieval and synthesis. If you\'re not a clean entity, you\'re a weak candidate for citation — no matter how many backlinks you have.\n\nThe fix isn\'t dramatic. It\'s mostly unsexy cleanup:\n\n• Audit every place your brand appears (crunchbase, LinkedIn, G2, product databases, Wikidata) and make sure the descriptions are consistent and current.\n• Implement Organization schema with accurate sameAs links to every canonical profile.\n• File a Wikidata entry if you qualify (most Series A+ SaaS do).\n• Optimize your Google Business Profile even if you\'re SaaS — it feeds the knowledge panel.\n\nNone of this feels like marketing. But it\'s the highest-leverage work we do, by a wide margin.`
      },
      {
        heading: 'Answer the specific questions, not the category',
        content: `Here\'s the mistake most content teams make: they write for the category. "The Ultimate Guide to Data Observability." "Everything You Need to Know About CI/CD."\n\nChatGPT doesn\'t want your guide. It wants the answer to the exact question the user asked. And the user didn\'t ask "tell me about CI/CD." They asked something like "what\'s the best CI tool for a small team using a monorepo."\n\nSo the content that gets cited isn\'t the comprehensive overview. It\'s the specific-question page that answers a specific buyer question in the first paragraph, then gives the supporting reasoning.\n\nRewrite your top 20 buyer questions as standalone pages, each with the answer in the first 2–3 sentences. Yes, this feels weird. It\'s supposed to. That\'s the format AI engines reward.`
      },
      {
        heading: 'Third-party citations do more work than you think',
        content: `Here\'s something counterintuitive: a single mention of your brand in a well-regarded third-party publication often outperforms ten blog posts on your own site for AI citation purposes.\n\nAI engines don\'t just read your content. They build their picture of your brand from everywhere your brand is discussed. If Dark Reading, TechCrunch, or InfoWorld describes your product in a specific way, that description weights heavily when the AI decides whether and how to cite you.\n\nThis is why earned media matters so much for AEO, and why most SaaS companies are underinvesting in it. A thoughtful expert-contribution program or a piece of original research that gets referenced externally is worth more than a huge internal content output.`
      },
      {
        heading: 'Schema is table stakes, not a growth lever',
        content: `People ask us about schema a lot. The honest answer: you need it, but it\'s not going to move citations by itself.\n\nOrganization schema, Product schema, FAQ schema — implement them properly and you\'re giving AI crawlers a cleaner signal. But if your entity is weak and your citations are thin, adding schema won\'t rescue you. It\'ll just make the weak signals slightly cleaner.\n\nTreat schema like plumbing. Get it right, forget about it, move on to what actually moves the metric.`
      },
      {
        heading: 'What to measure',
        content: `You need two numbers, tracked weekly:\n\nFirst, citation frequency across your top 30–50 buyer queries. Run them manually (or with tooling — there are options now) against ChatGPT, Perplexity, and Google AI. Track how often your brand appears.\n\nSecond, share-of-voice versus your top 3 competitors. This matters more than absolute count, because AEO is a relative game. You\'re trying to displace somebody.\n\nEverything else — referral traffic from AI, pipeline attribution, downstream revenue — is useful but noisy. Citation frequency and share-of-voice are the leading indicators that give you something real to optimize against.`
      },
      {
        heading: 'Timeline: be realistic',
        content: `The best case we\'ve seen is meaningful citation gains within 60 days, and that\'s when everything was already primed (good content, decent entity setup, just needed citation-building push). More typical is 3–4 months to see the needle move.\n\nFor companies starting from a weak entity baseline, expect 6+ months before the work really compounds. That\'s not pessimistic — it\'s realistic. AI engines update their internal representations slowly, and the work is cumulative.\n\nIf someone promises faster results, ask what they\'re actually measuring. "Appearing in Perplexity once" is not the same as "being consistently cited across major AI engines for your highest-intent queries."`
      },
      {
        heading: null,
        content: `AEO is new enough that a lot of what\'s being written about it is speculation. What we\'ve laid out here is based on actual client work and actual citation tracking over the last year — which is not a long time, but it\'s what we have. The landscape will keep shifting. What works today may not work as well in 12 months.\n\nIf you\'re trying to figure out whether to invest in this for your brand, the first step isn\'t reading more articles. It\'s auditing where you stand right now, with real queries your buyers actually type. That\'s what our free audit does. We\'re happy to run one for you.`
      },
    ],
  },

  'measure-ai-citation-roi': {
    tag: 'AEO · Measurement',
    title: 'Measuring AEO ROI Without Lying to Yourself',
    description: 'Most AI attribution is guesswork dressed up as data. Here\'s the honest framework we use to figure out whether AEO is actually working, what it\'s worth, and when to stop.',
    date: 'April 3, 2026',
    updated: '2026-04-03',
    readTime: '7 min read',
    author: 'Ilyas Mrani',
    sections: [
      {
        heading: null,
        content: `A client asked us last month: "how do I know AEO is actually driving pipeline versus just showing up in reports because it sounds good?"\n\nThat\'s the right question. And the honest answer is that most AI citation attribution right now is guesswork — some of it reasonable, some of it wishful thinking. If you\'re going to invest in AEO, you need to know the difference.\n\nHere\'s the framework we\'ve been using to measure it honestly, including what it does measure, what it doesn\'t, and where you\'ll have to accept some fuzzy data.`
      },
      {
        heading: 'The attribution problem is real',
        content: `AI-sourced traffic is harder to attribute than almost any other channel. A buyer can see your brand name in ChatGPT, remember it, and Google you three days later. Your analytics will say "organic search." Your CRM will say "unknown source." The AI gets no credit.\n\nThis is worse than social, worse than podcast — at least those channels sometimes leave a UTM or a referral. AI citations often leave nothing. And they\'re the highest-intent moment in the buyer\'s research, so the invisible attribution hurts the most.\n\nYou can\'t solve this problem completely. You can get pretty close with the right combination of direct and proxy measurement. That\'s what this framework is.`
      },
      {
        heading: 'What you can measure directly',
        content: `Start with the data that\'s actually unambiguous:\n\nReferral traffic. Filter Google Analytics or your analytics tool for referrers from chat.openai.com, perplexity.ai, bing.com (for Copilot), and specific AI-adjacent domains. This undercounts but it\'s real data.\n\nSurvey responses. Add "how did you find us?" to your signup or demo request form with AI assistants as an option. People will tell you. You\'ll be surprised how quickly this number grows.\n\nDirect traffic patterns. If direct traffic (people typing your URL) spikes after a citation campaign, that\'s often AI doing its work — buyers seeing you in AI and typing your domain later. Correlation isn\'t proof, but it\'s signal.\n\nBranded search volume. Same idea. If branded searches for your company increase month-over-month while nothing else changed, AI exposure is often the cause.`
      },
      {
        heading: 'Citation tracking is your leading indicator',
        content: `Before you can measure revenue impact, you need to measure whether you\'re actually getting cited more. This is the input metric. If this isn\'t moving, nothing downstream will move either.\n\nPick 30–50 queries that represent high-intent buyer questions in your category. Run them weekly against ChatGPT, Perplexity, Google AI Overviews, Bing Copilot, Claude. Track:\n\nWhether your brand appears at all. Position if cited (primary recommendation vs. mentioned in a list). Accuracy of how you\'re described. Share-of-voice versus your top 3 competitors.\n\nThis is tedious work, but it\'s real. Automate where you can, but don\'t skip it. This is the closest thing AEO has to a clean performance metric.`
      },
      {
        heading: 'Connecting citations to pipeline',
        content: `The hard part. Here\'s what we\'ve found actually works:\n\nTag AI-suspected leads in the CRM. When a lead comes in via "unknown" source but branded search volume just jumped, or referral traffic from AI platforms spiked the same week, flag those leads for tracking. Over 90 days, you\'ll have a cohort.\n\nLook at the conversion behavior. Leads influenced by AI research typically convert faster and ask more specific product questions on demo calls. Sales will notice before you do — ask them "are you hearing buyers mention ChatGPT or Perplexity more?" That qualitative data is almost as valuable as the quantitative.\n\nMatch timing. If AEO campaigns started in January and your unattributed-but-converting pipeline starts climbing in March, that\'s the fingerprint of AI attribution.\n\nIt\'s not airtight. But combined with citation tracking moving in the right direction, it\'s enough signal to make budget decisions.`
      },
      {
        heading: 'What NOT to measure',
        content: `A few vanity metrics that show up in AEO reporting and shouldn\'t drive decisions:\n\n"Number of AI platforms we\'re cited on." Appearing once on Perplexity doesn\'t mean you\'re winning AEO. Consistency and share-of-voice matter more than breadth.\n\n"Total AI-sourced impressions." Nobody knows what this number actually is. Any tool claiming to give it to you is guessing.\n\n"AI citation volume." Raw count doesn\'t mean much without context. Ten citations for a long-tail query nobody asks is worth less than one citation for your category\'s top buyer query.\n\nIf a metric sounds impressive and you can\'t connect it to a business decision, it\'s a vanity metric.`
      },
      {
        heading: 'When to keep spending, when to stop',
        content: `The decision framework: if citation frequency and share-of-voice are climbing after 90 days, keep going. If they\'re flat, something\'s wrong with the plan — either execution is off or the category isn\'t ready for AEO yet.\n\nIf after 6 months you have rising citations but no pipeline impact showing up anywhere (direct, branded search, sales-reported mentions), you may have an attribution infrastructure problem, or your ICP isn\'t using AI for research as much as you thought. Both are fixable, but worth diagnosing honestly.\n\nIf after 12 months you have citations AND pipeline lift, you\'re in the compounding zone. This is where AEO economics start looking very good compared to paid.`
      },
      {
        heading: null,
        content: `AEO measurement will get cleaner as tooling matures. Right now it\'s a mix of hard data, reasonable proxies, and honest qualitative signal from sales. Use all three.\n\nThe companies winning at AEO right now aren\'t the ones with the most sophisticated attribution models. They\'re the ones taking their best honest read of the data and making decisions from it. Perfect attribution isn\'t on the menu. Directional honesty is.`
      },
    ],
  },

  'entity-authority-ai-citation': {
    tag: 'Entity SEO · AEO',
    title: 'The Real Reason Some SaaS Brands Get Cited by AI and Others Don\'t',
    description: 'Spoiler: it\'s almost never the content. It\'s entity authority. Here\'s what that actually means and why most SaaS companies are bad at it.',
    date: 'March 27, 2026',
    updated: '2026-03-27',
    readTime: '11 min read',
    author: 'Ilyas Mrani',
    sections: [
      {
        heading: null,
        content: `When a client comes to us frustrated that ChatGPT keeps citing their competitor and not them, the first thing we check isn\'t their content. It\'s the knowledge graph.\n\nNine times out of ten, the answer is there. The competitor has a clean entity profile — Google knows what they are, Wikidata recognizes them, their description is consistent across every platform. The frustrated client has none of that. They\'re invisible to AI at the entity level, and no amount of great content fixes that.\n\nEntity authority is the single most misunderstood concept in AEO. People hear it and assume it\'s a vague marketing term. It\'s not. It\'s a specific, technical thing — and it\'s the main reason some brands dominate AI answers while equivalent-quality competitors don\'t.`
      },
      {
        heading: 'What "entity" actually means',
        content: `When AI engines read the web, they don\'t just process text. They try to identify entities — specific things like companies, products, people, concepts — and build an internal representation of each one. Think of it as a profile the AI maintains about your brand.\n\nThat profile is built from thousands of signals: your website, your knowledge graph entry, third-party mentions, directory listings, Wikidata data, Wikipedia, the consistent (or inconsistent) way your brand gets described everywhere it appears.\n\nA strong entity is one AI has confident information about. A weak entity is one AI is fuzzy on, mixes up with competitors, or has contradictory data about.\n\nWhen an AI decides whether to cite you, it\'s pulling from that profile. Strong profile = more likely to be cited, more accurately described. Weak profile = rare citations, often wrong.`
      },
      {
        heading: 'How to tell if your entity is weak',
        content: `Quick diagnostic. Google your exact brand name.\n\nDo you get a knowledge panel on the right side? If yes, is it accurate and complete — logo, description, founding year, key people?\n\nNow search your brand name in Wikidata. Do you have an entry? If yes, does it link to your website, LinkedIn, key people?\n\nSearch your brand in ChatGPT: "what is [your brand]?" Does it know what you do? Is the description accurate?\n\nIf the answer to any of these is "no" or "kind of", you have an entity problem. Most SaaS companies under 100 employees do. Even many Series B+ companies have weaker entity profiles than they think.`
      },
      {
        heading: 'Three pillars that make an entity strong',
        content: `Recognition, relevance, trust. Simple framework, and each pillar takes different work.\n\nRecognition is about existing. Are you in the databases AI engines train on? Knowledge graph, Wikidata, major industry directories, Crunchbase, LinkedIn, G2, comparable platforms. If you\'re missing from these, you\'re not going to be cited — AI doesn\'t know you exist in any structured way.\n\nRelevance is about being described correctly. When sources describe what you do, do they describe it consistently? If five different articles describe your product in five different ways, AI gets confused. It\'s not sure what to cite you for.\n\nTrust is about external validation. Being mentioned by publications AI engines treat as authoritative. Expert quotes in industry coverage. Analyst reports. Academic references. This is what separates "known entity" from "authoritative entity that AI will confidently cite."`
      },
      {
        heading: 'The work, ranked by impact',
        content: `If you\'re building entity authority from scratch, here\'s the order that gives you the most leverage for the least effort:\n\nFirst, fix inconsistencies. Audit every major platform where your brand appears. Make sure your name, description, founding date, and categorization are identical. This sounds trivial. It\'s not. Inconsistencies across five platforms are actively hurting you.\n\nSecond, claim and optimize your knowledge panel. Request editing access via Google Business Profile. Update the description. Add sameAs links to every canonical profile you own. This single move often unlocks meaningful improvement.\n\nThird, file a Wikidata entry if you qualify. Wikidata feeds a lot of AI training data. Most SaaS companies with any press coverage can qualify. The effort is a few hours and the return is long-term.\n\nFourth, build the citation foundation. Start earning mentions in industry publications that AI engines actually use as sources. This is slower work, but it\'s where trust comes from.\n\nFifth and last, Wikipedia. Wikipedia has strict notability requirements and you usually can\'t directly edit your own page. But if you build enough third-party coverage, a Wikipedia page becomes possible. It\'s a long game, and it\'s a massive signal when it lands.`
      },
      {
        heading: 'Why SaaS companies are uniquely bad at this',
        content: `SaaS companies — especially B2B ones — tend to neglect entity work because they don\'t feel like they need it. They\'re not going viral. They\'re not trying to rank for consumer queries. Their buyers are "already in market."\n\nThat was true until AI answer engines started shifting the discovery layer. Now entity authority is table stakes. The B2B SaaS companies winning in ChatGPT right now are almost always the ones that quietly did this work early — either intentionally or as a byproduct of being older and more established.\n\nThe ones losing are usually the opposite: newer, scrappier, better products, but AI doesn\'t know them well enough to recommend them confidently.\n\nIf that\'s you, fixing the entity problem is the highest-ROI move you can make. It\'s not exciting. It won\'t show up in a Twitter thread. But it\'s the foundation everything else in AEO builds on.`
      },
      {
        heading: null,
        content: `Most of what you read about AEO focuses on content and citations. Those matter. But they\'re second-order effects of a strong entity. Without the entity foundation, great content gets read and forgotten, not cited.\n\nIf you remember one thing from this article: audit your entity presence before you audit anything else. It\'s probably where the gap is.`
      },
    ],
  },

  'optimize-for-perplexity': {
    tag: 'AEO · Perplexity',
    title: 'Perplexity Is Different. Here\'s What It Actually Wants.',
    description: 'Everyone is optimizing for ChatGPT, but Perplexity is where the highest-intent technical buyers actually research. It retrieves differently. It weights differently. Here\'s what matters.',
    date: 'March 20, 2026',
    updated: '2026-03-20',
    readTime: '7 min read',
    author: 'Ilyas Mrani',
    sections: [
      {
        heading: null,
        content: `Perplexity doesn\'t get the same attention as ChatGPT in AEO conversations, which is a mistake. For technical B2B categories — DevOps, data, cybersecurity, developer tools — Perplexity is where the highest-intent research actually happens.\n\nThe buyers using Perplexity are disproportionately the ones who cite sources, verify claims, and make purchase recommendations. They\'re often further along in the buying cycle than ChatGPT users. If your ICP is technical, you cannot ignore Perplexity.\n\nBut Perplexity isn\'t ChatGPT with a different name. It works differently. What gets cited on one platform often doesn\'t on the other. Here\'s what Perplexity actually rewards.`
      },
      {
        heading: 'Live search changes everything',
        content: `The biggest functional difference: Perplexity does real web searches for basically every query. It\'s not just drawing on trained knowledge — it\'s pulling fresh results and synthesizing them on the fly.\n\nWhat this means for you:\n\nRecency matters way more than on ChatGPT. If your content is three years old and the competitor\'s is six months old, guess who gets cited. Keep important pages refreshed.\n\nTraditional SEO performance leaks into Perplexity citations. Pages that rank well on Google for a query are more likely to surface in Perplexity\'s search layer and therefore more likely to be cited. Your SEO work isn\'t wasted — it\'s an input.\n\nCrawl accessibility matters. If your content is slow, behind JS that doesn\'t render cleanly, or blocks crawlers, Perplexity may not pick it up.`
      },
      {
        heading: 'Perplexity actually drives clicks',
        content: `Worth calling out: Perplexity cites its sources with clickable links. When it cites you, you get a referral. That\'s not true of ChatGPT (at least not to the same degree).\n\nThis makes Perplexity citations economically measurable in a way other AI citations aren\'t yet. If your Perplexity citations go up, you\'ll see referral traffic from perplexity.ai climb in your analytics. It\'s the cleanest feedback loop in current AEO work.\n\nIt also means content format matters more for Perplexity. People see the citation, click through, and evaluate. A page that\'s great for AI extraction but terrible for human reading will get cited but fail to convert. Optimize for both.`
      },
      {
        heading: 'What Perplexity actually extracts',
        content: `We\'ve watched Perplexity results on hundreds of queries over the last six months. A few consistent patterns:\n\nLeading with a direct answer works. The first sentence or two of your page often gets extracted verbatim. If your page starts with "Let me tell you a story about..." — too bad, Perplexity wanted the answer.\n\nStructured lists get pulled heavily. Numbered steps, bullet points, comparison tables. Perplexity likes clean structure because it\'s easy to extract and easy to present.\n\nSpecific numbers and data earn citations. A page that says "our benchmark showed 42% faster queries" is more likely to be cited than one that says "noticeably faster." Perplexity prefers sources that add hard information.\n\nBalanced content outperforms promotional content. If your page reads like a sales page, Perplexity tends to favor neutral comparison sources over you. Write like a researcher, not a marketer.`
      },
      {
        heading: 'The publications Perplexity leans on',
        content: `Perplexity draws heavily from high-authority, content-dense sites in technical spaces. A non-exhaustive list of sources we see cited frequently:\n\nPrimary technical media: The Register, InfoWorld, Dark Reading, TechCrunch (selective), The Information.\n\nCommunity and practitioner content: Hacker News discussions, Dev.to, Stack Overflow, relevant Reddit subs (yes, really).\n\nReference and comparison platforms: G2, Capterra, TrustRadius — Perplexity pulls review content heavily.\n\nOriginal research and benchmarks: If you\'ve ever wondered why some brand keeps getting cited in Perplexity despite a smaller footprint, it\'s often because they\'ve published something other people reference.\n\nIf you want to show up in Perplexity, earning placements or mentions in these kinds of sources is higher-leverage than publishing more on your own blog.`
      },
      {
        heading: 'A tactical Perplexity audit you can do today',
        content: `Spend 30 minutes and you\'ll learn a lot:\n\nPick 10 queries your buyers actually ask. Type each into Perplexity. Note: does your brand show up? If yes, where? What sources does it cite instead? How accurately does it describe your category position?\n\nNow look at the sources Perplexity IS citing. Can you get your content or expert commentary placed there? That\'s your highest-ROI Perplexity work for the next 90 days.\n\nCheck if your pages are cleanly crawlable. If your main pages require JavaScript to render, Perplexity may not index them well. Test with view-source.\n\nFinally, look at how you\'re described. If the description is inaccurate or generic, the problem is usually that the sources Perplexity trusts describe you that way. Fix it at the source — update Wikipedia, Wikidata, G2 profile, whatever\'s feeding the wrong description.`
      },
      {
        heading: null,
        content: `Perplexity is going to keep growing in technical B2B circles. The buyers using it most are the ones you most want reaching you — senior engineers, CTOs, technical buyers with real decision authority. Getting cited here is disproportionately valuable.\n\nAnd because Perplexity leaks back measurable traffic, it\'s often the easiest platform to show ROI on — making it a good first target when you\'re building the business case internally for AEO work.`
      },
    ],
  },

  'aeo-vs-seo': {
    tag: 'AEO vs SEO',
    title: 'AEO vs SEO: Stop Pretending They\'re the Same Job',
    description: 'Most agencies selling AEO are just rebranding SEO services. They\'re not the same discipline. Here\'s how they actually differ and why both still matter.',
    date: 'March 13, 2026',
    updated: '2026-03-13',
    readTime: '8 min read',
    author: 'Ilyas Mrani',
    sections: [
      {
        heading: null,
        content: `A lot of SEO agencies pivoted to "AEO services" in 2024–2025. Most of what they\'re selling is SEO with a new label. Better schema, faster pages, more comprehensive content — all useful, none of it specific to AEO.\n\nThat\'s caused a useful but misleading framing: AEO is "just SEO 2.0." It isn\'t. There\'s overlap, but the disciplines optimize for fundamentally different things and the work doesn\'t fully transfer.\n\nIf you\'re deciding where to invest budget, or evaluating an agency, you need to understand what\'s actually different — and what isn\'t.`
      },
      {
        heading: 'The fundamental difference',
        content: `SEO optimizes for ranking. AEO optimizes for citation.\n\nSEO wins when your page appears in the top ten search results. You get a click. The user lands on your site. You own the next interaction.\n\nAEO wins when the AI recommends your brand. The user doesn\'t necessarily click anything. You never own the interaction. What you get is an implicit endorsement in the AI\'s answer — which either lives with the user or doesn\'t.\n\nBoth are valuable, but the leverage is different. SEO gives you direct traffic. AEO gives you mindshare in the moment of recommendation, which later converts into branded search or direct traffic.\n\nOne channel is measured in clicks. The other in mindshare. Pretending they\'re the same metric means measuring the wrong thing.`
      },
      {
        heading: 'Where the overlap is real',
        content: `The honest version: a lot of work benefits both channels.\n\nStrong technical SEO helps AEO. Fast pages, clean markup, good internal linking — AI engines crawl these the same way search engines do. If your site is a mess technically, fixing it helps both.\n\nHigh-quality content helps both. A comprehensive, well-structured answer page can rank on Google AND get cited by Perplexity. No contradiction.\n\nBacklinks still matter. AI engines weight trusted third-party mentions, and backlinks from authoritative domains are a proxy signal for that trust.\n\nSchema markup helps both. Cleaner data for crawlers is cleaner data for everything.\n\nSo if you\'re doing good SEO, maybe 40–50% of that work directly supports AEO. That\'s real. That\'s useful.`
      },
      {
        heading: 'Where the disciplines diverge',
        content: `The other 50–60% is genuinely different work. This is where most "AEO services from SEO agencies" fall short.\n\nEntity authority is an AEO-specific discipline. Knowledge graph, Wikidata, structured entity data — SEO cares about some of this, but AEO cares about it intensely. This is where most SaaS companies have the biggest gap and where SEO-trained teams usually aren\'t strong.\n\nAnswer formatting is different. SEO writers have been trained to write for featured snippets (which are related) but the answer-first format AEO rewards is tighter, less meandering, and often uncomfortable to write. Many SEO writers over-write it.\n\nThird-party citation building is fundamentally different from link building. You\'re not trying to get a link. You\'re trying to get a specific kind of mention, in a specific kind of publication, that AI engines use as training or retrieval data. Different outreach, different targeting.\n\nMeasurement is totally different. SEO measures rankings, traffic, conversions. AEO measures citation frequency, share-of-voice, accuracy of description, AI-sourced referral. Most SEO dashboards can\'t show you any of this.`
      },
      {
        heading: 'Should you do both?',
        content: `Yes, basically always. Here\'s why:\n\nSEO still works for a huge chunk of buyer discovery. Most buyers aren\'t exclusively using AI yet. You need the SEO foundation to capture traditional organic traffic.\n\nSEO feeds AEO. Pages that rank well give Perplexity and other AI engines more signal about your brand. Good SEO makes AEO easier.\n\nAEO captures what SEO is starting to lose. As more research shifts to AI, a pure SEO strategy slowly leaks relevance. AEO covers the gap.\n\nThe companies that will win over the next few years aren\'t choosing between SEO and AEO. They\'re running both, coordinated, with different specialists handling each.`
      },
      {
        heading: 'How to allocate budget',
        content: `Rough rule of thumb based on what we see with clients:\n\nIf you have no SEO foundation yet: invest 70/30 SEO/AEO. Build the foundation first. Layer AEO on top.\n\nIf you have mature SEO with strong rankings: flip it. 30/70 SEO maintenance vs. AEO investment. Defensive SEO work and aggressive AEO growth work.\n\nIf you\'re in a highly technical B2B space (DevOps, data, cybersecurity, developer tooling): shift earlier toward AEO. Your buyers are using AI more. The behavioral shift is faster.\n\nIf your buyers are non-technical and older-demographic: shift slower. Google still dominates some buyer groups and probably will for another few years.\n\nThere\'s no single right answer. But "50/50 split across the board" is almost never right either. Your allocation should reflect your specific buyer behavior, which you can see in your analytics and sales conversations if you look.`
      },
      {
        heading: null,
        content: `The agencies quietly winning in 2026 are the ones treating AEO as a distinct discipline with its own practitioners, not as an SEO add-on. If you\'re evaluating a partner, the easiest tell is: ask them to describe what they\'d do that\'s specifically different from SEO. If they can\'t answer cleanly, they\'re selling rebrand, not practice.`
      },
    ],
  },

  'google-ai-overviews-guide': {
    tag: 'Google AI · AEO',
    title: 'Google AI Overviews: What We\'ve Learned After a Year of Optimization',
    description: 'AI Overviews went from annoying feature to dominant placement. Here\'s what gets featured, what doesn\'t, and what\'s changed since launch.',
    date: 'March 6, 2026',
    updated: '2026-03-06',
    readTime: '10 min read',
    author: 'Ilyas Mrani',
    sections: [
      {
        heading: null,
        content: `Google AI Overviews had a rough launch. Incorrect answers. Moments of comedy (glue on pizza). A lot of content marketers writing it off as temporary.\n\nA year later, it\'s not temporary. AI Overviews now appear on a large and growing share of B2B queries, and for many commercial categories they sit above the traditional results. If you\'re not showing up in them, Position 1 means less than it used to.\n\nWe\'ve been tracking client AI Overview performance closely since they became meaningful. Here\'s what\'s actually changed, what works, and where the traps are.`
      },
      {
        heading: 'What AI Overviews actually do',
        content: `When AI Overviews appear, Google generates a synthesized answer from multiple sources, with inline citations. Users can expand the answer, click source links, or scroll past to traditional results.\n\nCritically: the sources cited in the AI Overview aren\'t always the top-ranking pages. Google is explicitly picking which sources to synthesize from, often prioritizing pages with specific formatting characteristics (direct answers, structured content) over pages that simply rank highest organically.\n\nThis matters because it means a new game is being played on top of traditional SEO. You can rank well and still not get cited in the AI Overview. You can rank less well and still get featured. The rules are adjacent to SEO, but not identical.`
      },
      {
        heading: 'What we\'ve seen work',
        content: `Across our client work and testing over the past year, a few patterns keep repeating:\n\nContent that directly answers the query in the first paragraph gets extracted most often. This is the biggest single tactical change. If your article spends 300 words on setup, Google\'s AI often skips you for a more direct competitor.\n\nSpecific numerical data gets pulled heavily. "Our benchmark shows X" performs better than "in our experience, this is fast." AI Overviews love quantifiable claims they can cite.\n\nRecent content outperforms older content, all else equal. Google appears to weight freshness more in AI Overview selection than in traditional rankings. Update your high-value pages.\n\nSchema markup helps, especially FAQ and HowTo schema. We\'ve seen meaningful lift from implementing comprehensive schema on pages that were already ranking.\n\nContent that cites multiple third-party sources gets favored. Pages that function as research syntheses (linking out to other authoritative sources within the content) often outperform pure first-party content. Counterintuitive, but real.`
      },
      {
        heading: 'What doesn\'t work (but feels like it should)',
        content: `Some things we\'ve tested that produced surprisingly little lift:\n\nAggressive content expansion. Writing a 6,000-word mega-guide for every topic. Google does not appear to systematically favor length for AI Overview selection. In some cases, concise pages win.\n\nPure keyword targeting. Writing explicitly for "AI Overview inclusion keywords" (yes, people sell these) doesn\'t consistently work. Google\'s selection process weights utility more than keyword match.\n\nE-E-A-T signals in isolation. Author bios and expertise credentials help, but don\'t move the needle alone. They\'re part of a broader trust picture — necessary, not sufficient.\n\nSchema without content quality. Putting FAQ schema on thin content doesn\'t rescue it. Schema amplifies good content, it doesn\'t create it.`
      },
      {
        heading: 'The traffic question',
        content: `A real tension: AI Overview inclusion is prestigious, but does it actually drive traffic? The honest answer: less than traditional Position 1, but more than expected.\n\nWhat we\'ve observed: when clients get cited in AI Overviews for commercial queries, traffic from those queries typically drops 15–30% vs. what Position 1 would have gotten pre-AI-Overview. Some users get their answer from the overview and don\'t click. Some do — especially for complex or commercial queries where they want to verify.\n\nBut — and this matters — cited brands in AI Overviews appear to get stronger branded search lift. The implicit endorsement of being the AI-cited source seems to feed into how buyers remember the brand.\n\nSo the real calculation isn\'t "AI Overview citation vs. Position 1 clicks." It\'s "AI Overview citation plus reduced-but-still-meaningful clicks plus brand lift" versus "Position 1 clicks but no AI citation." The former usually wins for B2B, especially for considered purchases.`
      },
      {
        heading: 'Practical optimization workflow',
        content: `If you\'re trying to improve AI Overview performance on specific queries, here\'s the approach that\'s working for us:\n\nIdentify queries where AI Overview appears. Use Google Search Console\'s AI Overview filter (available in 2025 and improved in 2026) to see which of your pages are being shown in AI Overview results.\n\nFor each query, inspect the AI Overview. See what\'s being cited. See how your page compares.\n\nRewrite to lead with the direct answer. If your current page buries the answer, move it to the first paragraph. This alone often produces movement.\n\nAdd specific data where possible. Benchmarks. Percentages. Version numbers. Concrete specifics that an AI can quote.\n\nUpdate freshness. Change your page\'s updated date. Refresh stats. Add recent context.\n\nAdd or improve FAQ schema for the key questions around the topic.\n\nThen wait 2–6 weeks. Google\'s AI Overview selection updates on its own cadence. Don\'t expect overnight changes.`
      },
      {
        heading: 'Where this is headed',
        content: `AI Overviews aren\'t going to stay as they are. Google has been shipping rapid changes — expanded query coverage, new content types (video, product comparisons), richer citation formats. By late 2026 the feature will look meaningfully different from today.\n\nBut the underlying direction is stable: Google is making AI-synthesized answers more prominent, and traditional organic listings less prominent, for more query types. The brands preparing for that world — optimizing for citation and entity authority, not just ranking — will be dramatically better positioned than brands running a pure 2023 SEO playbook.\n\nMost of our client work in this area pays for itself through the brand lift and still-meaningful referral traffic. Almost nobody regrets starting early. Many companies waiting to see if AI Overviews "stick" are now playing catch-up on the same fundamentals we\'ve been implementing for a year.`
      },
      {
        heading: null,
        content: `If you\'re on the fence about investing in AI Overview optimization: the fundamentals are the same fundamentals that help ChatGPT and Perplexity citation. Any work you do here compounds across AEO broadly. You\'re not optimizing for one feature — you\'re building capability that applies across every AI answer surface, which is where search is going.`
      },
    ],
  },
}

const allPosts = Object.entries(posts).map(([slug, post]) => ({ slug, ...post }))

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const post = posts[params.slug]
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.updated,
      authors: [post.author],
    },
    alternates: {
      canonical: `https://aeorank.tech/blog/${params.slug}`,
    },
  }
}

export default function BlogPost({ params }) {
  const post = posts[params.slug]
  if (!post) notFound()

  const related = allPosts.filter(p => p.slug !== params.slug).slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.updated,
    dateModified: post.updated,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'AEOrank', url: 'https://aeorank.tech' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://aeorank.tech/blog/${params.slug}` },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aeorank.tech' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://aeorank.tech/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://aeorank.tech/blog/${params.slug}` },
    ],
  }

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="section">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <span className="section-tag">( {post.tag} )</span>
          <h2 style={{ marginBottom: 18 }}>{post.title}</h2>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              alignItems: "center",
              color: "var(--text-muted)",
              fontSize: 14,
              flexWrap: "wrap",
            }}
          >
            <span>By {post.author}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{post.date}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <nav
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 32,
            }}
          >
            <Link href="/" style={{ color: "var(--text-muted)" }}>
              Home
            </Link>
            <span style={{ margin: "0 8px", opacity: 0.4 }}>/</span>
            <Link href="/blog" style={{ color: "var(--text-muted)" }}>
              Blog
            </Link>
            <span style={{ margin: "0 8px", opacity: 0.4 }}>/</span>
            <span style={{ color: "var(--text)" }}>{post.title}</span>
          </nav>

          <article>
            {post.sections.map((section, i) => (
              <div key={i} style={{ marginBottom: 32 }}>
                {section.heading && (
                  <h3
                    style={{
                      fontSize: 24,
                      lineHeight: 1.3,
                      marginBottom: 14,
                      color: "var(--text)",
                    }}
                  >
                    {section.heading}
                  </h3>
                )}
                {section.content.split("\n\n").map((para, j) => (
                  <p
                    key={j}
                    style={{
                      fontSize: 16.5,
                      color: "var(--text-dim)",
                      lineHeight: 1.8,
                      marginBottom: 16,
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            ))}
          </article>

          <div
            className="card"
            style={{ marginTop: 40, padding: 28, textAlign: "center" }}
          >
            <p
              style={{
                color: "var(--text)",
                fontSize: 15,
                lineHeight: 1.7,
                marginBottom: 18,
              }}
            >
              If you're not sure how your brand shows up in AI answers right
              now, run a free AEOrank report — drop in your URL and we'll map
              the subreddits, posts, and keyword angles ChatGPT, Claude and
              Gemini draw from for your category.
            </p>
            <Link href="/" className="btn btn-primary">
              Run a Free Report →
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <span className="section-tag">( more reading )</span>
            <h2 style={{ marginBottom: 24 }}>More from the blog</h2>
            <div
              className="related-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="card"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                    }}
                  >
                    {r.tag}
                  </div>
                  <h4 style={{ fontSize: 16, lineHeight: 1.4, fontWeight: 700 }}>
                    {r.title}
                  </h4>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-dim)",
                      lineHeight: 1.6,
                    }}
                  >
                    {r.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 900px) {
          .related-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Footer />
    </>
  );
}
