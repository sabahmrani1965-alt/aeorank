import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Optional: point a second custom domain (e.g. joincrewquest.com) at this
// same deployment and set NEXT_PUBLIC_POSTER_SITE_URL to its full origin — that
// domain's homepage then rewrites straight to /poster instead of showing
// the AEOrank marketing site. Everything else on that domain (login,
// forgot-password, /apply-poster) already works unchanged, since it's the
// same app either way. NEXT_PUBLIC_ (not just server-side) because
// AuthSplitLayout.js also needs this client-side to re-skin /login.
function posterHostname() {
  const url = process.env.NEXT_PUBLIC_POSTER_SITE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const response = await updateSession(request);

  const hostname = posterHostname();
  const requestHost = (request.headers.get("host") || "").split(":")[0];
  if (hostname && requestHost === hostname && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/poster";
    const rewritten = NextResponse.rewrite(url);
    // Carry over the refreshed session cookies from updateSession's response.
    response.cookies.getAll().forEach((c) => rewritten.cookies.set(c.name, c.value, c));
    return rewritten;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
