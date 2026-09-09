// BiteWise's terms of use. The medical limits are the part that matters
// here and are stated plainly rather than buried, because the app is read
// by people who are worried about a mark on their skin.
export const metadata = { title: "Terms of Use - BiteWise" };

const S = { maxWidth: 720, margin: "0 auto", padding: "60px 24px", lineHeight: 1.7, fontSize: 16 };

export default function BiteWiseTerms() {
  return (
    <main style={S}>
      <h1>BiteWise Terms of Use</h1>
      <p><em>Last updated: September 9, 2026</em></p>

      <h2>BiteWise is not medical care</h2>
      <p>
        This is the most important thing on this page. BiteWise is an educational tool. It does
        not diagnose, treat, or prevent anything, and it is not a substitute for a doctor,
        pharmacist, or nurse. It reads a photograph, and a photograph cannot examine you.
      </p>
      <p>
        It can be wrong in both directions: it can worry you about something harmless, and it can
        fail to recognise something serious. Never use it to decide against getting help. If you
        are worried, get a real opinion.
      </p>

      <h2>Emergencies</h2>
      <p>
        Do not use this app in an emergency. If there is trouble breathing or swallowing, swelling
        of the lips, tongue, face or throat, dizziness or fainting, or a rash spreading quickly
        over the body, call your local emergency number immediately. A severe allergic reaction
        can develop within minutes and does not wait for a photo.
      </p>

      <h2>What you agree to</h2>
      <ul>
        <li>You are 13 or older.</li>
        <li>You will photograph your own skin, or the skin of someone who has agreed to it.</li>
        <li>You will not rely on BiteWise as your only source of medical judgement.</li>
        <li>You will not use it to provide medical services to other people.</li>
      </ul>

      <h2>Subscriptions</h2>
      <p>
        The bite guide, the emergency signs, and a small allowance of checks are free and always
        will be. BiteWise Pro unlocks unlimited checks.
      </p>
      <ul>
        <li>Payment is charged to your Apple ID at confirmation of purchase.</li>
        <li>It renews automatically unless cancelled at least 24 hours before the period ends.</li>
        <li>Manage or cancel it in your App Store account settings at any time.</li>
        <li>Refunds are handled by Apple under their policy, not by us.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        Your photos are yours. We claim nothing over them. They are sent for analysis and then
        discarded, as described in the{" "}
        <a href="/bitewise/privacy">privacy policy</a>.
      </p>

      <h2>Availability and liability</h2>
      <p>
        BiteWise is provided as is. We do not promise it will always be available, or that any
        result will be accurate. To the extent the law allows, we are not liable for any harm
        arising from your use of the app, including any decision made or delayed because of
        something it told you. Some places do not allow limits like this, in which case they apply
        only as far as that law permits.
      </p>
      <p>Nothing here removes rights you have under the consumer law where you live.</p>

      <h2>Changes</h2>
      <p>
        If these terms change, the date at the top changes with them. Continuing to use the app
        after a change means you accept it.
      </p>

      <h2>Contact</h2>
      <p><a href="mailto:abdelhadi@easyrepai.app">abdelhadi@easyrepai.app</a></p>
    </main>
  );
}
