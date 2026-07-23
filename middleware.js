import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Optional: point a second custom domain (e.g. joincrewquest.com) at this
// same deployment and set NEXT_PUBLIC_POSTER_SITE_URL to its full origin — that
// domain's homepage then rewrites to /crewquest (the public marketing
// landing page) instead of showing the AEOrank marketing site. NEXT_PUBLIC_
// (not just server-side) because AuthSplitLayout.js also needs this
// client-side to re-skin /login.
//
// www.-agnostic on purpose: Vercel auto-redirects the apex to www (or
// vice versa) depending on which domain was added, and it's easy to set
// this env var to whichever variant isn't actually the one serving
// traffic. Stripping "www." on both sides before comparing means either
// form works regardless of which one Vercel treats as canonical.
function stripWww(hostname) {
  return hostname.replace(/^www\./, "");
}

function posterHostname() {
  const url = process.env.NEXT_PUBLIC_POSTER_SITE_URL;
  if (!url) return null;
  try {
    return stripWww(new URL(url).hostname);
  } catch {
    return null;
  }
}

function matchesPrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

// Hard product separation: a CrewQuest (poster) visitor must never see
// AEOrank customer-product content, and vice versa — not even
// transiently via a stray link, an old bookmark, or a signup form that
// doesn't know which domain it's being rendered on (this is exactly how
// a real customer ended up on AEOrank's onboarding wizard while on
// joincrewquest.com/signup). Each side redirects to its OWN closest
// equivalent, never to the other product/domain — an AEOrank visitor
// should never even learn CrewQuest exists, and a CrewQuest visitor
// should never see AEOrank's product.
//
// Deliberately NOT restricted: /login, /forgot-password, /reset-password,
// /auth/callback, /terms, /privacy — genuinely shared, domain-agnostic
// (and /login already re-skins itself per-domain via AuthSplitLayout).
// /admin isn't restricted either — it's not a customer-facing surface and
// is already independently access-controlled (lib/adminAuth.js).
// /signup, /onboarding, /dashboard (AEOrank side) and /apply-poster,
// /poster (CrewQuest side) are handled by their own explicit branches
// below — each has a more specific destination on the other domain than
// the generic marketing-homepage fallback, so they're not repeated here.
const AEORANK_ONLY = ["/report", "/services", "/industries", "/blog", "/checkout", "/contact", "/about"];
const CREWQUEST_ONLY = ["/crewquest"];

export async function middleware(request) {
  const response = await updateSession(request);

  const hostname = posterHostname();
  const requestHost = stripWww((request.headers.get("host") || "").split(":")[0]);
  const onPosterDomain = Boolean(hostname && requestHost === hostname);
  const pathname = request.nextUrl.pathname;

  function redirectTo(newPathname, preserveQuery = false) {
    const url = request.nextUrl.clone();
    url.pathname = newPathname;
    if (!preserveQuery) url.search = "";
    const redirected = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirected.cookies.set(c.name, c.value, c));
    return redirected;
  }

  if (onPosterDomain) {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/crewquest";
      const rewritten = NextResponse.rewrite(url);
      response.cookies.getAll().forEach((c) => rewritten.cookies.set(c.name, c.value, c));
      return rewritten;
    }
    // Direct equivalent — carries ?ref= through, same as the real signup flow.
    if (matchesPrefix(pathname, "/signup")) return redirectTo("/apply-poster", true);
    if (matchesPrefix(pathname, "/onboarding")) return redirectTo("/apply-poster");
    if (matchesPrefix(pathname, "/dashboard")) return redirectTo("/poster");
    if (AEORANK_ONLY.some((p) => matchesPrefix(pathname, p))) return redirectTo("/crewquest");
  } else {
    if (matchesPrefix(pathname, "/apply-poster")) return redirectTo("/signup", true);
    if (matchesPrefix(pathname, "/poster")) return redirectTo("/login");
    if (CREWQUEST_ONLY.some((p) => matchesPrefix(pathname, p))) return redirectTo("/");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
