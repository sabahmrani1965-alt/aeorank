// EasyRep AI's product site, served at easyrepai.app (middleware rewrites
// that domain's root here). Image-led: a wide hero render, then one scene
// per feature, using the same 3D renders as the App Store screenshots so
// the site, the listing and the app read as one product. Honest by
// design: no download counts, no store badges, no ratings until the app
// is actually live.
export const metadata = {
  title: "EasyRep AI - Gym & Calorie AI Coach",
  description:
    "Scan any gym machine to learn it. Snap your plate for calories and protein. Get kind feedback on your form, and a plan that starts easy.",
};

const FEATURES = [
  {
    img: "/easyrep/scan.jpg",
    kicker: "MACHINE SCANNER",
    title: "What is this machine?",
    body: "Point your camera at anything on the gym floor and get its name, what it works, how to set it up, and how to do the movement. No guessing, no asking anyone. Every machine you learn goes into your own list.",
  },
  {
    img: "/easyrep/food.jpg",
    kicker: "CALORIE TRACKING",
    title: "Snap your plate",
    body: "Photograph your meal for an approximate calorie and protein count. Approximate is the honest word, and the app says so on every result rather than pretending to be a food scale.",
    flip: true,
  },
  {
    img: "/easyrep/body.jpg",
    kicker: "AI BODY SCAN",
    title: "Know where you start",
    body: "One full-length photo gives you a body fat range, what your build already has going for it, and a single thing to focus on. A range, never a fake-precise number, and the result stays on your phone.",
  },
  {
    img: "/easyrep/form.jpg",
    kicker: "FORM CHECK",
    title: "Feedback that stays kind",
    body: "Record a short clip of your lift. The feedback always opens with what you did well, then one or two fixes and why they matter. The video never leaves your phone: six frames are taken on your device and only those are analyzed.",
    flip: true,
  },
  {
    img: "/easyrep/plan.jpg",
    kicker: "YOUR PLAN",
    title: "Built from what scares you",
    body: "The setup asks what feels hardest about the gym, then builds two to five short sessions a week around it. Machines first, so the equipment guides the movement. A machine is busy? One tap swaps it for an equivalent.",
  },
  {
    img: "/easyrep/coach.jpg",
    kicker: "AI COACH",
    title: "Ask what you'd never ask out loud",
    body: "How long can I stay on a machine? Is this soreness normal? What are the unwritten rules? Ask the things you would never say to a stranger and get plain, judgment-free answers.",
    flip: true,
  },
];

const FAQ = [
  {
    q: "What does EasyRep AI actually do?",
    a: "It identifies gym machines from a photo and explains how to use them, estimates the calories and protein in a meal from a photo, gives a rough body composition read, reviews your exercise form from a short video, answers gym questions in plain language, and builds a beginner plan around what worries you.",
  },
  {
    q: "Is it really for complete beginners?",
    a: "That is the whole point. The setup asks what feels scariest about the gym, and the plan starts on machines because they guide the movement for you. Nothing in the app assumes you know anything.",
  },
  {
    q: "Do my form check videos get uploaded?",
    a: "No. The video never leaves your phone. The app takes six still frames on your device and sends only those for analysis. The frames are processed and not stored on our servers.",
  },
  {
    q: "How accurate are the scans?",
    a: "Machine recognition is reliable for common gym equipment. Meal and body estimates are approximate by nature, and the app says so on every result instead of inventing precision it does not have.",
  },
  {
    q: "Is it free?",
    a: "The plan, streak, week view and machine list are free. You also get a few free scans to try each tool. EasyRep Pro makes all of them unlimited, monthly or yearly, with a 3 day free trial.",
  },
  {
    q: "Is this medical advice?",
    a: "No. Everything in the app is general exercise guidance, not medical advice. If you have a condition or an injury, talk to a professional first, and if something hurts beyond normal effort, stop.",
  },
  {
    q: "What data do you collect?",
    a: "As little as possible. Signing in is optional, there are no ads and no tracking SDKs, and we never sell data. The full detail is in the privacy policy.",
  },
  {
    q: "When can I download it?",
    a: "It is finished and with Apple for review. This page gets the real App Store link the day it is approved, and not a fake one before that.",
  },
];

const css = `
html, body { background:#fff; margin:0; }
.er { background:#fff; color:#0B0B0F; overflow-x:hidden;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
.er * { box-sizing:border-box; }
.er a { text-decoration:none; color:inherit; }
.er .wrap { max-width:1120px; margin:0 auto; padding:0 24px; }
.er .nav { display:flex; align-items:center; justify-content:space-between; padding:20px 26px;
  background:rgba(244,245,246,.9); border-radius:999px; margin:16px auto 0; max-width:1120px; }
.er .logo { font-weight:800; font-size:17px; letter-spacing:-.01em; }
.er .links { display:flex; gap:24px; font-size:14px; color:#3f4249; font-weight:500; }
.er .soon { background:#0B0B0F; color:#fff; border-radius:999px; padding:9px 18px; font-size:13px;
  font-weight:700; white-space:nowrap; }
.er .banner { text-align:left; padding:0; position:relative; margin-top:22px; border-radius:32px; overflow:hidden; min-height:560px;
  display:flex; align-items:center; }
.er .banner img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.er .banner .scrim { position:absolute; inset:0;
  background:linear-gradient(100deg,rgba(255,255,255,.985) 0%,rgba(255,255,255,.96) 42%,rgba(255,255,255,.55) 60%,rgba(255,255,255,0) 86%); }
.er .banner .inner { text-align:left; position:relative; padding:56px 48px; max-width:640px; }
.er .kick { display:inline-flex; align-items:center; gap:8px; color:#2563EB; font-weight:800;
  font-size:12.5px; letter-spacing:.12em; margin-bottom:16px; }
.er h1 { font-size:clamp(40px,5.4vw,64px); font-weight:800; letter-spacing:-.035em; line-height:1.02;
  margin:0 0 18px; }
.er .lead { font-size:19px; color:#4b5058; line-height:1.6; margin:0 0 28px; max-width:44ch; }
.er a.cta { display:inline-block; background:#0B0B0F; color:#fff; border-radius:999px; padding:16px 30px;
  font-size:16px; font-weight:700; }
.er .fine { font-size:13.5px; color:#8a8f98; margin:14px 0 0; line-height:1.5; max-width:46ch; }
.er .feat { display:grid; grid-template-columns:1fr 1fr; gap:44px; align-items:center; margin-top:104px; }
.er .feat .shot { border-radius:26px; overflow:hidden; aspect-ratio:4/5; background:#F2F3F5; }
.er .feat .shot img { width:100%; height:100%; object-fit:cover; display:block; }
.er .feat h2 { font-size:clamp(28px,3.4vw,40px); font-weight:800; letter-spacing:-.03em;
  line-height:1.1; margin:0 0 14px; }
.er .feat p { font-size:17px; color:#4b5058; line-height:1.65; margin:0; }
.er .feat.flip .shot { order:2; }
.er .band { background:#F4F5F6; border-radius:28px; padding:40px; margin-top:104px; }
.er .band h2 { font-size:26px; font-weight:800; letter-spacing:-.02em; margin:0 0 10px; }
.er .band p { font-size:16px; color:#4b5058; line-height:1.65; margin:0; }
.er h2.sec { font-size:clamp(28px,3.4vw,40px); font-weight:800; letter-spacing:-.03em;
  text-align:center; margin:104px 0 32px; }
.er .faq { max-width:780px; margin:0 auto; }
.er .faq details { background:#F4F5F6; border-radius:18px; margin-bottom:10px; }
.er .faq summary { cursor:pointer; list-style:none; display:flex; align-items:center; gap:14px;
  padding:19px 22px; font-size:16px; font-weight:600; }
.er .faq summary::-webkit-details-marker { display:none; }
.er .faq summary::before { content:"+"; font-weight:700; font-size:19px; line-height:1; color:#2563EB; }
.er .faq details[open] summary::before { content:"\\2212"; }
.er .faq .a { padding:0 22px 20px 50px; font-size:15.5px; color:#4b5058; line-height:1.7; }
.er .final { position:relative; border-radius:32px; overflow:hidden; margin-top:104px; min-height:420px;
  display:flex; align-items:center; justify-content:center; text-align:center; }
.er .final img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.er .final .scrim { position:absolute; inset:0; background:rgba(11,11,15,.62); }
.er .final .inner { position:relative; padding:64px 28px; }
.er .final h2 { color:#fff; font-size:clamp(28px,3.6vw,42px); font-weight:800; letter-spacing:-.03em;
  margin:0 0 14px; }
.er .final p { color:rgba(255,255,255,.82); font-size:17px; line-height:1.6; margin:0 auto 26px;
  max-width:52ch; }
.er .final a { background:#fff; color:#0B0B0F; border-radius:999px; padding:16px 32px; font-weight:700;
  font-size:16px; display:inline-block; }
.er .foot { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px;
  padding:40px 4px 52px; color:#8a8f98; font-size:14px; }
.er .foot a { color:#4b5058; font-weight:500; margin-left:18px; }
@media (max-width:860px){
.er .links { display:none; }
.er .banner { min-height:auto; }
.er .banner .inner { padding:36px 24px 44px; }
.er .banner .scrim { background:linear-gradient(180deg,rgba(255,255,255,.96) 0%,rgba(255,255,255,.92) 55%,rgba(255,255,255,.4) 100%); }
.er .feat { grid-template-columns:1fr; gap:22px; margin-top:64px; }
.er .feat.flip .shot { order:0; }
.er .band, .er h2.sec, .er .final { margin-top:64px; }
.er .band { padding:28px; }
}
`;

export default function EasyRepLanding() {
  return (
    <div className="er">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="wrap">
        <nav className="nav">
          <div className="logo">EasyRep AI</div>
          <div className="links">
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
            <a href="mailto:abdelhadi@easyrepai.app">Contact</a>
          </div>
          <div className="soon">Coming soon</div>
        </nav>

        <section className="banner">
          <img src="/easyrep/hero.jpg" alt="" />
          <div className="scrim" />
          <div className="inner">
            <div className="kick">AI GYM COACH FOR BEGINNERS</div>
            <h1>The gym, without the guesswork.</h1>
            <p className="lead">
              Scan any machine to learn it. Snap your plate for calories and protein. Get kind
              feedback on your form, and follow a plan that starts easy.
            </p>
            <a className="cta" href="#features">Coming soon to the App Store</a>
            <p className="fine">
              Finished and with Apple for review. The real download link appears here the day it
              is approved, and not before.
            </p>
          </div>
        </section>

        <div id="features" />
        {FEATURES.map((f) => (
          <section key={f.title} className={`feat${f.flip ? " flip" : ""}`}>
            <div className="shot">
              <img src={f.img} alt="" loading="lazy" />
            </div>
            <div>
              <div className="kick">{f.kicker}</div>
              <h2>{f.title}</h2>
              <p>{f.body}</p>
            </div>
          </section>
        ))}

        <section className="band">
          <h2>Built to collect as little as possible</h2>
          <p>
            No ads, no tracking SDKs, nothing sold to anyone. Form check videos never leave your
            phone. Signing in is optional. Everything in the app is general exercise guidance, not
            medical advice. The details are in the{" "}
            <a href="/easyrep/privacy" style={{ color: "#2563EB", fontWeight: 600 }}>privacy policy</a>{" "}
            and <a href="/easyrep/terms" style={{ color: "#2563EB", fontWeight: 600 }}>terms of use</a>.
          </p>
        </section>

        <h2 className="sec" id="faq">Questions</h2>
        <section className="faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <div className="a">{f.a}</div>
            </details>
          ))}
        </section>

        <section className="final">
          <img src="/easyrep/plan.jpg" alt="" loading="lazy" />
          <div className="scrim" />
          <div className="inner">
            <h2>The hardest visit is the first one.</h2>
            <p>
              EasyRep AI exists so you never walk in without a plan again. Launching on the App
              Store soon.
            </p>
            <a href="mailto:abdelhadi@easyrepai.app?subject=Tell%20me%20when%20EasyRep%20AI%20launches">
              Email me when it launches
            </a>
          </div>
        </section>

        <footer className="foot">
          <div>EasyRep AI</div>
          <div>
            <a href="/easyrep/privacy">Privacy</a>
            <a href="/easyrep/terms">Terms</a>
            <a href="mailto:abdelhadi@easyrepai.app">Contact</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
