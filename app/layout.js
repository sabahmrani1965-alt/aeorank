import "./globals.css";
import { Inter, Caveat } from "next/font/google";

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
  title: "AEOrank — Reddit & AI Visibility Report (Educational Prototype)",
  description:
    "An academic prototype that generates a Reddit + AI visibility report from any URL. Built strictly for doctoral research and educational purposes.",
  icons: { icon: "/icon.svg" },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
