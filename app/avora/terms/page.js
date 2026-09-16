// AVORA's terms of use. Apple's standard EULA applies to the subscription
// itself; this covers what the app is and what it isn't.
export const metadata = { title: "Terms of Use - AVORA" };

const S = { maxWidth: 720, margin: "0 auto", padding: "60px 24px", lineHeight: 1.7, fontSize: 16 };

export default function AvoraTerms() {
  return (
    <main style={S}>
      <h1>AVORA Terms of Use</h1>
      <p><em>Last updated: September 16, 2026</em></p>

      <h2>What AVORA is</h2>
      <p>
        AVORA photographs your clothes, works out what they are, and suggests outfits from what
        you own. It plans what you will wear, remembers what you wore, and learns from what you
        keep and turn down.
      </p>

      <h2>What AVORA is not</h2>
      <p>
        It is a styling app, not advice about anything that matters medically, legally or
        financially. Its suggestions are just suggestions, and what it thinks a garment is can
        be wrong; you can correct it in the app.
      </p>

      <h2>Your clothes and your photos</h2>
      <p>
        The photos you take stay on your phone and remain yours. You are responsible for having
        the right to photograph what you photograph. Delete any piece at any time, or clear
        everything with Start over.
      </p>

      <h2>AVORA Pro</h2>
      <ul>
        <li>Adding your own clothes and the 3D twin are part of AVORA Pro. Everything else is free.</li>
        <li>Pro is a subscription, monthly or yearly, billed through your Apple Account.</li>
        <li>It renews automatically unless cancelled at least 24 hours before the period ends.</li>
        <li>Manage or cancel it in Settings on your iPhone, under your Apple Account, Subscriptions.</li>
        <li>Prices are shown in the app before you buy, in your own currency.</li>
        <li>
          Apple&apos;s{" "}
          <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">
            standard licence terms
          </a>{" "}
          apply to the subscription.
        </li>
      </ul>

      <h2>Refunds</h2>
      <p>
        Purchases go through Apple, so refunds are Apple&apos;s to give. Ask at{" "}
        <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a>.
      </p>

      <h2>Fair use</h2>
      <p>
        Don&apos;t use AVORA to break the law, and don&apos;t try to pull it apart or resell it.
        We may end access that does.
      </p>

      <h2>No guarantee</h2>
      <p>
        AVORA is provided as it is. We do our best to keep it working and useful, but we cannot
        promise it will never be wrong or never be down.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may change as the app does. The date at the top says when they last did.
      </p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:sabah.mrani1965@gmail.com">sabah.mrani1965@gmail.com</a>
      </p>
    </main>
  );
}
