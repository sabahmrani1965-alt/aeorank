// AEOrank enterprise pitch deck (10 slides, 16:9, editable PowerPoint).
// Run: NODE_PATH=<dir with pptxgenjs> node scripts/deck/build-deck.js <out.pptx>
// Every figure comes from AEOrank's own data or the owner's statements (see
// speaker notes); the case study slot is a marked placeholder until a client
// approves publishing numbers.
const path = require("path");
const pptxgen = require("pptxgenjs");

const OUT = process.argv[2] || path.join(__dirname, "AEOrank-Enterprise-Deck.pptx");
const IMG = (n) => path.join(__dirname, "img", n);

const THEME = {
  name: "AEOrank",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "14161B", lt1: "FFFFFF", dk2: "06112A", lt2: "F3F5F9",
    accent1: "F2A83B", accent2: "0F1F45", accent3: "C4432A", accent4: "2F8F5B", accent5: "6B7280", accent6: "E3E7EE",
    hlink: "0F1F45", folHlink: "6B7280",
  },
};
const HEX = THEME.colors;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "AEOrank";
pres.company = "AEOrank";
pres.title = "AEOrank enterprise briefing";
const C = pres.SchemeColor;

const W = 13.333, M = 0.65;

// ---------- layouts ----------
pres.defineSlideMaster({
  title: "AEO_COVER",
  background: { color: HEX.dk2 },
  objects: [
    { placeholder: { options: { name: "kicker", type: "body", x: M, y: 0.75, w: 7.2, h: 0.35, fontFace: "Calibri", fontSize: 12, bold: true, color: C.accent1, charSpacing: 3, margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: M, y: 1.45, w: 7.3, h: 2.55, fontFace: "Cambria", fontSize: 40, bold: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: M, y: 4.25, w: 6.9, h: 1.3, fontFace: "Calibri", fontSize: 16, color: "C9D2E3", valign: "top", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "AEO_CONTENT",
  background: { color: HEX.lt1 },
  objects: [
    { placeholder: { options: { name: "kicker", type: "body", x: M, y: 0.5, w: 9, h: 0.3, fontFace: "Calibri", fontSize: 12, bold: true, color: C.accent1, charSpacing: 3, margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.85, w: W - 2 * M, h: 1.05, fontFace: "Cambria", fontSize: 28, bold: true, color: C.text2, valign: "top", align: "left", margin: 0 }, text: "" } },
    { text: { text: "AEOrank · Enterprise briefing · Confidential", options: { x: M, y: 7.0, w: 6, h: 0.28, fontFace: "Calibri", fontSize: 10, color: C.accent5, margin: 0 } } },
  ],
  slideNumber: { x: W - M - 0.6, y: 7.0, w: 0.6, h: 0.28, fontFace: "Calibri", fontSize: 10, color: C.accent5, align: "right" },
});
pres.defineSlideMaster({
  title: "AEO_CLOSE",
  background: { color: HEX.dk2 },
  objects: [
    { placeholder: { options: { name: "kicker", type: "body", x: M, y: 0.75, w: 9, h: 0.35, fontFace: "Calibri", fontSize: 12, bold: true, color: C.accent1, charSpacing: 3, margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: M, y: 1.3, w: 11.5, h: 1.3, fontFace: "Cambria", fontSize: 40, bold: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } },
  ],
});

// ---------- helpers ----------
const T = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, fontFace: "Calibri", color: C.text1, valign: "top", ...o });
const card = (s, name, x, y, w, h, fill = C.background2, line = null) =>
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: name, x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: line ? { color: line, width: 1 } : { type: "none" } });
const chip = (s, name, x, y, fill = C.accent1) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: name, x, y, w: 0.14, h: 0.14, rectRadius: 0.03, fill: { color: fill }, line: { type: "none" } });
const num = (s, name, n, x, y, fill = C.text2, color = C.accent1) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: name, x, y, w: 0.42, h: 0.42, rectRadius: 0.08, fill: { color: fill }, line: { type: "none" } });
  T(s, String(n), { x, y, w: 0.42, h: 0.42, align: "center", valign: "middle", fontSize: 15, bold: true, color });
};
const shot = (s, name, file, x, y, w, ratio) => {
  const h = w * ratio;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: name + " frame", x: x - 0.06, y: y - 0.06, w: w + 0.12, h: h + 0.12, rectRadius: 0.08, fill: { color: C.background1 }, line: { color: HEX.accent6, width: 1 }, shadow: { type: "outer", color: "0F1F45", opacity: 0.12, blur: 8, offset: 2, angle: 90 } });
  s.addImage({ path: file, x, y, w, h, objectName: name });
  return h;
};
const chartBase = () => ({
  barDir: "bar", catAxisOrientation: "maxMin", valAxisHidden: true, valAxisMaxVal: 110, valAxisMinVal: 0,
  valGridLine: { style: "none" }, catGridLine: { style: "none" },
  catAxisLabelColor: HEX.dk1, catAxisLabelFontSize: 12, catAxisLabelFontFace: "+mn-lt", catAxisLineShow: false,
  showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 12, dataLabelFontFace: "+mn-lt", dataLabelColor: HEX.dk1,
  showLegend: false, barGapWidthPct: 55, showTitle: true, titleFontSize: 12, titleFontFace: "+mn-lt", titleColor: "6B7280",
});

// ===================== 1. Cover =====================
pres.addSection({ title: "Opening" });
let s = pres.addSlide({ masterName: "AEO_COVER", sectionTitle: "Opening" });
s.addText("AEORANK · ENTERPRISE BRIEFING", { placeholder: "kicker" });
s.addText("Your buyers ask AI which vendor to choose. Make sure you're in the answer", { placeholder: "title" });
s.addText("Reddit-powered Answer Engine Optimization for enterprise software. We measure how ChatGPT, Gemini and Claude present your brand, and earn you a place in the sources they draw on.", { placeholder: "body" });
T(s, [{ text: "RECENT CLIENTS   ", options: { color: "8E9AB3", fontSize: 11, bold: true, charSpacing: 2 } }, { text: "Sovos  ·  TINCheck", options: { color: C.background1, fontSize: 15, bold: true } }], { x: M, y: 6.25, w: 6, h: 0.4, valign: "middle" });
// thesis visual: an AI answer that may or may not include you
card(s, "AI answer card", 8.35, 1.25, 4.35, 5.25, C.accent2);
T(s, "A BUYER ASKS CHATGPT", { x: 8.7, y: 1.55, w: 3.7, h: 0.3, fontSize: 10.5, bold: true, color: "8E9AB3", charSpacing: 2 });
card(s, "question bubble", 8.7, 1.95, 3.65, 0.85, C.background1);
T(s, "“Which CRM should a 50-person sales team choose?”", { x: 8.88, y: 2.03, w: 3.3, h: 0.7, fontSize: 13.5, color: C.text2, italic: true, valign: "middle" });
T(s, "THE ANSWER NAMES", { x: 8.7, y: 3.1, w: 3.7, h: 0.3, fontSize: 10.5, bold: true, color: "8E9AB3", charSpacing: 2 });
["Vendor A", "Vendor B", "Vendor C"].forEach((v, i) => {
  const y = 3.5 + i * 0.58;
  card(s, "answer row " + (i + 1), 8.7, y, 3.65, 0.46, "1B2D57");
  T(s, [{ text: `${i + 1}   `, options: { color: C.accent1, bold: true } }, { text: v, options: { color: C.background1 } }], { x: 8.88, y, w: 3.3, h: 0.46, fontSize: 13, valign: "middle" });
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: "your brand row", x: 8.7, y: 5.27, w: 3.65, h: 0.46, rectRadius: 0.08, fill: { color: C.accent2 }, line: { color: C.accent1, width: 1.25, dashType: "dash" } });
T(s, [{ text: "?   ", options: { color: C.accent1, bold: true } }, { text: "Your brand", options: { color: C.accent1, bold: true } }], { x: 8.88, y: 5.27, w: 3.3, h: 0.46, fontSize: 13, valign: "middle" });
T(s, "Illustrative", { x: 8.7, y: 5.95, w: 3.65, h: 0.3, fontSize: 10, color: "8E9AB3", italic: true });
s.addNotes("Open with the buyer's reality: shortlists now start in an AI assistant. The card on the right is illustrative; the next slides use our measured data. Positioning: AEOrank is a growth partner for how AI presents your brand, with Reddit as the main lever. Recent clients: Sovos and TINCheck.");

// ===================== 2. The shift =====================
pres.addSection({ title: "Problem" });
s = pres.addSlide({ masterName: "AEO_CONTENT", sectionTitle: "Problem" });
s.addText("THE SHIFT", { placeholder: "kicker" });
s.addText("Software shortlists are now being written inside AI answers", { placeholder: "title" });
s.addChart(pres.charts.BAR, [{ name: "Share of AI answers", labels: ["Pipedrive", "HubSpot", "Zoho CRM", "Salesforce", "Monday.com", "Attio", "Copper", "Capsule CRM"], values: [100, 97, 56, 38, 27, 0, 0, 0] }],
  { ...chartBase(), x: M, y: 2.05, w: 7.4, h: 4.25, title: "Share of AI answers naming each CRM (%)", chartColors: [HEX.accent2], dataLabelFormatCode: '0"%"', objectName: "CRM share chart" });
T(s, "AEOrank daily data, CRM software, 15–21 Oct 2026: 34 answers from ChatGPT, Claude and Gemini to three fixed buyer questions.", { x: M, y: 6.38, w: 7.4, h: 0.45, fontSize: 10.5, color: C.accent5 });
card(s, "stat 100", 8.55, 2.15, 4.13, 1.85, C.background2);
T(s, "100%", { x: 8.85, y: 2.3, w: 3.6, h: 0.85, fontFace: "Cambria", fontSize: 44, bold: true, color: C.text2 });
T(s, "Pipedrive was named in every one of the 34 answers, on all three engines.", { x: 8.85, y: 3.15, w: 3.6, h: 0.75, fontSize: 14, color: C.text1 });
card(s, "stat 0", 8.55, 4.2, 4.13, 1.85, C.background2);
T(s, "0%", { x: 8.85, y: 4.35, w: 3.6, h: 0.85, fontFace: "Cambria", fontSize: 44, bold: true, color: C.accent3 });
T(s, "Attio, Copper and Capsule CRM, established vendors, were named in none.", { x: 8.85, y: 5.2, w: 3.6, h: 0.75, fontSize: 14, color: C.text1 });
T(s, "Absence is binary: if the answer doesn't name you, you are not on the shortlist.", { x: 8.55, y: 6.2, w: 4.13, h: 0.6, fontSize: 13, bold: true, color: C.text2 });
s.addNotes("Measured, not estimated: our public daily data for CRM software (aeorank.tech/ai-recommendations). Same pattern across the 13 SaaS categories we track: a few vendors take most mentions and established products can be absent. The point for the prospect: their category almost certainly has the same split, and today nobody on their team is measuring it.");

// ===================== 3. Blind spot =====================
s = pres.addSlide({ masterName: "AEO_CONTENT", sectionTitle: "Problem" });
s.addText("THE BLIND SPOT", { placeholder: "kicker" });
s.addText("Your dashboards show rankings and traffic, not whether AI recommends you", { placeholder: "title" });
card(s, "seo column", M, 2.15, 5.45, 4.2, C.background2);
T(s, "What your search reporting tracks", { x: M + 0.35, y: 2.4, w: 4.8, h: 0.4, fontSize: 17, bold: true, color: C.text2 });
["Keyword rankings", "Organic traffic", "Backlinks and authority", "Share of search"].forEach((t, i) => {
  chip(s, "seo chip " + i, M + 0.37, 3.12 + i * 0.68 + 0.02, C.accent5);
  T(s, t, { x: M + 0.7, y: 3.05 + i * 0.68, w: 4.5, h: 0.4, fontSize: 15, color: C.text1 });
});
s.addShape(pres.shapes.RIGHT_ARROW, { objectName: "arrow", x: 6.3, y: 3.95, w: 0.7, h: 0.55, fill: { color: C.accent1 }, line: { type: "none" } });
card(s, "ai column", 7.2, 2.15, 5.48, 4.2, C.text2);
T(s, "What decides an AI shortlist", { x: 7.55, y: 2.4, w: 4.8, h: 0.4, fontSize: 17, bold: true, color: C.background1 });
["Is your brand named at all?", "In what position?", "Who is named instead?", "Which pages does the answer cite?", "How does it differ by engine?"].forEach((t, i) => {
  chip(s, "ai chip " + i, 7.57, 3.12 + i * 0.6 + 0.02);
  T(s, t, { x: 7.9, y: 3.05 + i * 0.6, w: 4.6, h: 0.4, fontSize: 15, color: C.background1 });
});
T(s, "What isn't measured can't be managed. AEOrank adds the AI layer to your reporting, question by question and engine by engine.", { x: M, y: 6.48, w: 12, h: 0.42, fontSize: 14, color: C.text2, bold: true });
s.addNotes("Most enterprise teams have mature SEO and brand reporting, but none of it answers the five questions on the right. That gap is why AI visibility goes unmanaged even in well-run marketing teams.");

// ===================== 4. Why Reddit =====================
pres.addSection({ title: "Approach" });
s = pres.addSlide({ masterName: "AEO_CONTENT", sectionTitle: "Approach" });
s.addText("WHY REDDIT", { placeholder: "kicker" });
s.addText("AI answers echo buyer conversations, and buyers compare vendors on Reddit", { placeholder: "title" });
s.addChart(pres.charts.BAR, [{ name: "Mentions", labels: ["HubSpot", "Zoho", "Pipedrive", "Attio", "Copper", "Capsule CRM"], values: [19, 9, 8, 0, 0, 0] }],
  { ...chartBase(), valAxisMaxVal: 22, x: M, y: 2.15, w: 5.6, h: 3.5, title: "Times each CRM is named in r/CRM's busiest thread", chartColors: [HEX.accent2], objectName: "thread chart" });
T(s, "r/CRM, “Best and inexpensive CRM for small business” (345 comments): post and top comments. The leaders here are the leaders in the AI answers; the absent vendors are absent there too.", { x: M, y: 5.75, w: 5.6, h: 0.95, fontSize: 11, color: C.accent5 });
const h4 = shot(s, "cited sources screenshot", IMG("sources-reddit.png"), 6.75, 2.2, 5.9, 545 / 1500);
T(s, "ChatGPT (web search) answering “Which CRM do small business owners actually recommend?”: G2, Capterra and a Reddit thread.", { x: 6.75, y: 2.2 + h4 + 0.15, w: 5.9, h: 0.5, fontSize: 11, color: C.accent5 });
const y4 = 2.2 + h4 + 0.8;
chip(s, "reddit chip 1", 6.77, y4 + 0.07);
T(s, [{ text: "Live citations: ", options: { bold: true, color: C.text2 } }, { text: "review sites and vendor pages most often; Reddit threads when buyers ask what people actually recommend." }], { x: 7.05, y: y4, w: 5.6, h: 0.6, fontSize: 13 });
chip(s, "reddit chip 2", 6.77, y4 + 0.77);
T(s, [{ text: "Model knowledge: ", options: { bold: true, color: C.text2 } }, { text: "Reddit licenses its data to Google and OpenAI (2024 agreements), so its discussions shape answers even without a link." }], { x: 7.05, y: y4 + 0.7, w: 5.6, h: 0.6, fontSize: 13 });
s.addNotes("Be precise here, it builds trust. In our own test of 8 buyer questions on ChatGPT with web search, live citations were mostly vendor and review sites; Reddit was cited when the question asked what people actually recommend. Reddit's second channel is training data: its 2024 licensing agreements with Google and OpenAI. Review sites (G2, Capterra) are part of the source map we work on too.");

// ===================== 5. Approach =====================
s = pres.addSlide({ masterName: "AEO_CONTENT", sectionTitle: "Approach" });
s.addText("OUR APPROACH", { placeholder: "kicker" });
s.addText("We work on the sources AI learns from, not just your website", { placeholder: "title" });
const loop = [
  ["Measure", "Your buyer questions, asked daily on ChatGPT, Gemini and Claude"],
  ["Map", "The pages and Reddit threads each answer relies on"],
  ["Earn presence", "Helpful, approved content in the threads and sources that matter"],
  ["Re-measure", "Share of answers, position and citations, every month"],
];
const lw = 2.72, lg = 0.42;
loop.forEach(([h, d], i) => {
  const x = M + i * (lw + lg);
  card(s, "loop " + h, x, 2.2, lw, 2.25, i === 2 ? C.text2 : C.background2);
  num(s, "loop num " + i, i + 1, x + 0.25, 2.45, i === 2 ? C.accent1 : C.text2, i === 2 ? C.text2 : C.accent1);
  T(s, h, { x: x + 0.25, y: 3.0, w: lw - 0.5, h: 0.4, fontSize: 17, bold: true, color: i === 2 ? C.background1 : C.text2 });
  T(s, d, { x: x + 0.25, y: 3.45, w: lw - 0.45, h: 0.9, fontSize: 13, color: i === 2 ? "DCE3F0" : C.text1 });
  if (i < 3) s.addShape(pres.shapes.RIGHT_ARROW, { objectName: "loop arrow " + i, x: x + lw + 0.07, y: 3.15, w: 0.28, h: 0.32, fill: { color: C.accent1 }, line: { type: "none" } });
});
T(s, "↻  The loop repeats monthly: what moved the answers gets more weight, what didn't is replaced.", { x: M, y: 4.6, w: 12, h: 0.35, fontSize: 13, color: C.accent5, italic: true });
const cmp = [
  ["SEO agencies", "Optimise your own website for search rankings.", false],
  ["PR agencies", "Place your brand in media coverage.", false],
  ["AEOrank", "Works the community and review sources AI answers draw on, and measures the effect on the answers.", true],
];
cmp.forEach(([h, d, hi], i) => {
  const x = M + i * 4.1;
  card(s, "compare " + h, x, 5.2, 3.85, 1.55, hi ? C.accent1 : C.background1, hi ? null : HEX.accent6);
  T(s, h, { x: x + 0.25, y: 5.38, w: 3.4, h: 0.38, fontSize: 15, bold: true, color: C.text2 });
  T(s, d, { x: x + 0.25, y: 5.78, w: 3.4, h: 0.85, fontSize: 13, color: C.text1 });
});
s.addNotes("Differentiation: we don't compete with their SEO or PR agencies, we cover the layer neither of them measures or works on. The loop is the operating model: measurement drives where we act, and the next month's measurement shows whether it worked.");

// ===================== 6. Execution & governance =====================
pres.addSection({ title: "Delivery" });
s = pres.addSlide({ masterName: "AEO_CONTENT", sectionTitle: "Delivery" });
s.addText("EXECUTION & GOVERNANCE", { placeholder: "kicker" });
s.addText("A governed Reddit programme your legal team can sign off", { placeholder: "title" });
const steps = [
  ["Select", "Threads where your buyers ask, ranked by fit and traffic"],
  ["Research", "Read the full thread and the subreddit's rules"],
  ["Draft", "Story-led posts built on real buyer situations; replies that answer first"],
  ["Approve", "Your team edits and signs off every word"],
  ["Publish & track", "Your accounts or established community members; reach and AI effect tracked"],
];
const sw = 2.24, sg = 0.18;
steps.forEach(([h, d], i) => {
  const x = M + i * (sw + sg);
  card(s, "step " + h, x, 2.15, sw, 2.35, i === 3 ? C.text2 : C.background2);
  num(s, "step num " + i, i + 1, x + 0.22, 2.38, i === 3 ? C.accent1 : C.text2, i === 3 ? C.text2 : C.accent1);
  T(s, h, { x: x + 0.22, y: 2.93, w: sw - 0.4, h: 0.38, fontSize: 16, bold: true, color: i === 3 ? C.background1 : C.text2 });
  T(s, d, { x: x + 0.22, y: 3.35, w: sw - 0.38, h: 1.1, fontSize: 12.5, color: i === 3 ? "DCE3F0" : C.text1 });
});
card(s, "always card", M, 4.8, 5.95, 1.95, C.background1, HEX.accent6);
T(s, "Always", { x: M + 0.3, y: 4.98, w: 5, h: 0.38, fontSize: 16, bold: true, color: C.accent4 });
T(s, ["Helpful answers to real questions", "Honest comparisons, including competitors", "Each subreddit's rules followed", "Nothing published without your approval"].map((t, i, a) => ({ text: t, options: { bullet: { indent: 16 }, breakLine: i < a.length - 1 } })), { x: M + 0.3, y: 5.4, w: 5.5, h: 1.3, fontSize: 13, paraSpaceAfter: 3 });
card(s, "never card", 6.73, 4.8, 5.95, 1.95, C.background1, HEX.accent6);
T(s, "Never", { x: 7.03, y: 4.98, w: 5, h: 0.38, fontSize: 16, bold: true, color: C.accent3 });
T(s, ["Bought votes or fake engagement", "Fake reviews or impersonation", "Bots or mass-posted content", "Links dropped where they don't help"].map((t, i, a) => ({ text: t, options: { bullet: { indent: 16 }, breakLine: i < a.length - 1 } })), { x: 7.03, y: 5.4, w: 5.5, h: 1.3, fontSize: 13, paraSpaceAfter: 3 });
s.addNotes("This is the slide legal and brand teams care about. Step 4 is the control point: nothing goes live without sign-off. Story-led means posts are built around real situations buyers face, so they read as conversation, not advertising. Publishing can run through the client's own accounts or established community members, always within each subreddit's rules.");

// ===================== 7. Measurement =====================
s = pres.addSlide({ masterName: "AEO_CONTENT", sectionTitle: "Delivery" });
s.addText("MEASUREMENT & REPORTING", { placeholder: "kicker" });
s.addText("Each month you see whether AI names you more often, per engine", { placeholder: "title" });
const kpis = [
  ["Share of AI answers", "% of answers naming you, per engine"],
  ["Average position", "Where you appear when you are named"],
  ["Share of voice", "You against each named competitor"],
  ["Cited sources", "Pages the AI links to, and whether yours is one"],
  ["Reddit footprint", "Placements, reach and replies"],
];
kpis.forEach(([h, d], i) => {
  const y = 2.15 + i * 0.84;
  card(s, "kpi " + h, M, y, 5.2, 0.72, C.background2);
  chip(s, "kpi chip " + i, M + 0.25, y + 0.29);
  T(s, h, { x: M + 0.55, y: y + 0.08, w: 4.5, h: 0.3, fontSize: 14.5, bold: true, color: C.text2 });
  T(s, d, { x: M + 0.55, y: y + 0.38, w: 4.5, h: 0.3, fontSize: 12.5, color: C.text1 });
});
T(s, "Weekly email · monthly readout · quarterly leadership review", { x: M, y: 6.4, w: 5.2, h: 0.35, fontSize: 12.5, bold: true, color: C.text2 });
const hA = shot(s, "prompt card screenshot", IMG("promptcard.png"), 6.55, 2.2, 6.0, 361 / 1500);
const hB = shot(s, "share of voice screenshot", IMG("sov.png"), 6.55, 2.2 + hA + 0.28, 6.0, 683 / 1500);
T(s, "Example account: a well-known CRM brand, name replaced with “Your brand”.", { x: 6.55, y: 2.2 + hA + 0.28 + hB + 0.1, w: 6.0, h: 0.3, fontSize: 10.5, color: C.accent5, italic: true });
s.addNotes("Real AEOrank screens. Each tracked question shows which engines name the brand and at what position; share of voice compares the brand with every competitor named. Example data is a real, well-known CRM brand tracked from public AI answers, anonymised. These KPIs become the pilot's success measures.");

// ===================== 8. Evidence =====================
pres.addSection({ title: "Proof" });
s = pres.addSlide({ masterName: "AEO_CONTENT", sectionTitle: "Proof" });
s.addText("EVIDENCE", { placeholder: "kicker" });
s.addText("What we have measured, and what your pilot will prove", { placeholder: "title" });
const cols = [
  ["Measured in our data", C.text2, ["13 SaaS categories tracked daily on ChatGPT, Claude and Gemini", "CRM leaders named in up to 100% of answers; established vendors at 0%", "Busiest Reddit threads name the same leaders as the AI answers"]],
  ["Delivered for clients", C.accent1, ["Recent clients: Sovos and TINCheck, in tax compliance", "859K+ Reddit views on content produced for a recent client (reported figure)"]],
  ["To prove in your pilot", C.accent5, ["A higher share of AI answers on your priority questions", "Your pages and threads among the cited sources", "A repeatable programme your team can scale", "Hypotheses to test, not guaranteed outcomes"]],
];
cols.forEach(([h, col, items], i) => {
  const x = M + i * 4.1;
  card(s, "evidence " + h, x, 2.15, 3.85, 3.1, C.background2);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: "evidence tag " + i, x: x + 0.28, y: 2.4, w: 0.3, h: 0.3, rectRadius: 0.06, fill: { color: col }, line: { type: "none" } });
  T(s, h, { x: x + 0.72, y: 2.37, w: 3.0, h: 0.38, fontSize: 15.5, bold: true, color: C.text2 });
  T(s, items.map((t, j, a) => ({ text: t, options: { bullet: { indent: 16 }, breakLine: j < a.length - 1, italic: i === 2 && j === a.length - 1, color: i === 2 && j === a.length - 1 ? C.accent5 : C.text1 } })), { x: x + 0.28, y: 2.95, w: 3.35, h: 2.2, fontSize: 13, paraSpaceAfter: 5 });
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: "case study placeholder", x: M, y: 5.5, w: 12.03, h: 1.25, rectRadius: 0.12, fill: { color: C.background1 }, line: { color: C.accent1, width: 1.5, dashType: "dash" } });
T(s, [{ text: "[PLACEHOLDER] Client case study: ", options: { bold: true, color: C.accent1 } }, { text: "before / after share of AI answers, position and cited sources over 90 days. Add once a client approves publishing their numbers.", options: { color: C.text1 } }], { x: M + 0.35, y: 5.5, w: 11.4, h: 1.25, fontSize: 14, valign: "middle" });
s.addNotes("Keep measured facts and hypotheses separate, as on the slide. The 859K+ figure is the views reported for a recent client's Reddit content. We do not yet publish before/after AI numbers for a client: the placeholder should be filled only with a client's written approval. Never promise guaranteed citations or rankings.");

// ===================== 9. Engagement model =====================
pres.addSection({ title: "Engagement" });
s = pres.addSlide({ masterName: "AEO_CONTENT", sectionTitle: "Engagement" });
s.addText("ENGAGEMENT MODEL", { placeholder: "kicker" });
s.addText("Start with a 90-day pilot, then scale what moves the numbers", { placeholder: "title" });
const phases = [
  ["Weeks 1–2", "Baseline", "Questions, competitors and markets agreed; daily tracking live"],
  ["Weeks 3–6", "Source map", "Pages and threads behind the answers; first approved placements"],
  ["Weeks 7–12", "Programme", "Placements running; monthly readouts with your team"],
  ["Day 90", "Decision", "Results against the agreed KPIs; scale, adjust or stop"],
];
s.addShape(pres.shapes.LINE, { objectName: "timeline", x: M + 0.2, y: 2.47, w: 11.6, h: 0, line: { color: HEX.accent6, width: 2 } });
phases.forEach(([when, h, d], i) => {
  const x = M + i * 3.05;
  s.addShape(pres.shapes.OVAL, { objectName: "timeline dot " + i, x: x + 0.1, y: 2.32, w: 0.3, h: 0.3, fill: { color: i === 3 ? C.accent1 : C.text2 }, line: { color: C.background1, width: 2 } });
  T(s, when, { x, y: 2.75, w: 2.85, h: 0.3, fontSize: 12, bold: true, color: C.accent1, charSpacing: 1 });
  T(s, h, { x, y: 3.05, w: 2.85, h: 0.38, fontSize: 16, bold: true, color: C.text2 });
  T(s, d, { x, y: 3.45, w: 2.75, h: 0.8, fontSize: 12.5, color: C.text1 });
});
const offers = [
  ["AI Visibility Pilot · 90 days", ["Your priority buyer questions on 3 engines", "Benchmark against chosen competitors", "Source map and prioritised action plan", "Monthly readouts, final report at day 90"], true],
  ["Enterprise programme · ongoing", ["Every product, brand and market", "Reddit programme run with your team", "Dedicated strategist, monthly working session", "Leadership reporting on AI visibility"], false],
];
offers.forEach(([h, items, hi], i) => {
  const x = M + i * 6.1;
  card(s, "offer " + i, x, 4.5, 5.93, 2.28, hi ? C.text2 : C.background2);
  T(s, h, { x: x + 0.3, y: 4.68, w: 5.3, h: 0.38, fontSize: 16, bold: true, color: hi ? C.background1 : C.text2 });
  T(s, items.map((t, j, a) => ({ text: t, options: { bullet: { indent: 16 }, breakLine: j < a.length - 1 } })), { x: x + 0.3, y: 5.1, w: 3.9, h: 1.55, fontSize: 12.5, color: hi ? "DCE3F0" : C.text1, paraSpaceAfter: 2 });
  T(s, "Pricing on request", { x: x + 4.15, y: 6.25, w: 1.6, h: 0.4, fontSize: 12, bold: true, color: hi ? C.accent1 : C.text2, align: "right" });
});
s.addNotes("The pilot lowers risk for an enterprise buyer: fixed 90 days, agreed KPIs from slide 7, and an explicit decision point. Pricing is quoted per scope (number of questions, brands, markets and placements).");

// ===================== 10. Close =====================
pres.addSection({ title: "Next steps" });
s = pres.addSlide({ masterName: "AEO_CLOSE", sectionTitle: "Next steps" });
s.addText("NEXT STEP", { placeholder: "kicker" });
s.addText("Let's see where AI stands on your brand", { placeholder: "title" });
const next = [
  ["30-minute intro call", "Your category, competitors and buyer questions. We bring a first look at how AI answers present your brand."],
  ["Pilot scope", "We agree questions, competitors, markets and success measures, and send a written proposal."],
  ["Kickoff", "Daily tracking live in week one; first readout within 30 days."],
];
next.forEach(([h, d], i) => {
  const x = M + i * 4.1;
  card(s, "next " + i, x, 3.0, 3.85, 2.3, C.accent2);
  num(s, "next num " + i, i + 1, x + 0.3, 3.28, C.accent1, C.text2);
  T(s, h, { x: x + 0.3, y: 3.85, w: 3.3, h: 0.4, fontSize: 17, bold: true, color: C.background1 });
  T(s, d, { x: x + 0.3, y: 4.3, w: 3.3, h: 0.95, fontSize: 13, color: "DCE3F0" });
});
T(s, [{ text: "Ilyas, founder   ", options: { bold: true, color: C.background1 } }, { text: "ilyas@aeorank.tech  ·  aeorank.tech/media-kit", options: { color: C.accent1 } }], { x: M, y: 6.0, w: 10, h: 0.45, fontSize: 16, valign: "middle" });
s.addNotes("Close on one concrete ask: the 30-minute call. Offer to run their brand through AEOrank beforehand so the call opens with their own data.");

(async () => {
  await pres.writeFile({ fileName: OUT });
  const { applyTheme } = require(process.env.APPLY_THEME);
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
