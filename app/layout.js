import "./globals.css";
import Script from "next/script";
import { Inter, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

const GA_MEASUREMENT_ID = "G-D8ZMJKS5NF";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-caveat",
});

const SITE = "https://www.aeorank.tech";

export const metadata = {
  // metadataBase lets the generated opengraph-image resolve to an absolute
  // URL. Without it Next emits a relative path and crawlers ignore the card.
  metadataBase: new URL(SITE),
  title: "AEOrank: Reddit & AI Visibility Report",
  description:
    "Help your brand show up in ChatGPT, Claude, and Gemini answers through measurable Reddit engagement.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    siteName: "AEOrank",
    url: SITE,
    title: "AEOrank: Reddit & AI Visibility Report",
    description:
      "Help your brand show up in ChatGPT, Claude, and Gemini answers through measurable Reddit engagement.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AEOrank: Reddit & AI Visibility Report",
    description:
      "Help your brand show up in ChatGPT, Claude, and Gemini answers through measurable Reddit engagement.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body>
        {children}
        <Analytics />
        {/* lazyOnload, not afterInteractive: gtag.js is ~172KB, about a
            third of every page's transferred weight, and it was competing
            with the render on mobile where LCP sits above 5s on the blog
            and service pages. Deferring it until after load costs a small
            number of very short sessions in GA and takes the largest
            single resource off the critical path. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
