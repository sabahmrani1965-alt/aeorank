// The page itself is a client component and cannot export metadata, so the
// title, description and robots rules live here.
//
// noindex: these are account pages, not search results. Leaving them
// indexable also meant all four inherited the homepage title and
// description verbatim, which read as duplicate content.

export const metadata = {
  title: "Reset your password | AEOrank",
  description: "Request a password reset link for your AEOrank account.",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordLayout({ children }) {
  return children;
}
