import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata = {
  title: { default: 'AEOrank – #1 AEO Agency for B2B SaaS', template: '%s | AEOrank' },
  description: 'Get your SaaS brand cited by ChatGPT, Perplexity & Google AI. AEOrank is the leading Answer Engine Optimization agency for B2B SaaS companies.',
  metadataBase: new URL('https://aeorank.tech'),
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  openGraph: {
    title: 'AEOrank – #1 AEO Agency for B2B SaaS',
    description: 'Get your SaaS brand cited by ChatGPT, Perplexity & Google AI.',
    url: 'https://aeorank.tech',
    siteName: 'AEOrank',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
