// Homepage "why this works" proof section — six panels of stat/mockup pairs
// modeled on the format used across Reddit-marketing competitor sites.
// Every mockup post/comment/AI-answer below uses a fully fictional example
// brand (never Ledgerly, our real running example elsewhere on this page)
// — see the "WHY THIS MATTERS NOW" comment further down app/page.js: an
// earlier version of this homepage showed Ledgerly as if cited by AI,
// which a curious visitor could fact-check and find untrue. Same rule
// applies here. The two mid-row stat panels (bar chart, line chart) use
// fixed sample figures, same "illustrative, not live" convention as
// HeroVisual.js.

const iconStyle = {
  width: 28,
  height: 28,
  borderRadius: 8,
  background: "linear-gradient(160deg, var(--accent), var(--accent-3))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

function BrandIcon() {
  return (
    <div style={iconStyle}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M6 17V10M12 17V6M18 17V13" stroke="#1a1400" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Pill({ children, tone = "good" }) {
  const tones = {
    good: { bg: "rgba(22,163,74,.1)", fg: "#16a34a" },
    accent: { bg: "rgba(242,168,59,.16)", fg: "#b8760f" },
  };
  const t = tones[tone];
  return (
    <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: t.bg, color: t.fg, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function BadgePill() {
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "var(--accent)", color: "#1a1400", whiteSpace: "nowrap" }}>
      AEOrank ↗
    </span>
  );
}

function SubHeader({ sub, members, online, extra }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <BrandIcon />
      <div>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{sub}</div>
        <div style={{ fontSize: 11, color: "#767c8c" }}>
          {members} {online && <>· <span style={{ color: "#16a34a" }}>●</span> {online} online</>}
          {extra && <> · <span style={{ color: "var(--accent-3)" }}>{extra}</span></>}
        </div>
      </div>
    </div>
  );
}

function VoteRow({ ups, comments }) {
  return (
    <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 12, color: "#767c8c" }}>
      <span>↑ {ups} ↓</span>
      <span>💬 {comments}</span>
      <span>↗ Share</span>
    </div>
  );
}

// --- Panel 1: bar chart ---
function TrafficChart() {
  const bars = [
    { y: "2020", h: 28 }, { y: "2021", h: 34 }, { y: "2022", h: 46 },
    { y: "2023", h: 62 }, { y: "2024", h: 60 }, { y: "2025", h: 74 }, { y: "2026", h: 68, live: true },
  ];
  return (
    <div className="results-mock">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <BrandIcon />
        <span style={{ fontWeight: 700, fontSize: 14 }}>Reddit Traffic Over Time</span>
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-.02em", color: "var(--accent-3)" }}>5.5B+</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: "#4d5361" }}>Monthly Visitors</span>
        <Pill>↑ +43% YoY Growth</Pill>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 90 }}>
        {bars.map((b) => (
          <div key={b.y} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative" }}>
            {b.live && (
              <div style={{ position: "absolute", top: -34, background: "var(--accent-3)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>
                5.5B+
              </div>
            )}
            <div style={{ width: "100%", height: b.h, borderRadius: "4px 4px 0 0", background: b.live ? "var(--accent-3)" : "rgba(242,168,59,.35)" }} />
            <span style={{ fontSize: 10.5, color: "#8a96b0" }}>{b.y}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Panel 2: line chart ---
function VisitsChart() {
  const points = [10, 40, 90, 150, 210, 260, 310];
  const w = 300, h = 110;
  const max = Math.max(...points);
  const coords = points.map((v, i) => [
    (i / (points.length - 1)) * w,
    h - (v / max) * h,
  ]);
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
  return (
    <div className="results-mock">
      <div style={{ display: "inline-block", border: "1px solid #ece7dd", borderRadius: 10, padding: "10px 14px", marginBottom: 18 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", color: "#8a96b0", textTransform: "uppercase" }}>Total Visits (all time)</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 24, fontWeight: 800 }}>2.4M</span>
          <Pill>↑ 312%</Pill>
        </div>
        <div style={{ fontSize: 11, color: "#8a96b0", marginTop: 2 }}>vs previous 12 months</div>
      </div>
      <svg viewBox={`0 0 ${w} ${h + 24}`} width="100%" height="140">
        <defs>
          <linearGradient id="rsArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-3)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent-3)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#rsArea)" />
        <path d={path} fill="none" stroke="var(--accent-3)" strokeWidth="2.5" />
        {coords.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === coords.length - 1 ? 5 : 3.5} fill="#fff" stroke="var(--accent-3)" strokeWidth="2" />
        ))}
        {months.map((m, i) => (
          <text key={m} x={coords[i][0]} y={h + 18} fontSize="9.5" fill="#8a96b0" textAnchor="middle">{m}</text>
        ))}
      </svg>
    </div>
  );
}

// --- Panel 3: notification + post ---
function MentionMock() {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ background: "linear-gradient(135deg, var(--accent-3), var(--accent))", borderRadius: "14px 14px 0 0", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>🔔</span>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Someone mentioned your brand on Reddit!</div>
          <div style={{ color: "rgba(255,255,255,.85)", fontSize: 11 }}>r/ecommerce · Just now</div>
        </div>
      </div>
      <div className="results-mock" style={{ borderRadius: "0 0 14px 14px", borderTop: "none" }}>
        <SubHeader sub="r/ecommerce" members="1.2M members" online="263" />
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Ledgerly reviews?</div>
        <VoteRow ups={325} comments={43} />
        <div style={{ borderTop: "1px solid #ece7dd", marginTop: 14, paddingTop: 12, display: "flex", gap: 10 }}>
          <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#f2f1ec", flexShrink: 0 }} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, marginBottom: 3 }}>
              <strong>u/ecomlegend</strong>
              <span style={{ color: "#8a96b0" }}>1mo ago</span>
              <BadgePill />
            </div>
            <div style={{ fontSize: 13 }}>8-fig ecom business owner here. We've been using <span style={{ background: "rgba(242,168,59,.25)", padding: "0 3px", borderRadius: 3 }}>Ledgerly</span> for 5+ years now. Highly recommend them!</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Panel 4: layered social proof ---
function SocialProofMock() {
  return (
    <div style={{ position: "relative", width: "100%", paddingBottom: 10 }}>
      <div className="results-mock" style={{ position: "relative", zIndex: 2 }}>
        <SubHeader sub="r/ecommerce" members="1.2M members" online="263" />
        <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>What's the best ad tracking tool for eCommerce?</div>
        <VoteRow ups={547} comments={76} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: -8, position: "relative", zIndex: 1, minWidth: 0 }}>
        <div className="results-mock" style={{ flex: 1, minWidth: 0, fontSize: 12.5, transform: "translateY(6px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <strong>u/ecom_growth</strong><span style={{ color: "#8a96b0" }}>3d ago</span><BadgePill />
          </div>
          <div>We've used a bunch of tools, but <span style={{ background: "rgba(242,168,59,.25)", padding: "0 3px", borderRadius: 3 }}>Ledgerly</span> is by far the most complete. Accurate attribution, clean UI.</div>
          <div style={{ color: "#8a96b0", marginTop: 6, fontSize: 11 }}>↑ 76 · reply</div>
        </div>
        <div className="results-mock" style={{ flex: 1, minWidth: 0, fontSize: 12.5, transform: "translateY(14px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <strong>u/performance_marketer</strong><span style={{ color: "#8a96b0" }}>23d ago</span><BadgePill />
          </div>
          <div><span style={{ background: "rgba(242,168,59,.25)", padding: "0 3px", borderRadius: 3 }}>Ledgerly</span> changed how we scale. Full visibility across ads, creative and revenue.</div>
          <div style={{ color: "#8a96b0", marginTop: 6, fontSize: 11 }}>↑ 57 · reply</div>
        </div>
      </div>
    </div>
  );
}

// --- Panel 5: 4-card results grid ---
function ResultsGridMock() {
  const items = [
    { sub: "r/digital_marketing", members: "38k Members", extra: "12K+ Monthly Clicks", title: "Best email Marketing software?", user: "tbhthatguy", time: "2mo ago", body: "The best email marketing software we've used so far is BrightPath CRM." },
    { sub: "r/ecommerce", members: "2.8m Members", extra: "28K+ Monthly Clicks", title: "BEST marketing agency for ECOM?", user: "playbook2020", time: "3mo ago", body: "Highly recommend Northgate Media. I've been working with them for 3 years." },
    { sub: "r/nyc", members: "1.0m Members", extra: "9.6K+ Monthly Clicks", title: "Best Roofing Company in New York?", user: "buildernyc", time: "55m ago", body: "We used Summit Roofing Co. a few years ago. Their quote was close to final cost." },
    { sub: "r/malefashionadvice", members: "965k Members", extra: "6.7K+ Monthly Clicks", title: "BEST Men's T-Shirt Brand?", user: "fitcheck_88", time: "6d ago", body: "My go-to tee is from Fenwick Apparel. Great fit, lasts long, keep going back." },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", minWidth: 0 }}>
      {items.map((it) => (
        <div key={it.title} className="results-mock" style={{ minWidth: 0, fontSize: 11.5 }}>
          <SubHeader sub={it.sub} members={it.members} extra={it.extra} />
          <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 8 }}>{it.title}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#f2f1ec", flexShrink: 0 }} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <strong>{it.user}</strong><span style={{ color: "#8a96b0", fontSize: 10.5 }}>{it.time}</span><BadgePill />
              </div>
              <div>{it.body}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Panel 6: Reddit -> AI answer ---
function AIAnswerMock() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 16, width: "100%", minWidth: 0 }}>
      <div className="results-mock" style={{ flex: "1 1 220px", minWidth: 0 }}>
        <SubHeader sub="r/VPN" members="437K members" online="263" />
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Best VPN?</div>
        <VoteRow ups={1200} comments={76} />
        <div style={{ borderTop: "1px solid #ece7dd", marginTop: 12, paddingTop: 10, fontSize: 12.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <strong>u/cool_dave43</strong><span style={{ color: "#8a96b0" }}>1mo ago</span>
            <span style={{ background: "var(--accent)", color: "#1a1400", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 5 }}>Top Comment</span>
          </div>
          <div><span style={{ background: "rgba(242,168,59,.25)", padding: "0 3px", borderRadius: 3 }}>ShieldVPN</span> is the #1 recommended VPN for privacy and security. Fast, reliable, works on all devices.</div>
        </div>
      </div>
      <div style={{ fontSize: 22, color: "var(--accent-3)", flexShrink: 0 }}>→</div>
      <div style={{ background: "#0e1120", borderRadius: 22, padding: "18px 14px", width: 150, flexShrink: 0, color: "#fff" }}>
        <div style={{ fontSize: 10, color: "#8a96b0", marginBottom: 10, textAlign: "center" }}>ChatGPT</div>
        <div style={{ background: "#1c2333", borderRadius: 10, padding: "8px 10px", fontSize: 10.5, marginBottom: 8 }}>
          What's the best VPN you recommend?
        </div>
        <div style={{ fontSize: 10, color: "#c7cbe0", lineHeight: 1.4 }}>
          Based on community recommendations from Reddit, <span style={{ color: "var(--accent)" }}>ShieldVPN</span> is frequently mentioned as the #1 choice for privacy and security.
        </div>
      </div>
    </div>
  );
}

const PANELS_TOP = [
  {
    title: "Take advantage of over 5.5B monthly visitors",
    body: "With 1.2B monthly visitors, Reddit threads now rank within the top 5 results for almost anything you search for on Google. Anyone from consumers to CEOs relies on Reddit when making buying decisions.",
    Visual: TrafficChart,
  },
  {
    title: "Your visibility compounds",
    body: "Every post and comment you publish becomes a long-term traffic asset. Unlike ads that stop the moment you stop paying, Reddit comments stay live indefinitely and your visibility compounds.",
    Visual: VisitsChart,
  },
  {
    title: "Your brand reputation improves",
    body: "AEOrank notifies you every time someone mentions your brand on Reddit — so you can step in and shift the narrative in your favour.",
    Visual: MentionMock,
  },
  {
    title: "You build social proof & increase BOF revenue",
    body: "Create the appearance of real users recommending your brand on Reddit, so every time someone googles your brand, they'll be met with overwhelming social proof.",
    Visual: SocialProofMock,
  },
];

const PANELS_BOTTOM = [
  {
    title: "You'll get new customers from Reddit, month after month",
    body: "Once your brand owns the top comment, you'll capture 90% of the demand. We've seen one well-placed comment generate $50K+.",
    Visual: ResultsGridMock,
  },
  {
    title: "You'll rank #1 on AI search & LLMs",
    body: "Reddit is the top cited source for AI & LLM answers. That means: when your brand is mentioned on Reddit, you'll also show up in Google AI Answers, ChatGPT, Gemini and other AI models.",
    Visual: AIAnswerMock,
  },
];

export default function ResultsSection() {
  return (
    <section className="section">
      <span className="section-tag">( why it works )</span>
      <h2>
        Why brands are moving budget to <span className="accent">Reddit</span>
      </h2>

      <div className="results-grid">
        {PANELS_TOP.map(({ title, body, Visual }) => (
          <div key={title} className="card results-panel">
            <h3>{title}</h3>
            <p>{body}</p>
            <div className="results-visual">
              <Visual />
            </div>
          </div>
        ))}
      </div>

      <h2 className="results-divider">The Results</h2>

      <div className="results-grid">
        {PANELS_BOTTOM.map(({ title, body, Visual }) => (
          <div key={title} className="card results-panel">
            <h3>{title}</h3>
            <p>{body}</p>
            <div className="results-visual">
              <Visual />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
