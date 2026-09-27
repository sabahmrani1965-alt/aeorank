import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Wraps every public marketing page (homepage, about, services, industries,
// blog, contact, terms, privacy, checkout) in the light theme — see
// .light-theme in app/globals.css. The logged-in dashboard, admin, and
// CrewQuest/poster pages deliberately keep the original dark theme and
// render Header/Footer directly instead of through this wrapper.
const SITE_URL = "https://www.aeorank.tech";
const SITE_DESCRIPTION =
  "Help your brand show up in ChatGPT, Claude, and Gemini answers through measurable Reddit engagement.";

// Organization lived on the homepage only, so every other page carried no
// entity context of its own. It belongs here, where every public page
// inherits one @id that the rest of the graph can point at.
//
// The original rule still holds: sameAs lists only profiles confirmed live
// (checked, not assumed), and there is still no foundingDate because that
// is not a verified fact we have. Add to either as they are confirmed,
// never before.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "AEOrank",
  url: SITE_URL,
  // Raster, not icon.svg: Google's Logo guidance requires at least
  // 112x112px and the SVG declares 60x60. /logo.png is 512x512 on white.
  // icon.svg stays the favicon.
  logo: `${SITE_URL}/logo.png`,
  description: SITE_DESCRIPTION,
  sameAs: ["https://www.linkedin.com/company/aeoranktech"],
};

// WebSite, bound to the Organization above. Deliberately no SearchAction:
// there is no site search to point it at, and markup describing a feature
// that does not exist is worse than none.
const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "AEOrank",
  description: SITE_DESCRIPTION,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function MarketingLayout({ children }) {
  return (
    <div className="light-theme">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <Header />
      {children}
      <Footer />
    </div>
  );
}
