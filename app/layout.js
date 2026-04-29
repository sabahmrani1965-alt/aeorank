import "./globals.css";
import { Inter, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

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

export const metadata = {
  title: "AEOrank — Reddit & AI Visibility Report",
  description:
    "Help your brand show up in ChatGPT, Claude, and Gemini answers through measurable Reddit engagement. Free report from any URL.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
