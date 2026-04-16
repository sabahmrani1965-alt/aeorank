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

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AEOrank',
  url: 'https://aeorank.tech',
  logo: 'https://aeorank.tech/logo.svg',
  description: 'AEOrank is the leading Answer Engine Optimization (AEO) agency for B2B SaaS companies. We help brands get cited by ChatGPT, Perplexity, and Google AI.',
  foundingDate: '2024',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    url: 'https://aeorank.tech/contact',
  },
  areaServed: 'Worldwide',
  serviceType: 'Answer Engine Optimization',
}

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AEOrank',
  url: 'https://aeorank.tech',
  description: 'Get your SaaS brand cited by ChatGPT, Perplexity & Google AI.',
  publisher: { '@type': 'Organization', name: 'AEOrank', url: 'https://aeorank.tech' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
