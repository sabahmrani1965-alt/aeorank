// BiteWise's privacy policy, hosted here until the app gets its own
// domain. Written to match what the app ACTUALLY does; if the app changes,
// this page changes with it. BiteWise has no accounts at all, which makes
// this shorter than most.
export const metadata = { title: "Privacy Policy - BiteWise" };

const S = { maxWidth: 720, margin: "0 auto", padding: "60px 24px", lineHeight: 1.7, fontSize: 16 };

export default function BiteWisePrivacy() {
  return (
    <main style={S}>
      <h1>BiteWise Privacy Policy</h1>
      <p><em>Last updated: September 9, 2026</em></p>

      <h2>The short version</h2>
      <p>
        BiteWise has no accounts and no sign in. Your photos and your history stay on your
        phone. A photo is sent for analysis when you ask for one, and it is not kept after
        the answer comes back. There are no ads, no analytics, and no trackers.
      </p>

      <h2>What happens to a photo</h2>
      <p>
        When you check a bite, the app resizes the photo on your phone and sends it to our
        server, which passes it to Anthropic&apos;s Claude to be read. The answer comes back and
        the photo is discarded. We do not store it, we do not use it to train anything, and it
        is not attached to your name, because we do not know your name.
      </p>
      <p>
        Alongside the photo we send only what you chose to tell us: where on the body the mark
        is, if you tapped one of those buttons. Nothing else.
      </p>

      <h2>What stays on your phone</h2>
      <ul>
        <li><strong>Your checks</strong>: the photo, the date, and the result. These live in the
          app&apos;s own storage on your device.</li>
        <li><strong>How many free checks you have used</strong>, so the app knows when the free
          allowance runs out.</li>
        <li><strong>Whether you subscribe.</strong></li>
      </ul>
      <p>
        None of this is sent to us. Delete the app, or use Delete all my data in Settings, and it
        is gone. We cannot recover it, because we never had it.
      </p>

      <h2>What our server sees</h2>
      <p>
        Our server sees your IP address when the app calls it, which is unavoidable for anything
        on the internet, and we use it only to stop one person making thousands of requests. It is
        held briefly in memory and never written to a database or linked to your checks.
      </p>

      <h2>Health information</h2>
      <p>
        A photo of a bite is sensitive. That is exactly why the app keeps your history on your
        device rather than on our servers, and why there is no account to tie it to. We do not
        build a health profile of you, because we have nothing to build one from.
      </p>

      <h2>Who else is involved</h2>
      <ul>
        <li><strong>Anthropic</strong> reads the photo to produce the result. They do not use API
          content to train their models.</li>
        <li><strong>Vercel</strong> hosts the server the app talks to.</li>
        <li><strong>Apple</strong> handles any subscription payment. We never see your card.</li>
        <li><strong>RevenueCat</strong> tells the app whether a subscription is active. It receives
          an anonymous identifier, not your name or email.</li>
      </ul>
      <p>There is no advertising network, no analytics SDK, and no data broker. Nothing is sold.</p>

      <h2>Children</h2>
      <p>
        BiteWise is not intended for children under 13, and we do not knowingly collect anything
        from them. Since there are no accounts, we collect nothing from anyone by default.
      </p>

      <h2>Your rights</h2>
      <p>
        Because everything is on your phone, you exercise them yourself: Settings, then Delete all
        my data, removes every check immediately. There is no server side copy to request or
        erase. If you have a question anyway, email{" "}
        <a href="mailto:abdelhadi@easyrepai.app">abdelhadi@easyrepai.app</a>.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes, the date at the top changes with it. Material changes will be
        announced in the app before they take effect.
      </p>
    </main>
  );
}
