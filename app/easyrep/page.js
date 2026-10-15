// EasyRep AI's product site, served at easyrepai.app (middleware rewrites
// that domain's root here). The app is live, so every call to action goes
// to the App Store. Screens shown are real app screens, cut from the store
// screenshots; the lifestyle photos behind them are AI-generated scenes,
// never presented as customers. Honest by design: no download counts or ratings we do not
// have, and nothing the app does not do.

const APP_STORE_URL = "https://apps.apple.com/us/app/easyrep-ai/id6809562228";

export const metadata = {
  title: "EasyRep AI - Your personal AI fitness coach",
  description:
    "Scan any gym machine, check your form with live body tracking, log meals from a photo and follow a plan built for beginners. Free on the App Store.",
  itunes: { appId: "6809562228" },
  openGraph: {
    title: "EasyRep AI - Your personal AI fitness coach",
    description: "The gym, without the guesswork. Free on the App Store.",
    images: [{ url: "https://www.easyrepai.app/easyrep/v2/og.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["https://www.easyrepai.app/easyrep/v2/og.jpg"] },
};

const FEATURES = [
  {
    img: "/easyrep/v2/phone-scan.webp",
    photo: "/easyrep/v2/photo-scan.webp",
    phoneSide: "right",
    kicker: "MACHINE SCANNER",
    title: "Point at any machine. Know how to use it.",
    body: "Aim your camera at anything on the gym floor. EasyRep names it, shows the muscles it works and walks you through the setup, step by step.",
    chips: ["Live viewfinder", "Muscles worked", "Step-by-step setup"],
  },
  {
    img: "/easyrep/v2/phone-form.webp",
    photo: "/easyrep/v2/photo-form.webp",
    phoneSide: "right",
    kicker: "FORM CHECK",
    title: "See your form, live.",
    body: "Record a set and EasyRep tracks your body as you move: your skeleton on screen, a depth check on squats and lunges, and a rep count. Afterwards you get what you did well and one thing to adjust.",
    chips: ["Live body tracking", "Depth check", "Video stays on your phone"],
    flip: true,
  },
  {
    img: "/easyrep/v2/phone-session.webp",
    photo: "/easyrep/v2/photo-session.webp",
    phoneSide: "right",
    kicker: "YOUR WORKOUT",
    title: "Every set, one tap.",
    body: "Follow today's session and tick off each set as you go. A machine is taken? Swap it for an equivalent in one tap and keep moving.",
    chips: ["Tick off sets", "Swap a busy machine", "Built for beginners"],
  },
  {
    img: "/easyrep/v2/phone-nutrition.webp",
    photo: "/easyrep/v2/photo-nutrition.webp",
    phoneSide: "right",
    kicker: "NUTRITION",
    title: "Snap your plate. See your day.",
    body: "Photograph a meal or type it in. Calories, protein, carbs and fat add up against targets worked out from your body, and the app always says when a number is an estimate.",
    chips: ["Meal photos", "Macros", "Water"],
    flip: true,
  },
  {
    img: "/easyrep/v2/phone-ask.webp",
    photo: "/easyrep/v2/photo-ask.webp",
    phoneSide: "left",
    kicker: "AI COACH",
    title: "Ask what you'd never ask out loud.",
    body: "Rest days, protein, soreness, the unwritten rules of the gym floor. Plain, judgement-free answers that know your plan.",
    chips: ["Training", "Nutrition", "Technique"],
  },
];

const STEPS = [
  { n: "1", title: "Tell us what feels hard", body: "A two-minute setup asks your goal, your week and what worries you about the gym." },
  { n: "2", title: "Get a plan that starts easy", body: "Short sessions, machines first, so the equipment guides the movement while you learn." },
  { n: "3", title: "Train with a coach in your pocket", body: "Scan machines, check your form, log meals and ask anything, whenever you need it." },
];

const FAQ = [
  {
    q: "Who is EasyRep for?",
    a: "Anyone who wants to train but feels lost in the gym. The setup asks what feels hardest, and the plan starts on machines because they guide the movement for you. Nothing assumes you already know anything.",
  },
  {
    q: "Is it free?",
    a: "EasyRep is free to download. Your plan, streak, week view and machine list are free, and you get free tries of each AI tool. EasyRep Pro makes scans, form checks and coach questions unlimited, monthly or yearly.",
  },
  {
    q: "Does my workout video get uploaded?",
    a: "No. The live body tracking runs on your iPhone, and the video never leaves it. For the review afterwards, six still frames are taken on your phone and only those are analysed. They are not stored on our servers.",
  },
  {
    q: "How accurate are the scans?",
    a: "Machine recognition is reliable for common gym equipment. Meal and body estimates are approximate by nature, and the app says so on every result instead of inventing precision.",
  },
  {
    q: "Which devices does it run on?",
    a: "EasyRep is an iPhone app, available on the App Store.",
  },
  {
    q: "Is this medical advice?",
    a: "No. Everything in the app is general exercise guidance. If you have a condition or an injury, talk to a professional first, and if something hurts beyond normal effort, stop.",
  },
];

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
const ICONS = {
  target: (<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" {...stroke} /><circle cx="12" cy="12" r="5" {...stroke} /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>),
  spark: (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" {...stroke} /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" {...stroke} /></svg>),
  lock: (<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5" {...stroke} /><path d="M8 11V8a4 4 0 0 1 8 0v3" {...stroke} /></svg>),
  check: (<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" {...stroke} strokeWidth={3} /></svg>),
};

function AppStoreBadge({ dark = true, size = "lg" }) {
  return (
    <a
      className={`badge ${dark ? "badge-dark" : "badge-light"} badge-${size}`}
      href={APP_STORE_URL}
      aria-label="Download EasyRep AI on the App Store"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
        />
      </svg>
      <span>
        <small>Download on the</small>
        <b>App Store</b>
      </span>
    </a>
  );
}

const css = `
html, body { background:#F5F7FA; margin:0; }
.er { --ink:#0F172A; --ink2:#334155; --muted:#64748B; --blue:#2563EB; --blue-deep:#1D4ED8;
  --soft:#EAF1FE; --line:#E6EAF0; --paper:#F5F7FA;
  background:var(--paper); color:var(--ink); overflow-x:hidden;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,sans-serif;
  -webkit-font-smoothing:antialiased; }
.er * { box-sizing:border-box; }
.er a { text-decoration:none; color:inherit; }
.er .wrap { max-width:1160px; margin:0 auto; padding:0 24px; }

/* nav */
.er .nav { position:sticky; top:12px; z-index:20; display:flex; align-items:center; justify-content:space-between;
  margin:12px auto 0; max-width:1160px; padding:10px 12px 10px 18px; border-radius:999px;
  background:rgba(255,255,255,.78); backdrop-filter:saturate(1.6) blur(18px); -webkit-backdrop-filter:saturate(1.6) blur(18px);
  border:1px solid rgba(15,23,42,.06); box-shadow:0 8px 30px rgba(15,23,42,.06); }
.er .brand { display:flex; align-items:center; gap:10px; font-weight:700; font-size:17px; letter-spacing:-.01em; }
.er .brand img { width:30px; height:30px; border-radius:8px; }
.er .links { display:flex; gap:26px; font-size:14.5px; color:var(--ink2); font-weight:500; }
.er .links a:hover { color:var(--blue); }
.er .navcta { background:var(--ink); color:#fff; border-radius:999px; padding:10px 18px; font-size:14px; font-weight:600; }

/* hero */
.er .er-hero { display:grid; grid-template-columns:1.05fr 1fr; gap:48px; align-items:center; padding:72px 0 40px; position:relative; }
.er .er-hero:before { content:""; position:absolute; right:-160px; top:-60px; width:640px; height:640px; border-radius:50%;
  background:radial-gradient(circle, rgba(37,99,235,.20), rgba(37,99,235,0) 65%); pointer-events:none; }
.er .pill { display:inline-flex; align-items:center; gap:8px; background:#fff; border:1px solid var(--line); border-radius:999px;
  padding:7px 14px 7px 8px; font-size:13.5px; font-weight:600; color:var(--ink2); margin-bottom:22px; }
.er .pill i { width:22px; height:22px; border-radius:50%; background:var(--soft); display:inline-flex; align-items:center; justify-content:center;
  font-style:normal; color:var(--blue); font-size:12px; }
.er h1 { font-size:clamp(40px,5vw,66px); font-weight:800; letter-spacing:-.045em; line-height:.98; margin:0 0 22px; }
.er h1 em { font-style:normal; color:var(--blue); display:block; white-space:nowrap; }
.er .lead { font-size:19px; color:var(--muted); line-height:1.6; margin:0 0 30px; max-width:42ch; }
.er .cta-row { display:flex; align-items:center; gap:18px; flex-wrap:wrap; }
.er .note { font-size:14px; color:var(--muted); }
.er .visual { position:relative; min-height:560px; }
.er .visual .photo { position:absolute; right:0; top:0; width:78%; height:540px; border-radius:36px; overflow:hidden;
  box-shadow:0 30px 80px rgba(30,64,175,.22); }
.er .visual .photo img { width:100%; height:100%; object-fit:cover; object-position:50% 30%; }
.er .visual .photo:after { content:""; position:absolute; inset:0; background:linear-gradient(180deg, rgba(37,99,235,0) 55%, rgba(29,78,216,.55)); }
.er .visual .phone { position:absolute; left:-4%; bottom:-28px; width:38%; max-width:220px; filter:drop-shadow(0 30px 50px rgba(15,23,42,.30)); }
.er .visual .tag { position:absolute; right:22px; bottom:42px; background:rgba(255,255,255,.92); backdrop-filter:blur(10px);
  border-radius:18px; padding:12px 16px; font-size:13.5px; font-weight:600; display:flex; gap:10px; align-items:center;
  box-shadow:0 12px 30px rgba(15,23,42,.18); }
.er .visual .tag b { color:var(--blue); }

/* badge */
.er .badge { display:inline-flex; align-items:center; gap:10px; border-radius:14px; padding:10px 20px 10px 16px; transition:transform .15s ease; }
.er .badge:hover { transform:translateY(-1px); }
.er .badge svg { width:26px; height:26px; }
.er .badge span { display:flex; flex-direction:column; line-height:1.05; }
.er .badge small { font-size:11px; font-weight:500; letter-spacing:.01em; }
.er .badge b { font-size:21px; font-weight:600; letter-spacing:-.01em; }
.er .badge-dark { background:#000; color:#fff; }
.er .badge-light { background:#fff; color:#000; }
.er .badge-sm { padding:8px 16px 8px 12px; }
.er .badge-sm svg { width:20px; height:20px; }
.er .badge-sm b { font-size:17px; }

/* facts strip */
.er .facts { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin:56px 0 0; }
.er .fact { background:#fff; border:1px solid var(--line); border-radius:22px; padding:22px 22px; display:flex; gap:14px; align-items:flex-start; }
.er .fact .ic { flex:none; width:40px; height:40px; border-radius:12px; background:var(--soft); color:var(--blue);
  display:flex; align-items:center; justify-content:center; }
.er .fact .ic svg { width:20px; height:20px; }
.er .fact b { display:block; font-size:16px; margin-bottom:3px; }
.er .fact span { font-size:14.5px; color:var(--muted); line-height:1.5; }

/* sections */
.er .eyebrow { color:var(--blue); font-weight:700; font-size:12.5px; letter-spacing:.14em; margin-bottom:14px; }
.er h2 { font-size:clamp(32px,4vw,50px); font-weight:800; letter-spacing:-.04em; line-height:1.04; margin:0 0 16px; }
.er .sec-head { text-align:center; max-width:720px; margin:130px auto 56px; }
.er .sec-head p { font-size:18px; color:var(--muted); line-height:1.6; margin:0; }

.er .feat { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; margin-top:90px; }
.er .feat .stage { position:relative; border-radius:36px; overflow:hidden; height:560px; background:#DCE6F7; }
.er .feat .stage .photo { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.er .feat .stage:after { content:""; position:absolute; inset:0;
  background:linear-gradient(180deg, rgba(15,23,42,0) 45%, rgba(15,23,42,.35)); }
/* The real screen, overlapping the photo's lower corner. */
.er .feat .stage .phone { position:absolute; z-index:1; right:28px; bottom:-90px; width:230px; height:auto;
  filter:drop-shadow(0 24px 40px rgba(15,23,42,.35)); }
.er .feat .stage .phone.left { right:auto; left:28px; }
.er .feat h3 { font-size:clamp(28px,3.2vw,40px); font-weight:800; letter-spacing:-.035em; line-height:1.08; margin:0 0 16px; }
.er .feat p { font-size:17.5px; color:var(--muted); line-height:1.65; margin:0 0 22px; }
.er .chips { display:flex; flex-wrap:wrap; gap:8px; }
.er .chips span { background:#fff; border:1px solid var(--line); border-radius:999px; padding:8px 14px; font-size:14px; font-weight:600; color:var(--ink2); }
.er .feat.flip .stage { order:2; }

/* steps */
.er .steps { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
.er .step { background:#fff; border:1px solid var(--line); border-radius:26px; padding:30px 28px; }
.er .step .n { width:40px; height:40px; border-radius:50%; background:var(--blue); color:#fff; font-weight:800;
  display:flex; align-items:center; justify-content:center; margin-bottom:20px; }
.er .step b { display:block; font-size:19px; letter-spacing:-.01em; margin-bottom:8px; }
.er .step p { font-size:15.5px; color:var(--muted); line-height:1.6; margin:0; }

/* mission */
.er .mission { margin-top:130px; display:grid; grid-template-columns:.9fr 1.1fr; gap:0; border-radius:36px; overflow:hidden;
  background:var(--ink); color:#fff; }
.er .mission .img { min-height:440px; background:url(/easyrep/v2/athlete.webp) center 25%/cover; }
.er .mission .txt { padding:56px 52px; display:flex; flex-direction:column; justify-content:center; }
.er .mission .eyebrow { color:#93C5FD; }
.er .mission h2 { color:#fff; }
.er .mission p { color:rgba(255,255,255,.75); font-size:17.5px; line-height:1.7; margin:0 0 14px; }

/* faq */
.er .faq { max-width:800px; margin:0 auto; }
.er .faq details { background:#fff; border:1px solid var(--line); border-radius:20px; margin-bottom:10px; }
.er .faq summary { cursor:pointer; list-style:none; display:flex; align-items:center; justify-content:space-between; gap:14px;
  padding:20px 24px; font-size:16.5px; font-weight:600; }
.er .faq summary::-webkit-details-marker { display:none; }
.er .faq summary::after { content:"+"; font-weight:500; font-size:24px; line-height:1; color:var(--blue); }
.er .faq details[open] summary::after { content:"\\2212"; }
.er .faq .a { padding:0 24px 22px; font-size:15.5px; color:var(--muted); line-height:1.7; }

/* final cta */
.er .final { margin-top:130px; border-radius:40px; overflow:hidden; position:relative;
  background:linear-gradient(135deg,var(--blue),var(--blue-deep)); color:#fff; display:grid; grid-template-columns:1.2fr .8fr; align-items:end; }
.er .final .txt { padding:64px 56px; }
.er .final h2 { color:#fff; margin-bottom:14px; }
.er .final p { color:rgba(255,255,255,.82); font-size:18px; line-height:1.6; margin:0 0 30px; max-width:40ch; }
.er .final .ph { display:flex; justify-content:center; padding-top:48px; height:100%; overflow:hidden; }
.er .final .ph img { width:280px; align-self:flex-start; filter:drop-shadow(0 30px 50px rgba(0,0,0,.3)); }

.er .foot { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px;
  padding:44px 4px 56px; color:var(--muted); font-size:14px; }
.er .foot a { color:var(--ink2); font-weight:500; margin-left:20px; }

@media (max-width:900px){
  .er .links { display:none; }
  .er .er-hero { grid-template-columns:1fr; padding-top:44px; gap:32px; }
  .er .visual { min-height:470px; }
  .er .visual .photo { width:84%; height:440px; }
  .er .visual .phone { width:42%; }
  .er .facts, .er .steps { grid-template-columns:1fr; }
  .er .feat { grid-template-columns:1fr; gap:28px; margin-top:64px; }
  .er .feat.flip .stage { order:0; }
  .er .feat .stage { height:440px; }
  .er .feat .stage .phone { width:180px; right:18px; bottom:-70px; }
  .er .feat .stage .phone.left { right:auto; left:18px; }
  .er .sec-head, .er .mission, .er .final { margin-top:88px; }
  .er .mission, .er .final { grid-template-columns:1fr; }
  .er .mission .img { min-height:300px; }
  .er .mission .txt, .er .final .txt { padding:36px 28px; }
  .er .final .ph { height:340px; }
}
@media (prefers-reduced-motion:reduce){ .er .badge { transition:none; } }
`;

export default function EasyRepLanding() {
  return (
    <div className="er">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="wrap">
        <nav className="nav">
          <a className="brand" href="/">
            <img src="/easyrep/icon.svg" alt="" />
            EasyRep AI
          </a>
          <div className="links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
          </div>
          <a className="navcta" href={APP_STORE_URL}>Download</a>
        </nav>

        <section className="er-hero">
          <div>
            <div className="pill"><i>{ICONS.check}</i>Now on the App Store</div>
            <h1>
              Your personal <em>AI fitness coach.</em>
            </h1>
            <p className="lead">
              Scan any gym machine, check your form with live body tracking, log meals from a photo
              and follow a plan built for beginners.
            </p>
            <div className="cta-row">
              <AppStoreBadge />
              <span className="note">Free to download · iPhone</span>
            </div>
          </div>
          <div className="visual">
            <div className="photo">
              <img src="/easyrep/v2/athlete.webp" alt="A man doing a one-arm dumbbell row in a gym" />
            </div>
            <img className="phone" src="/easyrep/v2/phone-today.webp" alt="EasyRep's Today screen with the day's workout and calories" />
            <div className="tag">Today's workout · <b>Full body 3</b></div>
          </div>
        </section>

        <section className="facts">
          <div className="fact"><div className="ic">{ICONS.target}</div><div><b>Built for beginners</b><span>Machines first, short sessions, nothing assumed.</span></div></div>
          <div className="fact"><div className="ic">{ICONS.spark}</div><div><b>Six AI tools in one app</b><span>Machines, form, meals, body, plan and a coach.</span></div></div>
          <div className="fact"><div className="ic">{ICONS.lock}</div><div><b>Private by design</b><span>Form videos stay on your phone. No ads, no tracking SDKs.</span></div></div>
        </section>

        <div className="sec-head" id="features">
          <div className="eyebrow">FEATURES</div>
          <h2>Everything you need to walk in with a plan.</h2>
          <p>One app for the moments beginners get stuck: the machine you don't know, the set you're unsure of, the meal you can't count.</p>
        </div>

        {FEATURES.map((f) => (
          <section key={f.title} className={`feat${f.flip ? " flip" : ""}`}>
            <div className="stage">
              <img className="photo" src={f.photo} alt="" loading="lazy" />
              <img className={`phone ${f.phoneSide}`} src={f.img} alt="" loading="lazy" />
            </div>
            <div>
              <div className="eyebrow">{f.kicker}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
              <div className="chips">{f.chips.map((c) => <span key={c}>{c}</span>)}</div>
            </div>
          </section>
        ))}

        <div className="sec-head" id="how">
          <div className="eyebrow">HOW IT WORKS</div>
          <h2>From first download to first workout.</h2>
        </div>
        <section className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <div className="n">{s.n}</div>
              <b>{s.title}</b>
              <p>{s.body}</p>
            </div>
          ))}
        </section>

        <section className="mission">
          <div className="img" role="img" aria-label="An athlete training with a dumbbell" />
          <div className="txt">
            <div className="eyebrow">WHY WE BUILD EASYREP</div>
            <h2>The hardest visit is the first one.</h2>
            <p>
              Most people who want to train never feel at home in a gym. Not because it's hard, but
              because nobody explains it: which machine, how to set it up, whether your form is right.
            </p>
            <p>
              EasyRep is the knowledgeable friend in your pocket. It answers the questions you'd never
              ask out loud, and it's kind about it.
            </p>
          </div>
        </section>

        <div className="sec-head" id="faq">
          <div className="eyebrow">FAQ</div>
          <h2>Questions, answered.</h2>
        </div>
        <section className="faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <div className="a">{f.a}</div>
            </details>
          ))}
        </section>

        <section className="final">
          <div className="txt">
            <h2>Start training with confidence.</h2>
            <p>Download EasyRep for free and walk into your next session with a plan.</p>
            <AppStoreBadge dark={false} />
          </div>
          <div className="ph">
            <img src="/easyrep/v2/phone-form.webp" alt="" loading="lazy" />
          </div>
        </section>

        <footer className="foot">
          <div>© {new Date().getFullYear()} EasyRep AI</div>
          <div>
            <a href={APP_STORE_URL}>App Store</a>
            <a href="/easyrep/privacy">Privacy</a>
            <a href="/easyrep/terms">Terms</a>
            <a href="mailto:abdelhadi@easyrepai.app">Contact</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
