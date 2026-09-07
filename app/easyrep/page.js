// EasyRep AI's product site, served at easyrepai.app (middleware rewrites
// that domain's root here). Same visual language as the app: white cards
// on a near-white ground, near-black type, one green accent, icon chips.
// Honest by design: the app is not on the App Store yet, so the CTA says
// so instead of faking a download link.
export const metadata = {
  title: "EasyRep AI - The gym, without the guesswork",
  description:
    "The gym app for people who feel out of place at the gym. Scan any machine to learn it, get kind form feedback, build a plan that starts easy.",
};

const C = {
  ink: "#0B0B0F",
  paper: "#F7F7F8",
  card: "#FFFFFF",
  muted: "#6B7280",
  moss: "#16A34A",
  mossSoft: "#E7F8EE",
  sky: "#3B82F6",
  skySoft: "#EAF2FF",
  amber: "#F59E0B",
  amberSoft: "#FEF3E2",
};

const FEATURES = [
  {
    chip: { bg: C.mossSoft, fg: C.moss, glyph: "📷" },
    title: "Scan any machine",
    text: "Point your camera at a machine and get its name, how to set it up, and how to use it. No guessing, no asking anyone.",
  },
  {
    chip: { bg: C.skySoft, fg: C.sky, glyph: "🎬" },
    title: "Kind form checks",
    text: "Record a short clip of your lift. The video never leaves your phone; only a few still frames are analyzed, then gone. Feedback always starts with what you did well.",
  },
  {
    chip: { bg: C.amberSoft, fg: C.amber, glyph: "💬" },
    title: "A coach in your pocket",
    text: "Ask the things you'd never ask out loud. What's gym etiquette for sharing a machine? Is this soreness normal? Plain answers, zero judgment.",
  },
  {
    chip: { bg: C.mossSoft, fg: C.moss, glyph: "🍽" },
    title: "Meal scans",
    text: "Snap your plate for an approximate calorie and protein estimate. Approximate is the honest word, and the app says so.",
  },
  {
    chip: { bg: C.skySoft, fg: C.sky, glyph: "🗓" },
    title: "A plan that starts easy",
    text: "Two or three short sessions a week, machines first so the equipment guides the movement. Busy machine? One tap swaps it for an equivalent.",
  },
  {
    chip: { bg: C.amberSoft, fg: C.amber, glyph: "🔥" },
    title: "A streak that counts showing up",
    text: "Your streak counts visits, never weights or numbers to compete with. Showing up is the whole game at the start.",
  },
];

const card = {
  background: C.card,
  borderRadius: 24,
  boxShadow: "0 8px 24px rgba(11,11,15,.06)",
  padding: 24,
};

export default function EasyRepLanding() {
  return (
    <main
      style={{
        background: C.paper,
        color: C.ink,
        minHeight: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 64px" }}>
        {/* Hero */}
        <header style={{ textAlign: "center", padding: "88px 0 56px" }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: C.mossSoft,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              marginBottom: 24,
            }}
            aria-hidden
          >
            🌱
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: C.moss,
              marginBottom: 12,
            }}
          >
            EASYREP AI
          </div>
          <h1
            style={{
              fontSize: "clamp(38px, 7vw, 64px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              margin: "0 0 20px",
            }}
          >
            The gym, without
            <br />
            the guesswork.
          </h1>
          <p
            style={{
              fontSize: 19,
              color: C.muted,
              lineHeight: 1.6,
              maxWidth: 560,
              margin: "0 auto 32px",
            }}
          >
            The app for people who want to go to the gym but feel like it
            belongs to other people. It doesn't. EasyRep AI walks in with you.
          </p>
          <div
            style={{
              display: "inline-block",
              background: C.ink,
              color: "#fff",
              borderRadius: 999,
              padding: "16px 32px",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            Coming soon to the App Store
          </div>
        </header>

        {/* Features */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.title} style={card}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: f.chip.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  marginBottom: 14,
                }}
                aria-hidden
              >
                {f.chip.glyph}
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>
                {f.title}
              </h2>
              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.6, margin: 0 }}>
                {f.text}
              </p>
            </div>
          ))}
        </section>

        {/* Privacy promise */}
        <section style={{ ...card, marginTop: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>
            Built to collect as little as possible
          </h2>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.6, margin: 0 }}>
            No ads, no tracking SDKs, no selling data. Form check videos never
            leave your phone. Signing in is optional. Everything in the app is
            general exercise guidance, not medical advice. The details are in
            the <a href="/easyrep/privacy" style={{ color: C.moss, fontWeight: 600 }}>privacy policy</a>{" "}
            and <a href="/easyrep/terms" style={{ color: C.moss, fontWeight: 600 }}>terms of use</a>.
          </p>
        </section>

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            marginTop: 56,
            fontSize: 14,
            color: C.muted,
            lineHeight: 2,
          }}
        >
          <div>
            Questions:{" "}
            <a href="mailto:sabah.mrani1965@gmail.com" style={{ color: C.moss, fontWeight: 600 }}>
              sabah.mrani1965@gmail.com
            </a>
          </div>
          <div>
            <a href="/easyrep/privacy" style={{ color: C.muted, marginRight: 16 }}>Privacy</a>
            <a href="/easyrep/terms" style={{ color: C.muted }}>Terms</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
