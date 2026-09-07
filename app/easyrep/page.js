// EasyRep AI's product site, served at easyrepai.app (middleware rewrites
// that domain's root here). Structure modeled on trackai.app: pill nav,
// two-column hero with a phone mockup, numbered how-it-works, gray
// rounded cards, FAQ accordion. EasyRep's own language throughout: white
// on light gray, near-black type, one green accent, tinted icon squares.
// Honest by design: no download counts, no store badges, no ratings
// until the app is actually live; the phone shows a real scan result.
export const metadata = {
  title: "EasyRep AI - AI Gym Coach for Beginners",
  description:
    "The gym app for people who feel out of place at the gym. Scan any machine to learn it, get kind form feedback, follow a plan that starts easy.",
};

const FAQ = [
  {
    q: "What does EasyRep AI actually do?",
    a: "Four things: it identifies gym machines from a photo and explains how to use them, it reviews your exercise form from a short video, it answers gym questions in plain language, and it builds a short beginner plan around what worries you about the gym. There is also an optional meal scan for approximate calories.",
  },
  {
    q: "Is it really for complete beginners?",
    a: "Yes, that is the whole point. The onboarding asks what feels scariest about the gym, and the plan starts on machines because they guide the movement for you. Nothing in the app assumes you know anything.",
  },
  {
    q: "Do my form check videos get uploaded?",
    a: "No. The video never leaves your phone. The app extracts six still frames on your device and sends only those for analysis. The frames are processed and not stored on our servers.",
  },
  {
    q: "How accurate are the machine and meal scans?",
    a: "Machine recognition is very reliable for common gym equipment. Meal estimates are approximate by nature, and the app says so on every result instead of pretending to be a food scale.",
  },
  {
    q: "Is it free?",
    a: "The plan, streak, and machine list are free forever. Unlimited scans, form checks, and coach chat are part of a Pro subscription, monthly or yearly, priced in the App Store when the app launches.",
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
    a: "It is finished and heading to App Store review. This page will get the real App Store link the day it is approved, and not a fake one before that.",
  },
];

const css = `
html, body { background:#fff; margin:0; }
.er { background:#fff; color:#0B0B0F; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; overflow-x:hidden; min-height:100vh; }
.er * { box-sizing:border-box; }
.er a { text-decoration:none; color:inherit; }
.er-wrap { max-width:1120px; margin:0 auto; padding:0 20px; }
.er-nav { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; background:#F4F5F6; border-radius:999px; margin:16px auto 0; max-width:1120px; }
.er-logo { font-weight:800; font-size:17px; letter-spacing:-0.01em; }
.er-links { display:flex; gap:22px; font-size:14px; color:#3f4249; font-weight:500; }
.er-soon { background:#0B0B0F; color:#fff; border-radius:999px; padding:9px 18px; font-size:13px; font-weight:700; white-space:nowrap; }

.er-hero { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:24px; align-items:stretch; }
.er-hero-card { background:#F4F5F6; border-radius:28px; padding:44px 40px; display:flex; flex-direction:column; justify-content:center; }
.er-kicker { display:inline-flex; align-items:center; gap:8px; color:#16A34A; font-weight:700; font-size:13px; letter-spacing:.1em; margin-bottom:16px; }
.er-h1 { font-size:clamp(34px,4.5vw,52px); font-weight:800; letter-spacing:-0.03em; line-height:1.04; margin:0 0 16px; }
.er-sub { font-size:17px; color:#5c6068; line-height:1.6; margin:0 0 24px; max-width:44ch; }
.er a.er-cta { display:inline-block; background:#0B0B0F; color:#fff; border-radius:999px; padding:15px 28px; font-size:15px; font-weight:700; width:fit-content; }
.er-fine { font-size:13px; color:#8a8f98; margin-top:14px; line-height:1.5; max-width:46ch; }

.er-phone-stage { background:#F4F5F6; border-radius:28px; display:flex; align-items:center; justify-content:center; padding:36px 20px; }
.er-phone { width:290px; background:#0c0d0c; border-radius:44px; padding:11px; box-shadow:0 34px 60px -28px rgba(11,11,15,.4); }
.er-screen { background:#F7F7F8; border-radius:34px; overflow:hidden; padding:40px 15px 12px; position:relative; }
.er-island { position:absolute; top:10px; left:50%; transform:translateX(-50%); width:78px; height:22px; background:#0c0d0c; border-radius:14px; }
.er-sh1 { font-size:20px; font-weight:800; letter-spacing:-0.02em; }
.er-ssub { font-size:11px; color:#8a8f98; margin:2px 0 10px; }
.er-scard { background:#fff; border-radius:18px; box-shadow:0 6px 18px rgba(11,11,15,.07); padding:13px; }
.er-sname { font-size:16px; font-weight:800; }
.er-sworks { font-size:11px; color:#16A34A; font-weight:700; margin:2px 0 8px; }
.er-slabel { font-size:9px; font-weight:700; color:#16A34A; letter-spacing:.07em; margin:8px 0 4px; }
.er-sstep { font-size:11px; line-height:1.5; color:#0B0B0F; }
.er-ssoft { background:#E7F8EE; border-radius:12px; padding:9px; font-size:10.5px; line-height:1.5; margin-top:10px; }
.er-sbtn { background:#0B0B0F; color:#fff; border-radius:999px; padding:11px; text-align:center; font-weight:700; font-size:12px; margin-top:12px; }
.er-stabs { display:flex; justify-content:space-around; padding:10px 0 2px; font-size:8.5px; color:#9aa0a8; font-weight:600; }
.er-stabs b { color:#0B0B0F; }

.er-h2 { font-size:clamp(26px,3.4vw,38px); font-weight:800; letter-spacing:-0.025em; text-align:center; line-height:1.15; margin:88px 0 12px; }
.er-h2sub { text-align:center; color:#8a8f98; font-size:16px; margin:0 auto 40px; max-width:62ch; line-height:1.6; }

.er-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
.er-step { background:#F4F5F6; border-radius:24px; padding:28px; }
.er-stepnum { width:36px; height:36px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; margin-bottom:16px; box-shadow:0 4px 12px rgba(11,11,15,.06); }
.er-step h3 { font-size:19px; font-weight:800; margin:0 0 8px; letter-spacing:-0.01em; }
.er-step p { font-size:14px; color:#5c6068; line-height:1.65; margin:0; }

.er-why { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
.er-whycard { background:#F4F5F6; border-radius:24px; padding:32px 28px; text-align:center; }
.er-chip { width:64px; height:64px; border-radius:20px; display:flex; align-items:center; justify-content:center; margin:0 auto 18px; font-size:28px; }
.er-whycard h3 { font-size:19px; font-weight:800; margin:0 0 8px; }
.er-whycard p { font-size:14px; color:#5c6068; line-height:1.65; margin:0; }

.er-benefits { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
.er-benefit { background:#F4F5F6; border-radius:24px; padding:28px 30px; }
.er-benefit h3 { font-size:17px; font-weight:800; margin:0 0 8px; }
.er-benefit h3 span { color:#16A34A; margin-right:10px; }
.er-benefit p { font-size:14px; color:#5c6068; line-height:1.65; margin:0; }

.er-faq { max-width:760px; margin:0 auto; }
.er-faq details { background:#F4F5F6; border-radius:18px; margin-bottom:10px; }
.er-faq summary { cursor:pointer; list-style:none; display:flex; align-items:center; gap:14px; padding:18px 22px; font-size:15px; font-weight:600; }
.er-faq summary::-webkit-details-marker { display:none; }
.er-faq summary::before { content:"+"; font-weight:700; color:#0B0B0F; font-size:18px; line-height:1; }
.er-faq details[open] summary::before { content:"\\2212"; }
.er-faq .er-a { padding:0 22px 20px 54px; font-size:14px; color:#5c6068; line-height:1.7; }

.er-final { background:#0B0B0F; color:#fff; border-radius:28px; text-align:center; padding:64px 28px; margin-top:88px; }
.er-final h2 { font-size:clamp(26px,3.4vw,38px); font-weight:800; letter-spacing:-0.025em; margin:0 0 12px; }
.er-final p { color:#b8bcc4; font-size:16px; line-height:1.6; margin:0 auto 28px; max-width:52ch; }
.er-final a { background:#16A34A; color:#fff; border-radius:999px; padding:15px 30px; font-weight:700; font-size:15px; display:inline-block; }

.er-footer { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; padding:36px 4px 44px; color:#8a8f98; font-size:14px; }
.er-footer a { color:#5c6068; font-weight:500; margin-left:18px; }

@media (max-width:860px){
  .er-links { display:none; }
  .er-hero { grid-template-columns:1fr; }
  .er-steps, .er-why { grid-template-columns:1fr; }
  .er-benefits { grid-template-columns:1fr; }
  .er-hero-card { padding:32px 24px; }
  .er-phone-stage { padding:28px 10px; }
  .er-phone { width:min(290px, 100%); }
}
`;

export default function EasyRepLanding() {
  return (
    <div className="er">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="er-wrap">
        <nav className="er-nav">
          <div className="er-logo">EasyRep AI</div>
          <div className="er-links">
            <a href="#how">How it works</a>
            <a href="#why">Why us</a>
            <a href="#benefits">Benefits</a>
            <a href="#faq">FAQ</a>
            <a href="mailto:sabah.mrani1965@gmail.com">Contact</a>
          </div>
          <div className="er-soon">Coming soon</div>
        </nav>

        {/* Hero */}
        <section className="er-hero">
          <div className="er-hero-card">
            <div className="er-kicker">AI GYM COACH FOR BEGINNERS</div>
            <h1 className="er-h1">
              The gym, without the guesswork.
            </h1>
            <p className="er-sub">
              EasyRep AI is the app for people who want to go to the gym but
              feel like it belongs to other people. Scan any machine to learn
              it, get kind feedback on your form, and follow a plan that
              starts easy.
            </p>
            <a className="er-cta" href="#faq">Coming soon to the App Store</a>
            <p className="er-fine">
              Finished and heading to App Store review. No fake download
              buttons here; the real one appears the day it is approved.
            </p>
          </div>

          <div className="er-phone-stage">
            <div className="er-phone">
              <div className="er-screen">
                <div className="er-island" />
                <div className="er-sh1">Scan</div>
                <div className="er-ssub">Point your camera at any machine.</div>
                <div className="er-scard">
                  <div className="er-sname">Leg Press</div>
                  <div className="er-sworks">Works: front of thighs, glutes, back of thighs</div>
                  <div className="er-slabel">SET IT UP</div>
                  <div className="er-sstep">1. Sit with your back firmly against the padded support</div>
                  <div className="er-sstep">2. Feet on the platform about shoulder-width apart</div>
                  <div className="er-slabel">THE MOVEMENT</div>
                  <div className="er-sstep">1. Push the platform away without locking your knees</div>
                  <div className="er-sstep">2. Slowly bend your knees back in a controlled way</div>
                  <div className="er-ssoft">
                    One of the most beginner-friendly machines: it supports
                    your whole back and lets you build leg strength safely.
                  </div>
                </div>
                <div className="er-sbtn">Scan a machine</div>
                <div className="er-stabs">
                  <span>Today</span><b>Scan</b><span>Form</span><span>Ask</span><span>Plan</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <h2 className="er-h2" id="how">How EasyRep AI works</h2>
        <p className="er-h2sub">
          Three steps between "I have no idea what I'm doing" and a finished
          session.
        </p>
        <section className="er-steps">
          <div className="er-step">
            <div className="er-stepnum">1</div>
            <h3>Snap the machine</h3>
            <p>
              Point your camera at any machine and get its name, what it
              works, how to set it up, and how to do the movement, in
              seconds. No guessing, no asking anyone.
            </p>
          </div>
          <div className="er-step">
            <div className="er-stepnum">2</div>
            <h3>Follow your session</h3>
            <p>
              A short session built around what worries you about the gym:
              machines first, few sets, every exercise with a tap-to-open
              card. A machine is busy? One tap swaps it for an equivalent.
            </p>
          </div>
          <div className="er-step">
            <div className="er-stepnum">3</div>
            <h3>Check your form, kindly</h3>
            <p>
              Record a short clip of your lift. The feedback always starts
              with what you did well, then one or two fixes and why they
              matter. The video never leaves your phone.
            </p>
          </div>
        </section>

        {/* Why us */}
        <h2 className="er-h2" id="why">Why EasyRep AI feels different</h2>
        <p className="er-h2sub">
          Most gym apps assume you already belong there. This one is built
          for the walk through the door.
        </p>
        <section className="er-why">
          <div className="er-whycard">
            <div className="er-chip" style={{ background: "#E7F8EE" }}>🌿</div>
            <h3>Never judgmental</h3>
            <p>
              Every screen is written for someone nervous about looking
              wrong. Feedback is kind, plans start easy, and your streak
              counts showing up, never weights.
            </p>
          </div>
          <div className="er-whycard">
            <div className="er-chip" style={{ background: "#EAF2FF" }}>🔒</div>
            <h3>Private by design</h3>
            <p>
              Form videos stay on your phone, only a few still frames are
              analyzed and then gone. No ads, no tracking SDKs, sign-in
              optional, nothing sold to anyone.
            </p>
          </div>
          <div className="er-whycard">
            <div className="er-chip" style={{ background: "#FEF3E2" }}>⚡</div>
            <h3>Answers in seconds</h3>
            <p>
              A confused moment at the gym gets an answer right there: what
              a machine is, whether your form is safe, what the unwritten
              rules actually are.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <h2 className="er-h2" id="benefits">What you get</h2>
        <p className="er-h2sub">Your first weeks at the gym, handled.</p>
        <section className="er-benefits">
          <div className="er-benefit">
            <h3><span>1.</span>Machine scans that teach</h3>
            <p>
              Name, muscles worked, setup steps, the movement, and the
              mistakes to avoid, for any machine on the floor. Every machine
              you learn goes into your own list.
            </p>
          </div>
          <div className="er-benefit">
            <h3><span>2.</span>A plan built from your fears</h3>
            <p>
              The onboarding asks what feels scariest, then builds two to
              three short sessions a week around it. Machines only in week
              one if form worries you.
            </p>
          </div>
          <div className="er-benefit">
            <h3><span>3.</span>A coach for the awkward questions</h3>
            <p>
              How long can I stay on a machine? Is this soreness normal?
              Ask the things you would never ask out loud and get plain,
              judgment-free answers.
            </p>
          </div>
          <div className="er-benefit">
            <h3><span>4.</span>Meals, roughly counted</h3>
            <p>
              Snap your plate for an approximate calorie and protein
              estimate. Approximate is the honest word, and the app says so
              on every result.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <h2 className="er-h2" id="faq">FAQ</h2>
        <p className="er-h2sub">Straight answers, the same tone as the app.</p>
        <section className="er-faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <div className="er-a">{f.a}</div>
            </details>
          ))}
        </section>

        {/* Final CTA */}
        <section className="er-final">
          <h2>The hardest visit is the first one.</h2>
          <p>
            EasyRep AI exists so you never walk in without a plan again.
            Launching on the App Store soon.
          </p>
          <a href="mailto:sabah.mrani1965@gmail.com?subject=Tell%20me%20when%20EasyRep%20AI%20launches">
            Email me when it launches
          </a>
        </section>

        <footer className="er-footer">
          <div>EasyRep AI</div>
          <div>
            <a href="/easyrep/privacy">Privacy Policy</a>
            <a href="/easyrep/terms">Terms of Use</a>
            <a href="mailto:sabah.mrani1965@gmail.com">Contact</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
