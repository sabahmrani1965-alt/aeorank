// AEOrank enterprise pitch deck (10 slides, 16:9, editable PowerPoint).
// Run: NODE_PATH=<dir with pptxgenjs> APPLY_THEME=<pptx skill>/scripts/apply_theme.js \
//      node scripts/deck/build-deck.js <out.pptx>
// Styled after aeorank.tech's light marketing theme: Inter headings with amber
// keywords, handwritten Caveat section tags, warm off-white bands and the
// navy product cards. Inter and Caveat must be installed where the deck is
// opened (or send the PDF export). Every figure comes from AEOrank's own data
// or the owner's statements (see speaker notes); the case study slot is a
// marked placeholder until a client approves publishing numbers.
const path = require("path");
const pptxgen = require("pptxgenjs");

const OUT = process.argv[2] || path.join(__dirname, "AEOrank-Enterprise-Deck.pptx");
const IMG = (n) => path.join(__dirname, "img", n);

const THEME = {
  name: "AEOrank",
  headFontFace: "Inter ExtraBold",
  bodyFontFace: "Inter",
  colors: {
    dk1: "14161B", lt1: "FFFFFF", dk2: "0E1C3D", lt2: "FAF9F6",
    accent1: "F2A83B", accent2: "E0861A", accent3: "4D5361", accent4: "767C8C", accent5: "E6E4DD", accent6: "1B2B55",
    hlink: "E0861A", folHlink: "767C8C",
  },
};
const HEX = THEME.colors;
const ON_NAVY = "C9D2E3", NAVY_MUTED = "8E9AB3", MINT = "6EE7B7";
const HEAD = "Inter ExtraBold", BODY = "Inter", HAND = "Caveat";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "AEOrank";
pres.company = "AEOrank";
pres.title = "AEOrank enterprise briefing";
const C = pres.SchemeColor;

const W = 13.333, M = 0.75, CW = W - 2 * M;
const LOGO_R = 240 / 1139;

// ---------- layouts ----------
const tagPh = (y) => ({ placeholder: { options: { name: "tag", type: "body", x: M, y, w: 9, h: 0.45, fontFace: HAND, fontSize: 22, color: C.accent3, margin: 0, valign: "middle" }, text: "" } });
const titlePh = (y, size, color, w = CW, h = 1.1) => ({ placeholder: { options: { name: "title", type: "title", x: M, y, w, h, fontFace: HEAD, fontSize: size, color, valign: "top", align: "left", margin: 0, lineSpacingMultiple: 0.95 }, text: "" } });
const footer = [
  { image: { x: M, y: 6.98, w: 1.15, h: 1.15 * LOGO_R, path: IMG("logo-dark-text.png") } },
  { text: { text: "Enterprise briefing", options: { x: M + 1.35, y: 6.95, w: 4, h: 0.3, fontFace: BODY, fontSize: 10, color: C.accent4, margin: 0, valign: "middle" } } },
];
const slideNum = { x: W - M - 0.6, y: 6.95, w: 0.6, h: 0.3, fontFace: BODY, fontSize: 10, color: C.accent4, align: "right" };

pres.defineSlideMaster({
  title: "AEO_COVER",
  background: { color: HEX.lt1 },
  objects: [
    { placeholder: { options: { name: "tag", type: "body", x: M, y: 2.05, w: 6.6, h: 0.45, fontFace: HAND, fontSize: 22, color: C.accent3, margin: 0, valign: "middle" }, text: "" } },
    titlePh(2.55, 52, C.text1, 6.6, 1.9),
    { placeholder: { options: { name: "body", type: "body", x: M, y: 4.45, w: 6.5, h: 1.2, fontFace: BODY, fontSize: 15.5, color: C.accent3, valign: "top", margin: 0, lineSpacingMultiple: 1.15 }, text: "" } },
  ],
});
pres.defineSlideMaster({ title: "AEO_LIGHT", background: { color: HEX.lt1 }, objects: [tagPh(0.5), titlePh(0.95, 32, C.text1), ...footer], slideNumber: slideNum });
pres.defineSlideMaster({ title: "AEO_WARM", background: { color: HEX.lt2 }, objects: [tagPh(0.5), titlePh(0.95, 32, C.text1), ...footer], slideNumber: slideNum });
pres.defineSlideMaster({
  title: "AEO_DARK",
  background: { color: HEX.dk2 },
  objects: [
    { placeholder: { options: { name: "tag", type: "body", x: M, y: 1.25, w: 9, h: 0.45, fontFace: HAND, fontSize: 24, color: C.accent1, margin: 0, valign: "middle" }, text: "" } },
    titlePh(1.75, 44, C.background1, CW, 1.0),
    { image: { x: M, y: 0.5, w: 1.6, h: 1.6 * LOGO_R, path: IMG("logo-white-text.png") } },
  ],
});

// ---------- helpers ----------
const T = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, fontFace: BODY, color: C.text1, valign: "top", ...o });
const softShadow = () => ({ type: "outer", color: "14161B", opacity: 0.07, blur: 12, offset: 3, angle: 90 });
// White card with the site's soft border; navy card = the product panels.
const card = (s, name, x, y, w, h, o = {}) =>
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    objectName: name, x, y, w, h, rectRadius: o.r ?? 0.16,
    fill: { color: o.fill ?? C.background1 },
    line: o.line === null ? { type: "none" } : { color: o.line ?? HEX.accent5, width: o.lineW ?? 1, dashType: o.dash },
    shadow: o.shadow === false ? undefined : softShadow(),
  });
const navy = (s, name, x, y, w, h) => card(s, name, x, y, w, h, { fill: C.text2, line: null });
const chip = (s, name, x, y, fill = C.accent1, size = 0.13) =>
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: name, x, y, w: size, h: size, rectRadius: 0.03, fill: { color: fill }, line: { type: "none" } });
// Amber rounded square with a number, like the site's feature icons.
const badge = (s, name, n, x, y, o = {}) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: name, x, y, w: 0.46, h: 0.46, rectRadius: 0.1, fill: { color: o.fill ?? "FDF0DC" }, line: { type: "none" } });
  T(s, String(n), { x, y, w: 0.46, h: 0.46, align: "center", valign: "middle", fontFace: HEAD, fontSize: 15, color: o.color ?? C.accent2 });
};
const pill = (s, name, text, x, y, w, o = {}) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: name, x, y, w, h: o.h ?? 0.34, rectRadius: (o.h ?? 0.34) / 2, fill: { color: o.fill ?? "FFF6E8" }, line: o.line === null ? { type: "none" } : { color: o.line ?? "F7D9A8", width: 1 } });
  T(s, text, { x, y, w, h: o.h ?? 0.34, align: "center", valign: "middle", fontSize: o.size ?? 11, bold: o.bold ?? false, color: o.color ?? C.accent2 });
};
const label = (s, text, x, y, w, color = NAVY_MUTED) => T(s, text.toUpperCase(), { x, y, w, h: 0.28, fontSize: 10, bold: true, color, charSpacing: 1.5, valign: "middle" });
const shot = (s, name, file, x, y, w, ratio) => {
  const h = w * ratio;
  card(s, name + " frame", x - 0.08, y - 0.08, w + 0.16, h + 0.16, { r: 0.12 });
  s.addImage({ path: file, x, y, w, h, objectName: name });
  return h;
};
const button = (s, name, text, x, y, w) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: name, x, y, w, h: 0.6, rectRadius: 0.12, fill: { color: C.accent1 }, line: { type: "none" }, shadow: { type: "outer", color: "E0861A", opacity: 0.3, blur: 14, offset: 4, angle: 90 } });
  T(s, text, { x, y, w, h: 0.6, align: "center", valign: "middle", fontSize: 15, bold: true, color: C.text1 });
};
const title = (s, plain, hi, after = "") =>
  s.addText([{ text: plain }, { text: hi, options: { color: C.accent2 } }, ...(after ? [{ text: after }] : [])], { placeholder: "title" });
const bars = (s, name, labels, values, o) =>
  s.addChart(pres.charts.BAR, [{ name, labels, values }], {
    objectName: name, x: o.x, y: o.y, w: o.w, h: o.h,
    barDir: "bar", catAxisOrientation: "maxMin", valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: o.max,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLineShow: false,
    catAxisLabelColor: o.labelColor, catAxisLabelFontSize: o.font ?? 12, catAxisLabelFontFace: "+mn-lt",
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: o.font ?? 12, dataLabelFontFace: "+mn-lt", dataLabelColor: o.valueColor, dataLabelFontBold: true,
    dataLabelFormatCode: o.format, chartColors: [o.color], barGapWidthPct: 70, showLegend: false,
    ...(o.bg ? { plotArea: { fill: { color: o.bg } }, chartArea: { fill: { color: o.bg } } } : {}),
  });

// ===================== 1. Cover =====================
pres.addSection({ title: "Opening" });
let s = pres.addSlide({ masterName: "AEO_COVER", sectionTitle: "Opening" });
// the site's soft amber glow behind the hero card
s.addShape(pres.shapes.OVAL, { objectName: "glow", x: 6.4, y: 0.6, w: 6.6, h: 6.4, fill: { color: C.accent1, transparency: 92 }, line: { type: "none" } });
s.addImage({ path: IMG("logo-dark-text.png"), x: M, y: 0.55, w: 1.9, h: 1.9 * LOGO_R, objectName: "logo" });
pill(s, "briefing pill", "Enterprise briefing  ·  ChatGPT · Gemini · Claude", M, 1.45, 4.0);
s.addText("( AEOrank: Answer Engine Optimization )", { placeholder: "tag" });
title(s, "Be the brand AI ", "recommends");
s.addText("Your buyers ask ChatGPT, Gemini and Claude which software to choose. We get your brand into those answers, through the Reddit conversations they learn from.", { placeholder: "body" });
button(s, "cta", "Book a 30-minute call  →", M, 5.9, 3.0);
T(s, [{ text: "Recent clients   ", options: { color: C.accent4, fontSize: 12 } }, { text: "Sovos  ·  TINCheck", options: { color: C.text1, fontSize: 14, bold: true } }], { x: 3.95, y: 5.9, w: 3.6, h: 0.6, valign: "middle" });
// hero card: an AI answer your brand may be missing from
navy(s, "AI answer card", 7.75, 1.35, 4.83, 4.95);
label(s, "A buyer asks ChatGPT", 8.15, 1.7, 4);
card(s, "question", 8.15, 2.08, 4.03, 0.78, { fill: C.accent6, line: null, shadow: false, r: 0.12 });
T(s, "“Which CRM should a 50-person sales team choose?”", { x: 8.35, y: 2.08, w: 3.7, h: 0.78, fontSize: 14, italic: true, color: C.background1, valign: "middle" });
label(s, "The answer names", 8.15, 3.1, 4);
[["Vendor A", 1], ["Vendor B", 0.78], ["Vendor C", 0.6]].forEach(([v, f], i) => {
  const y = 3.5 + i * 0.5;
  T(s, [{ text: `${i + 1}   `, options: { color: C.accent1, bold: true } }, { text: v, options: { color: C.background1 } }], { x: 8.15, y, w: 1.6, h: 0.36, fontSize: 13, valign: "middle" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: "track " + i, x: 9.8, y: y + 0.13, w: 2.38, h: 0.1, rectRadius: 0.05, fill: { color: C.accent6 }, line: { type: "none" } });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: "bar " + i, x: 9.8, y: y + 0.13, w: 2.38 * f, h: 0.1, rectRadius: 0.05, fill: { color: C.accent1 }, line: { type: "none" } });
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: "your brand row", x: 8.15, y: 5.1, w: 4.03, h: 0.5, rectRadius: 0.1, fill: { color: C.text2 }, line: { color: C.accent1, width: 1.25, dashType: "dash" } });
T(s, [{ text: "?   ", options: { bold: true } }, { text: "Your brand", options: { bold: true } }], { x: 8.35, y: 5.1, w: 3.7, h: 0.5, fontSize: 13, color: C.accent1, valign: "middle" });
T(s, "Illustrative answer", { x: 8.15, y: 5.78, w: 4, h: 0.3, fontSize: 10, color: NAVY_MUTED, italic: true });
s.addNotes("Open with the buyer's reality: software shortlists now start in an AI assistant, and each answer names only a handful of vendors. The card is illustrative; the next slides use measured data. Positioning: AEOrank gets your brand into those answers, with Reddit as the main lever. Recent clients: Sovos and TINCheck.");

// ===================== 2. The shift =====================
pres.addSection({ title: "Problem" });
s = pres.addSlide({ masterName: "AEO_WARM", sectionTitle: "Problem" });
s.addText("( the shift )", { placeholder: "tag" });
title(s, "The software shortlist is now written by ", "AI");
navy(s, "share panel", M, 2.0, 7.3, 4.6);
label(s, "Share of AI answers naming each CRM", M + 0.4, 2.25, 6);
bars(s, "CRM share chart", ["Pipedrive", "HubSpot", "Zoho CRM", "Salesforce", "Monday.com", "Attio", "Copper", "Capsule CRM"], [100, 97, 56, 38, 27, 0, 0, 0],
  { x: M + 0.25, y: 2.55, w: 6.8, h: 3.55, max: 118, color: HEX.accent1, labelColor: ON_NAVY, valueColor: "FFFFFF", format: '0"%"', bg: HEX.dk2 });
T(s, "AEOrank daily data · 34 answers from ChatGPT, Gemini and Claude · 15–21 Oct 2026", { x: M + 0.4, y: 6.15, w: 6.6, h: 0.3, fontSize: 10, color: NAVY_MUTED });
card(s, "stat 100", 8.4, 2.0, 4.18, 1.95);
T(s, "100%", { x: 8.75, y: 2.2, w: 3.6, h: 0.8, fontFace: HEAD, fontSize: 46, color: C.accent2 });
T(s, "Pipedrive was named in every answer, on all three engines.", { x: 8.75, y: 3.05, w: 3.55, h: 0.7, fontSize: 13.5, color: C.accent3 });
card(s, "stat 0", 8.4, 4.15, 4.18, 1.95);
T(s, "0%", { x: 8.75, y: 4.35, w: 3.6, h: 0.8, fontFace: HEAD, fontSize: 46, color: C.text1 });
T(s, "Attio, Copper and Capsule CRM, all established vendors, were named in none.", { x: 8.75, y: 5.2, w: 3.55, h: 0.7, fontSize: 13.5, color: C.accent3 });
T(s, "Not in the answer = not on the shortlist.", { x: 8.4, y: 6.25, w: 4.18, h: 0.35, fontSize: 14, bold: true, color: C.text1 });
s.addNotes("Measured, not estimated: our public daily tracking of CRM software. The same split shows up across the 13 SaaS categories we track: a few vendors take most mentions, and established products can be absent entirely. Their category almost certainly has the same pattern, and today nobody on their team is measuring it.");

// ===================== 3. Blind spot =====================
s = pres.addSlide({ masterName: "AEO_LIGHT", sectionTitle: "Problem" });
s.addText("( the blind spot )", { placeholder: "tag" });
title(s, "Your reports track search, not the ", "AI answer");
card(s, "seo column", M, 2.05, 5.3, 4.1);
label(s, "What your reports show", M + 0.4, 2.35, 4.5, C.accent4);
["Keyword rankings", "Organic traffic", "Backlinks and authority", "Share of search"].forEach((t, i) => {
  chip(s, "seo chip " + i, M + 0.42, 2.98 + i * 0.7, "C9CCD3");
  T(s, t, { x: M + 0.75, y: 2.87 + i * 0.7, w: 4.3, h: 0.36, fontSize: 16, color: C.accent3, valign: "middle" });
});
s.addShape(pres.shapes.RIGHT_ARROW, { objectName: "arrow", x: 6.22, y: 3.85, w: 0.62, h: 0.5, fill: { color: C.accent1 }, line: { type: "none" } });
navy(s, "ai column", 7.08, 2.05, 5.5, 4.1);
label(s, "What decides the shortlist", 7.48, 2.35, 4.5);
["Is your brand named at all?", "In what position?", "Who is named instead?", "Which pages does the answer cite?", "How does it differ by engine?"].forEach((t, i) => {
  chip(s, "ai chip " + i, 7.5, 2.98 + i * 0.6);
  T(s, t, { x: 7.83, y: 2.87 + i * 0.6, w: 4.5, h: 0.36, fontSize: 16, color: C.background1, valign: "middle" });
});
T(s, [{ text: "AEOrank adds the missing layer: ", options: { bold: true, color: C.text1 } }, { text: "the AI answer, question by question and engine by engine.", options: { color: C.accent3 } }], { x: M, y: 6.32, w: CW, h: 0.4, fontSize: 15 });
s.addNotes("Most enterprise teams have mature SEO and brand reporting, but none of it answers the five questions on the right. That gap is why AI visibility goes unmanaged even in well-run marketing teams.");

// ===================== 4. Why Reddit =====================
pres.addSection({ title: "Approach" });
s = pres.addSlide({ masterName: "AEO_WARM", sectionTitle: "Approach" });
s.addText("( why reddit )", { placeholder: "tag" });
title(s, "AI answers mirror what buyers ", "say on Reddit");
const crms = ["HubSpot", "Zoho", "Pipedrive", "Attio", "Copper", "Capsule CRM"];
card(s, "reddit panel", M, 2.0, 5.75, 3.55);
label(s, "On Reddit", M + 0.4, 2.25, 3, C.accent2);
T(s, "Mentions in r/CRM's busiest thread (345 comments)", { x: M + 0.4, y: 2.53, w: 5, h: 0.3, fontSize: 11.5, color: C.accent4 });
bars(s, "reddit chart", crms, [19, 9, 8, 0, 0, 0], { x: M + 0.25, y: 2.85, w: 5.3, h: 2.55, max: 23, color: HEX.dk2, labelColor: HEX.dk1, valueColor: HEX.dk1, font: 11.5 });
navy(s, "ai panel", 6.83, 2.0, 5.75, 3.55);
label(s, "In AI answers", 7.23, 2.25, 3, C.accent1);
T(s, "Share of answers naming each CRM", { x: 7.23, y: 2.53, w: 5, h: 0.3, fontSize: 11.5, color: NAVY_MUTED });
bars(s, "ai chart", crms, [97, 56, 100, 0, 0, 0], { x: 7.08, y: 2.85, w: 5.3, h: 2.55, max: 120, color: HEX.accent1, labelColor: ON_NAVY, valueColor: "FFFFFF", format: '0"%"', font: 11.5, bg: HEX.dk2 });
const facts = [
  ["Same leaders, same absentees.", "The vendors buyers discuss are the vendors AI names."],
  ["Reddit feeds the models.", "Its 2024 data agreements with Google and OpenAI put these threads into what AI learns."],
  ["And the live answers.", "ChatGPT cites Reddit next to G2 and Capterra when buyers ask what people recommend."],
];
facts.forEach(([h, d], i) => {
  const x = M + i * 3.98;
  chip(s, "fact chip " + i, x, 5.87);
  T(s, [{ text: h + " ", options: { bold: true, color: C.text1 } }, { text: d, options: { color: C.accent3 } }], { x: x + 0.27, y: 5.77, w: 3.55, h: 0.95, fontSize: 12 });
});
s.addNotes("Be precise, it builds trust. Left: CRM mentions in the post and top comments of r/CRM's busiest thread. Right: our measured AI share for the same CRMs. Reddit reaches AI two ways: training data (its 2024 licensing agreements with Google and OpenAI) and live citations. In our test of 8 buyer questions on ChatGPT with web search, live citations were mostly vendor and review sites; Reddit was cited when the question asked what people actually recommend. Review sites are part of the source map we work on too.");

// ===================== 5. What we do =====================
s = pres.addSlide({ masterName: "AEO_LIGHT", sectionTitle: "Approach" });
s.addText("( what we do )", { placeholder: "tag" });
title(s, "We put your brand ", "in the conversation");
const loop = [
  ["Measure", "Your buyer questions, asked daily on ChatGPT, Gemini and Claude. Named or not, at what position, and who instead."],
  ["Find", "The Reddit threads and pages each answer draws on, ranked by buyer intent."],
  ["Contribute", "Story-led posts and honest replies in those threads, approved by your team."],
  ["Prove", "Re-measure every month. What moved the answers gets more weight."],
];
const lw = 2.78, lg = 0.23;
loop.forEach(([h, d], i) => {
  const x = M + i * (lw + lg);
  card(s, "step " + h, x, 2.0, lw, 2.75);
  badge(s, "step badge " + i, i + 1, x + 0.3, 2.3);
  T(s, h, { x: x + 0.3, y: 2.95, w: lw - 0.5, h: 0.4, fontFace: HEAD, fontSize: 18, color: C.text1 });
  T(s, d, { x: x + 0.3, y: 3.4, w: lw - 0.55, h: 1.25, fontSize: 12.5, color: C.accent3, lineSpacingMultiple: 1.1 });
});
const cmp = [
  ["SEO agencies", "Your own website"],
  ["PR agencies", "Media coverage"],
  ["AEOrank", "The conversations AI learns from"],
];
label(s, "Where each one works", M, 5.08, 5, C.accent4);
cmp.forEach(([h, d], i) => {
  const x = M + i * 4.03, hi = i === 2;
  if (hi) navy(s, "compare " + h, x, 5.45, 3.77, 1.15);
  else card(s, "compare " + h, x, 5.45, 3.77, 1.15, { fill: C.background2, shadow: false });
  T(s, h, { x: x + 0.3, y: 5.6, w: 3.3, h: 0.35, fontSize: 14, bold: true, color: hi ? C.accent1 : C.text1 });
  T(s, d, { x: x + 0.3, y: 5.97, w: 3.3, h: 0.45, fontSize: 14, color: hi ? C.background1 : C.accent3 });
});
s.addNotes("The operating loop: measurement decides where we act, and the next month's measurement shows whether it worked. We don't replace their SEO or PR agencies; we cover the layer neither of them measures or works on.");

// ===================== 6. How it's done =====================
pres.addSection({ title: "Delivery" });
s = pres.addSlide({ masterName: "AEO_WARM", sectionTitle: "Delivery" });
s.addText("( how it's done )", { placeholder: "tag" });
title(s, "Story-led posts, ", "approved by you");
navy(s, "thread panel", M, 2.0, 6.0, 4.65);
label(s, "A thread your buyers read", M + 0.4, 2.25, 5);
card(s, "thread card", M + 0.35, 2.62, 5.3, 1.0, { fill: C.accent6, line: null, shadow: false, r: 0.12 });
T(s, [{ text: "r/CRM", options: { color: C.accent1, bold: true } }, { text: "  ·  345 comments", options: { color: NAVY_MUTED } }], { x: M + 0.6, y: 2.72, w: 4.8, h: 0.3, fontSize: 11 });
T(s, "Best and inexpensive CRM for small business", { x: M + 0.6, y: 3.04, w: 4.9, h: 0.45, fontSize: 15, bold: true, color: C.background1 });
label(s, "Draft reply · illustrative", M + 0.4, 3.85, 5);
card(s, "draft card", M + 0.35, 4.2, 5.3, 2.2, { fill: C.background1, line: null, shadow: false, r: 0.12 });
T(s, [
  { text: "Disclosure: I work at Your brand.", options: { bold: true, color: C.text1, breakLine: true } },
  { text: "A situation we see a lot: a 10-person team outgrows spreadsheets, but every CRM demo assumes a full sales ops team. If that's you, look at how long setup takes and what reporting costs extra. HubSpot's free tier is a good start; we fit better once you need …", options: { color: C.accent3 } },
], { x: M + 0.6, y: 4.35, w: 4.85, h: 1.95, fontSize: 12, lineSpacingMultiple: 1.1, paraSpaceAfter: 4 });
const gov = [
  ["Select", "threads where your buyers ask"],
  ["Research", "the full thread and subreddit rules"],
  ["Draft", "story-led, answer first, disclosed"],
  ["Approve", "your team signs off every word"],
  ["Publish & track", "reach and effect on AI answers"],
];
gov.forEach(([h, d], i) => {
  const y = 2.0 + i * 0.56, hi = i === 3;
  card(s, "gov " + h, 7.0, y, 5.58, 0.46, { fill: hi ? C.accent1 : C.background1, line: hi ? null : undefined, shadow: false, r: 0.1 });
  T(s, [{ text: `${i + 1}  ${h}`, options: { bold: true, color: C.text1 } }, { text: "   " + d, options: { color: hi ? C.text1 : C.accent3 } }], { x: 7.25, y, w: 5.2, h: 0.46, fontSize: 12.5, valign: "middle" });
});
const rules = [
  ["Always", C.accent2, ["Real answers to real questions", "Honest comparisons", "Subreddit rules followed"]],
  ["Never", C.text1, ["Bought votes", "Fake reviews or bots", "Hidden affiliation"]],
];
rules.forEach(([h, col, items], i) => {
  const x = 7.0 + i * 2.87;
  card(s, "rules " + h, x, 4.9, 2.71, 1.75);
  T(s, h, { x: x + 0.25, y: 5.05, w: 2.3, h: 0.32, fontFace: HEAD, fontSize: 14, color: col });
  T(s, items.map((t, j, a) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: j < a.length - 1 } })), { x: x + 0.25, y: 5.42, w: 2.35, h: 1.15, fontSize: 11.5, color: C.accent3, paraSpaceAfter: 3 });
});
s.addNotes("The slide legal and brand teams care about. The thread is real (r/CRM); the draft is an illustration of the style: it opens with a real buyer situation, answers the question, names alternatives honestly and discloses the affiliation. Step 4 is the control point: nothing goes live without sign-off. Publishing runs through the client's own accounts or established community members, within each subreddit's rules.");

// ===================== 7. What you see =====================
s = pres.addSlide({ masterName: "AEO_LIGHT", sectionTitle: "Delivery" });
s.addText("( what you see )", { placeholder: "tag" });
title(s, "Proof every month, ", "engine by engine");
const kpis = [
  ["Share of AI answers", "% of answers naming you, per engine"],
  ["Average position", "Where you appear when named"],
  ["Share of voice", "You against each competitor"],
  ["Cited sources", "Pages AI links to, and whether yours is one"],
  ["Reddit footprint", "Placements, reach and replies"],
];
kpis.forEach(([h, d], i) => {
  const y = 2.0 + i * 0.8;
  badge(s, "kpi badge " + i, i + 1, M, y + 0.08);
  T(s, h, { x: M + 0.65, y: y + 0.02, w: 4.6, h: 0.32, fontSize: 15, bold: true, color: C.text1 });
  T(s, d, { x: M + 0.65, y: y + 0.34, w: 4.6, h: 0.3, fontSize: 12.5, color: C.accent3 });
});
pill(s, "cadence", "Weekly email  ·  Monthly readout  ·  Quarterly leadership review", M, 6.12, 5.1, { size: 11, bold: true });
const sx = 6.75, swd = 5.8;
const hA = shot(s, "prompt card screenshot", IMG("promptcard.png"), sx, 2.08, swd, 361 / 1500);
const hB = shot(s, "share of voice screenshot", IMG("sov.png"), sx, 2.08 + hA + 0.3, swd, 683 / 1500);
T(s, "Real AEOrank screens · a well-known CRM brand, renamed “Your brand”", { x: sx, y: 2.08 + hA + 0.3 + hB + 0.14, w: swd, h: 0.28, fontSize: 10, color: C.accent4, italic: true });
s.addNotes("Real AEOrank screens. Each tracked question shows which engines name the brand and at what position; share of voice compares the brand with every competitor named. The example is a well-known CRM brand tracked from public AI answers, anonymised. These KPIs become the pilot's success measures.");

// ===================== 8. Proof =====================
pres.addSection({ title: "Proof" });
s = pres.addSlide({ masterName: "AEO_WARM", sectionTitle: "Proof" });
s.addText("( proof )", { placeholder: "tag" });
title(s, "What we've measured, delivered, and ", "will prove");
const proof = [
  ["Measured", "13", "SaaS categories tracked daily on ChatGPT, Gemini and Claude", ["Leaders in up to 100% of answers", "Established vendors at 0%", "Reddit names the same leaders"], "light"],
  ["Client", "Sovos", "Global tax-compliance software", ["Reddit programme in a regulated category", "TINCheck, also a recent client"], "navy"],
  ["Your pilot", "90", "days to test it on your own buyer questions", ["Higher share of AI answers", "Your pages among cited sources", "Hypotheses to test, not guaranteed results"], "light"],
];
proof.forEach(([h, big, sub, items, kind], i) => {
  const x = M + i * 4.03, dark = kind === "navy";
  if (dark) navy(s, "proof " + h, x, 2.0, 3.77, 3.45);
  else card(s, "proof " + h, x, 2.0, 3.77, 3.45);
  label(s, h, x + 0.35, 2.25, 3, dark ? C.accent1 : C.accent2);
  T(s, big, { x: x + 0.35, y: 2.55, w: 3.2, h: 0.8, fontFace: HEAD, fontSize: 44, color: dark ? C.background1 : C.text1 });
  T(s, sub, { x: x + 0.35, y: 3.38, w: 3.15, h: 0.6, fontSize: 12, color: dark ? ON_NAVY : C.accent3 });
  T(s, items.map((t, j, a) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: j < a.length - 1, italic: i === 2 && j === a.length - 1 } })), { x: x + 0.35, y: 4.08, w: 3.2, h: 1.25, fontSize: 11.5, color: dark ? C.background1 : C.text1, paraSpaceAfter: 3 });
});
card(s, "pilot results note", M, 5.7, CW, 1.0, { fill: C.background1, shadow: false });
T(s, [{ text: "Your numbers come from your pilot: ", options: { bold: true, color: C.text1 } }, { text: "a week-1 baseline of share of AI answers, position and cited sources, then the same measures every month.", options: { color: C.accent3 } }], { x: M + 0.35, y: 5.7, w: CW - 0.7, h: 1.0, fontSize: 13, valign: "middle" });
s.addNotes("Keep measured facts and hypotheses separate, as the slide does. Sovos and TINCheck are recent clients; we don't publish client result numbers, so results are proven in the prospect's own pilot against a week-1 baseline. Never promise guaranteed citations or rankings.");

// ===================== 9. How to start =====================
pres.addSection({ title: "Engagement" });
s = pres.addSlide({ masterName: "AEO_LIGHT", sectionTitle: "Engagement" });
s.addText("( how to start )", { placeholder: "tag" });
title(s, "Start with a 90-day pilot, then ", "scale");
const phases = [
  ["Weeks 1–2", "Baseline", "Questions, competitors and markets agreed; daily tracking live"],
  ["Weeks 3–6", "Source map", "Threads and pages behind the answers; first approved posts"],
  ["Weeks 7–12", "Programme", "Posts running; monthly readouts with your team"],
  ["Day 90", "Decision", "Results against the agreed KPIs: scale, adjust or stop"],
];
s.addShape(pres.shapes.LINE, { objectName: "timeline", x: M + 0.15, y: 2.2, w: CW - 0.3, h: 0, line: { color: HEX.accent5, width: 2 } });
phases.forEach(([when, h, d], i) => {
  const x = M + i * 3.0;
  s.addShape(pres.shapes.OVAL, { objectName: "dot " + i, x, y: 2.05, w: 0.3, h: 0.3, fill: { color: i === 3 ? C.accent1 : C.text2 }, line: { color: C.background1, width: 2 } });
  T(s, when, { x, y: 2.5, w: 2.8, h: 0.28, fontSize: 11.5, bold: true, color: C.accent2 });
  T(s, h, { x, y: 2.8, w: 2.8, h: 0.38, fontFace: HEAD, fontSize: 17, color: C.text1 });
  T(s, d, { x, y: 3.22, w: 2.7, h: 0.75, fontSize: 12, color: C.accent3 });
});
const offers = [
  ["Step 1 · 90 days", "AI Visibility Pilot", ["Priority buyer questions on 3 engines", "Benchmark against chosen competitors", "Source map and Reddit programme", "Monthly readouts, final report at day 90"], true],
  ["Step 2 · Ongoing", "Enterprise programme", ["Every product, brand and market", "Dedicated strategist, monthly session", "Unlimited team access to the platform", "Leadership reporting on AI visibility"], false],
];
offers.forEach(([step, h, items, hi], i) => {
  const x = M + i * 5.97;
  if (hi) navy(s, "offer " + i, x, 4.2, 5.86, 2.5);
  else card(s, "offer " + i, x, 4.2, 5.86, 2.5);
  label(s, step, x + 0.35, 4.4, 3, hi ? C.accent1 : C.accent2);
  T(s, h, { x: x + 0.35, y: 4.7, w: 4, h: 0.42, fontFace: HEAD, fontSize: 19, color: hi ? C.background1 : C.text1 });
  T(s, items.map((t, j, a) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: j < a.length - 1 } })), { x: x + 0.35, y: 5.22, w: 3.9, h: 1.35, fontSize: 12, color: hi ? ON_NAVY : C.accent3, paraSpaceAfter: 2 });
  pill(s, "price " + i, "Pricing on request", x + 4.0, 6.12, 1.6, hi ? { fill: C.accent1, line: null, color: C.text1, bold: true } : { bold: true });
});
s.addNotes("The pilot de-risks the decision: a fixed 90 days, KPIs agreed up front (slide 7) and an explicit decision point. Pricing is quoted per scope: number of questions, brands, markets and posts.");

// ===================== 10. Close =====================
pres.addSection({ title: "Next steps" });
s = pres.addSlide({ masterName: "AEO_DARK", sectionTitle: "Next steps" });
s.addText("( next step )", { placeholder: "tag" });
title(s, "Let's see what AI ", "says about you");
const next = [
  ["30-minute call", "Your category, competitors and buyer questions. We bring a first look at your brand in AI answers."],
  ["Pilot scope", "Questions, competitors, markets and success measures, in a written proposal."],
  ["Kickoff", "Daily tracking live in week one; first readout within 30 days."],
];
next.forEach(([h, d], i) => {
  const x = M + i * 4.03;
  card(s, "next " + i, x, 3.2, 3.77, 2.05, { fill: C.accent6, line: null, shadow: false });
  badge(s, "next badge " + i, i + 1, x + 0.35, 3.45, { fill: C.accent1, color: C.text1 });
  T(s, h, { x: x + 0.35, y: 4.05, w: 3.2, h: 0.38, fontFace: HEAD, fontSize: 17, color: C.background1 });
  T(s, d, { x: x + 0.35, y: 4.47, w: 3.15, h: 0.75, fontSize: 12, color: ON_NAVY });
});
button(s, "cta", "Book a 30-minute call  →", M, 5.85, 3.0);
T(s, [{ text: "Ilyas, founder   ", options: { bold: true, color: C.background1 } }, { text: "ilyas@aeorank.tech  ·  aeorank.tech", options: { color: C.accent1 } }], { x: 4.05, y: 5.85, w: 8, h: 0.6, fontSize: 15, valign: "middle" });
s.addNotes("Close on one concrete ask: the 30-minute call. Offer to run their brand through AEOrank beforehand so the call opens with their own data.");

(async () => {
  await pres.writeFile({ fileName: OUT });
  const { applyTheme } = require(process.env.APPLY_THEME);
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
