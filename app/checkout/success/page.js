import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { CALENDLY_URL } from "@/lib/links";

export const metadata = {
  title: "Welcome aboard — AEOrank",
  description: "Your AEOrank plan is active. Here's what happens next.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function loadSession(sessionId) {
  if (!sessionId || !isStripeConfigured()) return null;
  try {
    const s = await stripe().checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
    return s;
  } catch (e) {
    console.error("[checkout/success] retrieve failed:", e?.message || e);
    return null;
  }
}

export default async function CheckoutSuccess({ searchParams }) {
  const sessionId = searchParams?.session_id || "";
  const session = await loadSession(sessionId);
  const plan = session?.metadata?.plan || "";
  const brand = session?.metadata?.brand || "";
  const email =
    session?.customer_details?.email || session?.customer_email || "";

  return (
    <>
      <Header />
      <section className="section">
        <div className="container-narrow">
          <span className="section-tag">( payment confirmed )</span>
          <h2 style={{ textAlign: "center" }}>
            You're <span className="accent">in.</span>
          </h2>
          <p className="section-sub">
            Thanks for joining AEOrank{plan ? ` on the ${plan} plan` : ""}. We'll be in touch within one business day to kick off onboarding.
          </p>

          <div
            className="card"
            style={{
              marginBottom: 24,
              borderColor: "rgba(242, 168, 59, 0.4)",
              padding: 28,
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: 8 }}>Book your kickoff call</h3>
            <p style={{ color: "var(--text-dim)", marginBottom: 18 }}>
              Pick a 30-minute slot that works for you. We'll align on tone,
              target subreddits, and your first batch of drafts on the call.
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Book a Call →
            </a>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 12 }}>What happens next</h3>
            <ol style={{ color: "var(--text-dim)", paddingLeft: 18, lineHeight: 1.7 }}>
              <li>You'll get a welcome email{email ? ` at ${email}` : ""} within minutes confirming the charge.</li>
              <li>Book the kickoff call above (or reply to the welcome email if you prefer async).</li>
              <li>We'll share your first batch of post and comment drafts within 48 hours of the call, ready for your approval before anything goes live.</li>
            </ol>
          </div>

          {brand ? (
            <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>
              Reference brand on file: <strong>{brand}</strong>
            </p>
          ) : null}

          <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
            <Link href="/" className="btn btn-ghost">Back to home</Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
