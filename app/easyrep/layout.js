// easyrepai.app rides on the AEOrank deployment, so without this it would
// inherit AEOrank's favicon in the browser tab. Scoped to the /easyrep
// subtree so the marketing page, privacy and terms all carry the app's own
// dumbbell mark, matching the App Store icon.
export const metadata = {
  icons: {
    icon: [{ url: "/easyrep/icon.svg", type: "image/svg+xml" }],
    shortcut: "/easyrep/icon.svg",
    apple: "/easyrep/icon.svg",
  },
};

export default function EasyRepLayout({ children }) {
  return children;
}
