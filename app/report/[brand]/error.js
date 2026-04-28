"use client";

// Catches any uncaught render error (server or client) inside the report
// route. Shows a friendly fallback with a retry option instead of the bare
// "Application error" white-on-black React message.

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ReportError({ error, reset }) {
  useEffect(() => {
    console.error("[report/error]", error?.message || error, error?.digest || "");
  }, [error]);

  return (
    <>
      <Header />
      <section className="section">
        <div className="container-narrow">
          <span className="section-tag">( report unavailable )</span>
          <h2 style={{ textAlign: "center" }}>
            We couldn't generate this report <span className="accent">right now.</span>
          </h2>
          <p className="section-sub">
            One of our data sources timed out. This is usually a transient
            spike — try again in a moment, or pick a different brand to
            continue.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            <button onClick={() => reset()} className="btn btn-primary">
              Try again
            </button>
            <Link href="/" className="btn btn-ghost">
              Back to home
            </Link>
          </div>

          {error?.digest ? (
            <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: 12, marginTop: 20 }}>
              Reference: {error.digest}
            </p>
          ) : null}
        </div>
      </section>
      <Footer />
    </>
  );
}
