// AVORA's privacy policy, hosted here until the app has its own domain.
// Written to match what the app ACTUALLY does; if the app changes, this page
// changes with it. Almost everything in AVORA stays on the phone, which makes
// this shorter than most.
export const metadata = { title: "Privacy Policy - AVORA" };

const S = { maxWidth: 720, margin: "0 auto", padding: "60px 24px", lineHeight: 1.7, fontSize: 16 };

export default function AvoraPrivacy() {
  return (
    <main style={S}>
      <h1>AVORA Privacy Policy</h1>
      <p><em>Last updated: September 16, 2026</em></p>

      <h2>The short version</h2>
      <p>
        Your wardrobe lives on your phone. The photos you take of your clothes are stored in
        the app on your device and are never uploaded. Clothes are recognised on the phone
        itself, so no photo is sent anywhere to be read. There are no ads and no trackers, and
        nothing you do in AVORA is sent to us to be analysed.
      </p>

      <h2>What stays on your phone</h2>
      <ul>
        <li><strong>Your clothes</strong>: every photo you take or choose, resized and saved in
          the app&apos;s own storage.</li>
        <li><strong>What AVORA knows about them</strong>: name, category, colour, material and
          style, worked out on the phone.</li>
        <li><strong>Your answers to the style quiz</strong>: who AVORA is styling, the styles
          and colours you picked, what you dress for, and the name you gave.</li>
        <li><strong>Your plans and history</strong>: outfits planned for a day, outfits you
          saved, what you said you wore, and looks you turned down.</li>
        <li><strong>Usage counts</strong>: how often you open the app and use its features.
          These are kept on the device so the app can show them back to you. They are not sent
          to us.</li>
      </ul>
      <p>
        Deleting AVORA deletes all of it. <strong>Start over</strong> in the app&apos;s profile does
        the same without uninstalling.
      </p>

      <h2>What leaves your phone, and when</h2>
      <p>Three things, all of them optional or initiated by you.</p>
      <ul>
        <li>
          <strong>The weather, if you turn it on.</strong> Tapping &quot;Dress for the weather&quot;
          asks for your location. Your position is rounded to roughly a kilometre and sent to
          Open-Meteo (open-meteo.com) to fetch today&apos;s forecast. Nothing identifying you goes
          with it, no account is involved, and we never receive your location. Turning the
          feature off deletes the forecast the app kept.
        </li>
        <li>
          <strong>Signing in, if you choose to.</strong> AVORA offers Sign in with Apple and
          works fully without it. If you use it, Apple gives the app an identifier for you, and
          your name and email only if you allow it. That is kept in your device&apos;s keychain.
          Signing out or deleting your account in the app removes it.
        </li>
        <li>
          <strong>Sharing a look.</strong> When you tap Share, the app makes an image on your
          phone and hands it to iOS. Where it goes next is your choice, and we are not part of it.
        </li>
      </ul>

      <h2>AVORA Pro</h2>
      <p>
        Subscriptions are handled by Apple. Apple tells the app whether a subscription is
        active; we never see your payment details. Managing or cancelling is done in your Apple
        Account settings.
      </p>

      <h2>Children</h2>
      <p>
        AVORA is not aimed at children under 13, and we do not knowingly collect anything from
        them. There is nothing to collect: the app keeps its data on the device.
      </p>

      <h2>Your rights</h2>
      <p>
        Because the data is on your phone, you already hold it. You can delete any piece of
        clothing, clear the whole app with Start over, delete your account from the profile
        screen, or delete the app. If you have signed in and want to be sure nothing remains on
        our side, write to us and we will confirm in writing: we hold no wardrobe data, no
        photos and no usage history.
      </p>

      <h2>Changes</h2>
      <p>
        If AVORA starts doing something new with data, this page changes first, and the date at
        the top with it.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy in AVORA: <a href="mailto:sabah.mrani1965@gmail.com">sabah.mrani1965@gmail.com</a>.
      </p>
    </main>
  );
}
