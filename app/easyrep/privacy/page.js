// EasyRep AI's privacy policy — hosted on this domain until the app gets
// its own. Written to match what the app ACTUALLY does; if app behavior
// changes, this page must change with it.
export const metadata = { title: "Privacy Policy - EasyRep AI" };

const S = { maxWidth: 720, margin: "0 auto", padding: "60px 24px", lineHeight: 1.7, fontSize: 16 };

export default function EasyRepPrivacy() {
  return (
    <main style={S}>
      <h1>EasyRep AI Privacy Policy</h1>
      <p><em>Last updated: September 9, 2026</em></p>

      <h2>The short version</h2>
      <p>
        EasyRep AI helps you feel comfortable at the gym. We collect as little as possible,
        we never sell your data, and most of what the app knows about you lives on your own
        phone.
      </p>

      <h2>What we collect and why</h2>
      <ul>
        <li>
          <strong>Email address</strong> (only if you sign in): used to create your account
          and let you sign back in. Signing in is optional; the app works without it.
        </li>
        <li>
          <strong>Onboarding answers</strong> (what worries you about the gym, gym type,
          experience, goal, training days): used to build your workout plan.
        </li>
        <li>
          <strong>Photos you take of machines and meals</strong>: sent to our server, passed
          to an AI service (Anthropic) to identify the machine or estimate the meal, and not
          stored on our servers. The text result is saved to your account if you're signed in.
        </li>
        <li>
          <strong>Form check videos</strong>: the video itself never leaves your phone. The
          app extracts six still frames on your device and sends only those frames for
          analysis. The frames are processed and not stored on our servers; the written
          feedback is saved to your account if you're signed in.
        </li>
        <li>
          <strong>Coach chat messages</strong>: sent to our server and the AI service to
          generate replies; saved to your account if you're signed in so you can scroll back.
        </li>
        <li>
          <strong>Usage basics</strong> (gym visits you log, check-ins, exercise swaps):
          saved to your account if you're signed in, used to show your streak and improve
          default plans.
        </li>
      </ul>

      <h2>What we don't do</h2>
      <ul>
        <li>We don't sell or rent your data to anyone.</li>
        <li>We don't run third-party advertising or tracking SDKs.</li>
        <li>No human reviews your photos, frames, or chats in the normal course of business.</li>
      </ul>

      <h2>Services we rely on</h2>
      <p>
        Supabase (accounts and database), Anthropic (AI analysis of photos, frames, and
        chats), Apple (sign in and payments), and RevenueCat (subscription management).
        Each receives only what it needs to do its job.
      </p>

      <h2>Deleting your account</h2>
      <p>
        In the app: Today tab, Account, Delete account. This permanently removes your
        account and everything attached to it from our systems. Data stored only on your
        phone is removed by deleting the app.
      </p>

      <h2>Contact</h2>
      <p>Questions: sabah.mrani1965@gmail.com</p>
    </main>
  );
}
