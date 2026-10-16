// AVORA's privacy policy, hosted here until the app has its own domain.
// Written to match what the app ACTUALLY does; if the app changes, this page
// changes with it. Almost everything in AVORA stays on the phone; the one
// exception is the 3D twin (AVORA Pro), which needs a server.
export const metadata = { title: "Privacy Policy - AVORA" };

const S = { maxWidth: 720, margin: "0 auto", padding: "60px 24px", lineHeight: 1.7, fontSize: 16 };

export default function AvoraPrivacy() {
  return (
    <main style={S}>
      <h1>AVORA Privacy Policy</h1>
      <p><em>Last updated: October 16, 2026</em></p>

      <h2>The short version</h2>
      <p>
        Your wardrobe lives on your phone. The photos you take of your clothes are stored in
        the app on your device, and clothes are recognised on the phone itself. The one
        exception is the 3D twin, an AVORA Pro feature: when you dress the twin, the photos
        of the pieces it wears are sent to build it in 3D, and only after you agree to that
        in the app. There are no ads and no trackers, and nothing you do in AVORA is sent to
        us to be analysed.
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
      <p>Four things, all of them optional or started by you.</p>
      <ul>
        <li>
          <strong>Photos of the pieces you dress your 3D twin in (AVORA Pro).</strong> The 3D twin
          can&apos;t be built on the phone. The first time you use it, AVORA asks before anything is
          sent. After that, when you dress the twin in a combination of pieces it hasn&apos;t built
          before, the photos of those pieces (at most five, resized) are sent to our server and
          from there to AI models run by BytePlus, ByteDance&apos;s cloud service, which dress a
          mannequin in them and build it in 3D. Nothing else from your wardrobe is sent, and no
          other photos, name, email or account details go with them. Our server does not keep
          the photos: they are passed on and discarded. BytePlus processes them under its own
          terms to return the result. We keep the finished 3D model, so the same outfit opens
          instantly the next time; it shows a mannequin, not you, and is stored under a random
          identifier with nothing that names you.
        </li>
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
      <p>
        To build the 3D twin only for subscribers, the app shows our server Apple&apos;s signed
        receipt for your subscription. From it we use the subscription&apos;s anonymous identifier
        to count how many new twins were built this month, so there is a fair monthly limit.
        That count is all we keep, and it cannot be traced to your name or Apple Account.
      </p>

      <h2>Children</h2>
      <p>
        AVORA is not aimed at children under 13, and we do not knowingly collect anything from
        them.
      </p>

      <h2>Your rights</h2>
      <p>
        Because the data is on your phone, you already hold it. You can delete any piece of
        clothing, clear the whole app with Start over, delete your account from the profile
        screen, or delete the app. On our side we hold no wardrobe data, no photos and no usage
        history: only the 3D twins built for AVORA Pro and the monthly count described above.
        Write to us and we will delete the twins built from your subscription and confirm it
        in writing.
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
