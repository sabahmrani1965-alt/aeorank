import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Checkout cancelled — AEOrank",
  description: "No charge was made. You can pick up where you left off any time.",
  robots: { index: false, follow: false },
};

export default function CheckoutCancel() {
  return (
    <>
      <Header />
      <section className="section">
        <div className="container-narrow">
          <span className="section-tag">( checkout cancelled )</span>
          <h2 style={{ textAlign: "center" }}>
            No charge — <span className="accent">no worries.</span>
          </h2>
          <p className="section-sub">
            You closed the checkout before finishing. Nothing was charged. If
            something didn't fit or you have a question, we'd rather hear it
            than lose you.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            <Link href="/contact" className="btn btn-primary">Talk to us</Link>
            <Link href="/" className="btn btn-ghost">Back to home</Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
