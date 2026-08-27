export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api", "/onboarding"],
    },
    sitemap: "https://www.aeorank.tech/sitemap.xml",
  };
}
