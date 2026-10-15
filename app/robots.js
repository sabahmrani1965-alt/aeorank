import { headers } from "next/headers";

// One deployment serves three sites, so robots.txt is answered per host:
// before this, joincrewquest.com handed out AEOrank's rules and pointed
// crawlers at AEOrank's sitemap.
function host() {
  return (headers().get("host") || "").split(":")[0].replace(/^www\./, "");
}

export default function robots() {
  const h = host();
  if (h === "easyrepai.app") {
    return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://www.easyrepai.app/sitemap.xml" };
  }
  if (h === "joincrewquest.com") {
    return {
      rules: { userAgent: "*", allow: "/", disallow: ["/poster", "/api", "/login"] },
      sitemap: "https://www.joincrewquest.com/sitemap.xml",
    };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api", "/onboarding"],
    },
    sitemap: "https://www.aeorank.tech/sitemap.xml",
  };
}
