# Content Quality — Pass 2

Re-audit of https://www.aeorank.tech, 2026-09-27. 37 URLs from sitemap.xml,
all 200. 19 blog posts parsed from source (`app/blog/[slug]/page.js`) and
re-fetched live for extraction comparison.

## Scores

| Metric | Pass 1 | Pass 2 | Delta |
|---|---|---|---|
| Content quality | 46 | 55 | +9 |
| E-E-A-T | 32 | 37 | +5 |
| AI citation readiness | 38 | 56 | +18 |

E-E-A-T breakdown (this skill's internal weighting, not Google's):

| Factor | Weight | Pass 1 | Pass 2 |
|---|---|---|---|
| Experience | 20% | 25 | 34 |
| Expertise | 25% | 38 | 42 |
| Authoritativeness | 25% | 22 | 28 |
| Trustworthiness | 30% | 30 | 42 |

AI citation readiness is the big mover, and it moved for the reason the list
conversion was supposed to move it. Measured below.

## 1. Invisible Unicode and AI-cliche density: all 19 posts clean

Scanned body copy plus title/metaTitle/metaDescription/description/tag/readTime
for 28 invisible or ambiguous-width codepoints (ZWSP, ZWNJ, ZWJ, LRM/RLM, the
LRE..RLO bidi set, WJ, the invisible-math operators, BOM, soft hyphen, MVS,
NBSP, NNBSP, ideographic and en/em/thin spaces, LSEP, PSEP).

    Total invisible codepoints across 19 posts: 0

Cliche density against a 40-pattern list is low and falls almost entirely on one
word:

    leverage / leveraging   13 instances across 8 posts
    "comprehensive guide"    1 instance (how-to-get-cited-by-chatgpt)
    everything else          0

Per-post density peaks at 2.2 hits per 1,000 words. Nothing in the usual
generated-prose register ("in today's landscape", "delve into", "game-changer",
"tapestry", "it's not just X, it's Y", "moreover/furthermore", "in conclusion")
appears anywhere in 16,862 words. That is a genuinely clean corpus by this test.

### But the two new posts regress on em dashes

You asked me to check your own two adversarially. This is the finding.

    reddit-ai-visibility-guide     12 EM DASH, prose
    best-ai-visibility-tools        6 EM DASH, prose
    ---------------------------------------------------
    other 17 posts                  1 EM DASH total (inside a table cell)
                                   11 EN DASH, every one a numeric range
                                      (2-3, 8-12, 30-50, 15-30%, 2024-2025)

18 prose em dashes in 2,561 words = 7.0 per 1,000. The other 17 posts run 0.0
per 1,000. The corpus was deliberately de-em-dashed; the two newest posts
reintroduce the single most-cited stylistic tell, in its most recognisable
form, the appositive "clause — and clause":

    "...what do people actually recommend?" — and it makes Reddit visibility...
    "...stops the comment being removed later — and a removed comment cites nothing."
    "...Discrepancies are the interesting part — ask about every one."
    "What follows is not a ranking — it is the set of questions..."

This is not a ranking factor and I am not claiming Google detects it. It is a
consistency defect: a reader or reviewer comparing the two newest posts against
the other 17 sees two different hands, and the two different hands are the two
posts with no human editing pass. Same pattern leaked into /pricing: "the things
that actually move citations — comments, posts, scans — so the cost tracks".

### Rendering defect in best-ai-visibility-tools

`renderInline` handles `[link](href)` and `**bold**` only. Single-asterisk
italics are unsupported, so this ships literal asterisks to the reader:

    Ask the vendor what happens when a model replies *"I'm not familiar with
    that brand — could you clarify?"* That sentence contains the brand name.

Four raw `*` characters visible on the live page. Either strip them or add
single-asterisk handling to `renderInline`.

## 2. Did the list conversion improve extractability? Yes, measurably

Every list item survives trafilatura intact:

    <li> in <article>, all posts:            102
    survived extraction:                     102  (84 as "- ", 18 as "1." from <ol>)
    survival rate:                           100%
    <strong> in <article>:                    95  -> 95 survived as **bold**
    <table> in <article>:                      3  -> all 3 survived as pipe tables

Main-content retention (trafilatura extracted words / raw stripped-tag words)
sorts almost perfectly by whether a post has list markup:

    88.6%  reddit-ai-visibility-guide          29 li, 1 table
    86.1%  chatgpt-vs-claude-vs-gemini           3 li, 1 table
    85.5%  aeo-schema-markup-guide              22 li
    81.4%  best-ai-visibility-tools             10 li, 1 table
    80.8%  what-is-aeo                           6 li
    79.6%  how-to-get-cited-by-chatgpt           4 li
    79.2%  google-ai-overviews-guide             4 li
    78.8%  measure-ai-citation-roi               9 li
    77.3%  entity-authority-ai-citation          0 li   <-- outlier, prose-dense
    77.0%  reply-to-reddit-without-getting...    3 li
    76.7%  optimize-for-perplexity               4 li
    75.9%  aeo-vs-seo                            4 li
    ------ posts with zero list/table/strong markup ------
    69.3%  sentiment-in-ai-citations             0
    69.0%  profound-vs-peec-vs-aeorank           0
    67.4%  crowdreply-vs-aeorank                 0
    65.4%  partner-network-ai-visibility         0
    59.0%  how-we-verify-reddit-threads          0

Mean retention: 79.6% structured vs 66.0% unstructured. The conversion worked.
Pass 1's "list-shaped but not list-marked-up" count is now 0 by the
`**Label.** Explanation.` detector.

Seven posts are still fully unstructured, 4,177 words with no `<ul>`, `<ol>`,
`<table>` or `<strong>` between them, and they occupy five of the six lowest
retention slots:

    sentiment-in-ai-citations        582 w
    partner-network-ai-visibility    486 w
    profound-vs-peec-vs-aeorank      569 w
    why-chatgpt-cites-reddit-threads 852 w
    entity-authority-ai-citation     909 w
    crowdreply-vs-aeorank            517 w
    how-we-verify-reddit-threads     364 w

Three of those seven are commercial-intent comparison posts
(profound-vs-peec-vs-aeorank, crowdreply-vs-aeorank) or trust pages
(how-we-verify-reddit-threads). They are the posts that most need to survive
extraction and they are the ones that survive worst. Next conversion pass
should start here, not with more new posts.

## 3. Hyphen density across the corpus: 3 residuals, 2 in the post you fixed

Method: collected all 115 distinct hyphenated compounds the corpus uses
somewhere, then searched for each one appearing open elsewhere. 38 raw hits,
of which 35 are correct English (entity authority / citation building are
correctly open as noun phrases and correctly hyphenated only attributively).
Three are genuine stripped hyphens:

    /blog/crowdreply-vs-aeorank      "a sub 5% removal rate"      -> sub-5%
    /blog/crowdreply-vs-aeorank      "a credit based cost model"  -> credit-based
    /blog/how-we-verify-reddit-threads "an optional nice to have" -> nice-to-have

The first two are in the post the restore pass targeted. "sub-5%" appears twice
in that post; the pass fixed occurrence 1 and missed occurrence 2, so the same
post now contains both spellings 300 characters apart. "credit based" was missed
entirely. Grep for the fixed form and confirm the count, not just presence.

Per-post hyphen density confirms no other post was damaged. Corpus median is
10.1 compounds per 1,000 words. Three low outliers:

    0.0/1k  how-we-verify-reddit-threads   (0 in 364 w)  <- contains nice-to-have
    1.7/1k  sentiment-in-ai-citations      (1 in 582 w)
    2.1/1k  partner-network-ai-visibility  (1 in 486 w)

I hand-checked the latter two against compound patterns (X-based, X-driven,
X-facing, non/pre/post/self/multi/cross-X, N-day/week/month, well-Xed). No
missing hyphens. They are just low-compound prose. The de-em-dashing damage is
contained to the three instances above.

## 4. E-E-A-T re-score

### Trustworthiness 30 -> 42, the largest single gain

/pricing is the fix that mattered. Price is now in extractable main content and
in a real `<table>` that survives trafilatura as a pipe table:

    Lite $199/mo, Pro $299/mo, Max $449/mo, 7-day trial, card required
    per-unit rates by tier (comment $10/$7/$5, post $20/$15/$10)
    keywords 50/75/100, brands 3/6/10
    managed services $500 one-time audit to $3,000/mo

Pass 1's "price is invisible" is resolved, and resolved in the machine-readable
form rather than as an image or a "contact us".

/blog/best-ai-visibility-tools opens with an unprompted conflict disclosure:
"We build one of these tools, so treat the framing here accordingly", and closes
"Read them knowing who wrote them." That is a real trust signal and it is rare.

Still capping the score, and newly quantified this pass: read-time labels are
inflated by almost exactly 2x corpus-wide.

    claimed total across 19 posts:   150 min
    actual at 225 wpm:                75 min
    ratio:                          2.00x
    worst: how-we-verify-reddit-threads  5 min claimed / 1.6 actual  (3.1x)
           entity-authority-ai-citation 11 min claimed / 4.0 actual  (2.8x)
           partner-network-ai-visibility 6 min claimed / 2.2 actual  (2.7x)

15 of 19 posts are inflated 1.75x or worse, including one of your two new ones
(best-ai-visibility-tools: 8 min claimed, 4.3 actual, 1.86x). This is a
machine-checkable false statement rendered on every post, next to the byline,
in the same block as the author name and date. Noting it as a trust item rather
than a cosmetic one because it is the one claim on the page a reader can falsify
in ten seconds.

Noted, not re-argued, per your instruction: +312% double meaning, the 200-400%
guarantee inside FAQPage schema, 5.5B vs 1.2B. The guarantee is the item I would
still move first if the owner revisits: an unsubstantiated numeric performance
guarantee placed in structured data is the highest-exposure trust item on the
site, because it is the version a machine reads and quotes.

### Authoritativeness 22 -> 28

Outbound citations exist now, but they are concentrated and partly miscounted as
evidence. Baseline is 2 external anchors per page (footer). Above baseline:

    /blog/best-ai-visibility-tools    5: athenahq.ai, crowdreply.com, peec.ai,
                                         tryprofound.com, scrunchai.com
    /blog/reddit-ai-visibility-guide  4: redditinc.com/blog,
                                         developers.google.com (AI features),
                                         developers.google.com (helpful content),
                                         schema.org/Organization
    all 17 other posts                0

So 9 outbound links in 16,862 words, on 2 of 19 posts. 17 posts, 14,301 words,
still cite nothing. Two qualifications on the 9:

- The 5 on best-ai-visibility-tools are competitor homepages, not sources. They
  establish that the competitors exist; they do not corroborate a claim. Useful
  for entity disambiguation, not for authoritativeness.
- redditinc.com/blog is a newsroom index, not the specific announcement the
  sentence relies on ("Reddit has publicly announced data partnerships with AI
  companies"). A claim-level citation needs the permalink.

The two developers.google.com links and schema.org/Organization are the only
four true claim-supporting citations on the site.

All 9 are `rel="noopener noreferrer"`, zero `nofollow` and zero `sponsored`
anywhere on the domain. Five dofollow links to direct competitors from a page
whose conclusion is that you are a reasonable pick is a link-equity decision
worth making deliberately rather than by default.

Still zero case studies, zero named clients, zero third-party coverage of
AEOrank cited anywhere. Acknowledged as a genuine data problem, not a writing
problem.

### Expertise 38 -> 42

Topical command is real and the internal link graph is dense (98 internal
contextual links across the 19 posts, average 5.2/post, no orphans). Heading
shape is strong for answer-engine query matching: 62 of 103 h2s are
question-shaped or interrogative-led (60%). Readability sits in the right band
for B2B: Flesch 46.6-62.4, mean 55; average sentence length 9.9-24.4 words,
mean 15.6. Two posts run long-sentenced enough to hurt extraction
(partner-network-ai-visibility 24.4, crowdreply-vs-aeorank 20.7,
getting-cited-by-claude 20.6).

Ceiling is the orphan byline, unchanged: "Ilyas Lemzouri" appears as text on 19
posts and as `author.name` in 19 BlogPosting blocks, with `worksFor` but no
`url`, no `sameAs`, no /author/ page, no bio sentence anywhere on the domain.
Every expertise claim on the site is therefore attached to an entity no engine
can resolve. Blocked on owner details, noted.

### Experience 25 -> 34

The two new posts add the first real first-hand signals on the domain: the
vendor-conflict disclosure, the false-positive walkthrough ("I'm not familiar
with that brand" containing the brand name, scored as a mention), and the
judgement-call section in the Reddit guide ("The highest-value move is often to
not comment"). Those read like operator knowledge rather than summary.
crowdreply-vs-aeorank now attributes its removal-rate figure to a third-party
14-day hands-on review rather than asserting it.

Still no owned data, no screenshots, no before/after, no named engagement. The
ceiling here is the missing case study and it is a data problem, acknowledged.

## 5. Metadata templating: clean

`metadata_template.py`, all 37 URLs:

    pages_checked      37
    templated_count     0
    templated_ratio   0.0
    shared_cta_phrases {}
    site_risk         low

Four secondary flags only:

    medium  /industries/software              description-echoes-title
    low     /contact                          brand-suffix-in-description
    low     /blog/crowdreply-vs-aeorank       brand-suffix-in-description
    low     /blog/profound-vs-peec-vs-aeorank brand-suffix-in-description

No shared closing CTA across pages, which is the signal that matters. Fix the
/industries/software description so it says something the title does not.

## 6. Near-duplicate commercial pages: resolved

Pass 1 flagged the four /industries/ pages as near-duplicates within 11 words
of each other. Re-measured on extracted main content (SequenceMatcher):

    industries, max pairwise similarity  0.165  (saas <-> tech-it)
    services,   max pairwise similarity  0.154  (aeo-management <-> aeo-consulting)

These are now genuinely distinct documents. Closed.

## 7. Still open: the commercial pages are unchanged and still thin

This is the largest remaining gap and nothing in this pass touched it.
Extracted main-content words against the skill's coverage floors:

    page                              extracted   floor    gap
    /services/aeo-management              160       800    -640
    /services/entity-optimization         156       800    -644
    /services/ai-visibility-audit         148       800    -652
    /services/aeo-consulting              147       800    -653
    /services/citation-building           143       800    -657
    /industries/startups                  186    500-600   -314
    /industries/software                  175    500-600   -325
    /industries/tech-it                    175   500-600   -325
    /industries/saas                       174   500-600   -326
    /about                                  92       -       -
    /contact                                26       -       -
    /                                      758       500     ok
    /pricing                               264       -       thin but tabular

(Word count is not a ranking factor. These are topical-coverage floors. The
point is that five service pages average 151 words of substance each while the
blog carries 16,862, and the service pages are the ones with commercial intent.)

Blog word counts against the 1,500 floor: 2 of 19 clear it
(reddit-ai-visibility-guide 1,586, chatgpt-vs-claude-vs-gemini 1,524). 17 do
not; 15 are under 1,000; corpus mean is 887. Both new posts help the total
(+2,561 words, 14,227 -> 16,862) but one of them (best-ai-visibility-tools,
975) lands in the under-1,000 group it was meant to thin out.

Small discrepancy worth knowing: you reported the new posts at 1,634 and 1,003
words. Body copy with markdown stripped measures 1,586 and 975. The higher
numbers appear to include headings and the CTA block.

## Recommendations, in order

1. Strip the 18 prose em dashes from the two new posts and the 2 from /pricing,
   to match the other 17 posts. Add em dash to whatever lint catches this.
2. Remove the 4 literal `*` characters from best-ai-visibility-tools, or add
   single-asterisk italic handling to `renderInline`.
3. Fix the 3 residual stripped hyphens: "sub 5%" and "credit based" in
   crowdreply-vs-aeorank, "nice to have" in how-we-verify-reddit-threads.
4. Recompute every `readTime` from word count at 200-225 wpm. 2.00x corpus-wide
   inflation is the cheapest trust fix on the site.
5. Convert the 7 zero-structure posts. They are five of the six worst
   extraction-retention pages, and three of them are commercial comparison or
   trust pages.
6. Replace redditinc.com/blog with the specific announcement permalink, and add
   `rel="nofollow"` or `sponsored` to the 5 competitor homepage links if the
   equity transfer is not intended.
7. Take the 5 /services/ pages from ~150 to 500+ words of substance before
   writing post 20. Five pages at 151 words each is the highest-value 800 words
   available on this domain.
8. Give one of the 17 uncited posts a real claim-level citation, to break the
   "outbound links only exist on the two newest posts" pattern.
