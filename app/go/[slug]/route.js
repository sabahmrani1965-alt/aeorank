import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Hand-curated short links for outreach — a prospect gets
// aeorank.tech/go/<slug> instead of a long report URL with encoded
// query params. Add a line per prospect. (Deliberately /go/ and not
// /r/, which reads as a Reddit path on this site.)
const LINKS = {
  devengo: "/report/devengo?url=https%3A%2F%2Fwww.devengo.com&category=instant+payment+API+fintech",
};

export function GET(req, { params }) {
  const target = LINKS[String(params.slug || "").toLowerCase()];
  return NextResponse.redirect(new URL(target || "/", req.url));
}
