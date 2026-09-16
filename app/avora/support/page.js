// AVORA's support page. App Store Connect requires a support URL, and the app
// links here from the paywall, so it has to answer the questions people
// actually arrive with: billing, the wardrobe, and getting their data back out.
export const metadata = { title: "Support - AVORA" };

const S = { maxWidth: 720, margin: "0 auto", padding: "60px 24px", lineHeight: 1.7, fontSize: 16 };

export default function AvoraSupport() {
  return (
    <main style={S}>
      <h1>AVORA Support</h1>
      <p><em>AVORA: 3D AI Stylist — help, questions and contact.</em></p>

      <h2>Get in touch</h2>
      <p>
        Email <a href="mailto:support@aeorank.tech">support@aeorank.tech</a> with what happened
        and which iPhone you are on. We answer within two business days. If it is a bug, the
        version number at the bottom of the Profile tab helps us find it faster.
      </p>

      <h2>Common questions</h2>

      <h3>How do I add my own clothes?</h3>
      <p>
        Open <strong>Wardrobe</strong> and tap the plus. Take a photo of the piece or pick one
        from your library, and AVORA fills in the category, colour and style for you. You can
        correct anything it gets wrong before saving.
      </p>

      <h3>Where does my daily outfit come from?</h3>
      <p>
        AVORA builds it each morning from what is in your wardrobe, the occasion you picked,
        and the weather where you are — if you allowed location. It learns from what you save,
        what you say you wore, and the looks you turn down with <strong>Not my style</strong>.
      </p>

      <h3>What does Pro include?</h3>
      <p>
        Pro unlocks scanning clothes into your wardrobe and trying looks on your 3D twin.
        It is a monthly or yearly subscription that renews automatically until you cancel.
      </p>

      <h3>How do I cancel my subscription?</h3>
      <p>
        Subscriptions are billed by Apple, so they are cancelled on the device, not in AVORA:
        open <strong>Settings</strong>, tap your name, then <strong>Subscriptions</strong>, choose
        AVORA and tap Cancel Subscription. You keep Pro until the end of the period you already
        paid for. Refunds are also handled by Apple, at{" "}
        <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a>.
      </p>

      <h3>I paid but Pro is not showing.</h3>
      <p>
        Tap <strong>Restore purchases</strong> on the AVORA upgrade screen while signed in with
        the same Apple Account you bought it with. If it still does not appear, email us.
      </p>

      <h3>How do I delete my account or my data?</h3>
      <p>
        Your wardrobe, photos, plans and history are stored on your phone, so deleting the app
        deletes them. To clear everything without uninstalling, use{" "}
        <strong>Start over</strong> in the Profile tab. If you signed in with Apple, the same
        screen has <strong>Delete account</strong>, which removes the sign-in as well.
      </p>

      <h3>Does AVORA need location?</h3>
      <p>
        Only if you want outfits to account for the weather. AVORA sends a rounded position to a
        public forecast service and nothing else; declining it simply turns that feature off.
      </p>

      <h2>Legal</h2>
      <p>
        <a href="/avora/privacy">Privacy Policy</a> · <a href="/avora/terms">Terms of Use</a>
      </p>
    </main>
  );
}
