import MarketingLayout from "@/components/MarketingLayout";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

// We run our own tool on ourselves and publish the number, including
// while it is zero.
//
// This reads prompt_checks live rather than quoting a frozen figure, so
// it cannot drift from the database and the re-measure appears here
// without anyone editing a file. If the number never moves, the page
// says so — that is the point of publishing it before knowing.

export const revalidate = 3600;

const SITE_URL = "https://www.aeorank.tech";
const BRAND = "AEOrank";

export const metadata = {
  title: "Our own AI visibility score: AEOrank",
  description:
    "We measure our own brand with our own tool and publish the result, including the months it reads zero. Live data, fixed query set, every check recorded.",
  alternates: { canonical: `${SITE_URL}/proof` },
  openGraph: {
    title: "Our own AI visibility score",
    description:
      "We measure our own brand with our own tool and publish the result, including the months it reads zero.",
    type: "website",
    url: `${SITE_URL}/proof`,
    images: ["/opengraph-image"],
  },
};

async function loadChecks() {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data: profiles } = await admin
    .from("company_profiles")
    .select("id, company_name")
    .eq("company_name", BRAND);
  const profileIds = (profiles || []).map((p) => p.id);
  if (profileIds.length === 0) return null;

  const { data: prompts } = await admin
    .from("prompts")
    .select("id, text")
    .in("company_profile_id", profileIds);
  const promptIds = (prompts || []).map((p) => p.id);
  if (promptIds.length === 0) return null;

  const { data: checks } = await admin
    .from("prompt_checks")
    .select("created_at, mentioned, model")
    .in("prompt_id", promptIds)
    .order("created_at", { ascending: true });
  if (!checks) return null;

  const byModel = {};
  for (const c of checks) {
    const m = c.model || "Unknown";
    byModel[m] = byModel[m] || { checks: 0, mentions: 0 };
    byModel[m].checks += 1;
    if (c.mentioned) byModel[m].mentions += 1;
  }

  return {
    prompts: (prompts || []).map((p) => p.text),
    total: checks.length,
    mentions: checks.filter((c) => c.mentioned).length,
    first: checks[0]?.created_at?.slice(0, 10),
    last: checks[checks.length - 1]?.created_at?.slice(0, 10),
    days: new Set(checks.map((c) => c.created_at.slice(0, 10))).size,
    byModel,
  };
}

function Figure({ value, label }) {
  return (
    <div style={{ flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, color: "var(--text)" }}>
        {value}
      </div>
      <div style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default async function Proof() {
  const d = await loadChecks();

  return (
    <MarketingLayout>
      <section className="section">
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <span className="section-tag">( our own numbers )</span>
          <h1>
            We ran our own tool <span className="accent">on ourselves.</span>
          </h1>
          <p className="section-sub">
            Every vendor in this category will show you a dashboard. Almost none
            will show you theirs. This page reads our live measurement data, and
            it stays up whether or not the number is flattering.
          </p>
        </div>
      </section>

      {d ? (
        <>
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="container-narrow">
              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <Figure value={d.total} label="checks recorded" />
                  <Figure value={d.mentions} label="times we were named" />
                  <Figure
                    value={`${((d.mentions / Math.max(d.total, 1)) * 100).toFixed(1)}%`}
                    label="mention rate"
                  />
                  <Figure value={d.days} label="days measured" />
                </div>
                <p
                  style={{
                    color: "var(--text-muted)",
                    marginTop: 18,
                    marginBottom: 0,
                    lineHeight: 1.7,
                  }}
                >
                  {d.first} to {d.last}. Updated automatically from the same
                  table the product writes to.
                </p>
              </div>
            </div>
          </section>

          <section className="section" style={{ paddingTop: 0 }}>
            <div className="container-narrow">
              <h2 style={{ fontSize: 24, marginBottom: 14, textAlign: "left" }}>
                By engine
              </h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15.5 }}>
                  <thead>
                    <tr>
                      {["Engine", "Checks", "Mentions"].map((h, i) => (
                        <th
                          key={h}
                          style={{
                            textAlign: i ? "right" : "left",
                            padding: "10px 12px",
                            borderBottom: "1px solid var(--accent)",
                            color: "var(--text)",
                            fontWeight: 700,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(d.byModel)
                      .sort((a, b) => b[1].checks - a[1].checks)
                      .map(([model, v]) => (
                        <tr key={model}>
                          <td
                            style={{
                              padding: "10px 12px",
                              borderBottom: "1px solid var(--border)",
                              color: "var(--text-dim)",
                            }}
                          >
                            {model}
                          </td>
                          {[v.checks, v.mentions].map((n, i) => (
                            <td
                              key={i}
                              style={{
                                padding: "10px 12px",
                                borderBottom: "1px solid var(--border)",
                                color: "var(--text-dim)",
                                textAlign: "right",
                              }}
                            >
                              {n}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <p style={{ color: "var(--text-muted)", marginTop: 14, lineHeight: 1.7 }}>
                The mix is uneven, which limits what a later comparison can claim.
                Per-engine rates are the only fair read, and the engines with a
                handful of checks cannot support a claim at all. We would rather
                publish that caveat than a blended number that hides it.
              </p>
            </div>
          </section>

          <section className="section" style={{ paddingTop: 0 }}>
            <div className="container-narrow">
              <h2 style={{ fontSize: 24, marginBottom: 14, textAlign: "left" }}>
                The questions we measure
              </h2>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
                Fixed before we started and unchanged since. Changing the
                questions mid-study is how a flat result becomes a chart that
                goes up.
              </p>
              <ul style={{ color: "var(--text-dim)", paddingLeft: 22, lineHeight: 1.9 }}>
                {d.prompts.map((t) => (
                  <li key={t}>&ldquo;{t}&rdquo;</li>
                ))}
              </ul>
            </div>
          </section>
        </>
      ) : (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container-narrow">
            <p style={{ color: "var(--text-muted)" }}>
              Measurement data is temporarily unavailable. It will reappear here
              on the next check.
            </p>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: 24, marginBottom: 14, textAlign: "left" }}>
            Why publish this
          </h2>
          <p style={{ color: "var(--text-dim)", lineHeight: 1.8 }}>
            Because the alternative is asking you to trust a number you cannot
            check. We have no client logos to show you and no case study yet, and
            inventing one would be the same dishonesty we warn about in{" "}
            <Link href="/blog/best-ai-visibility-tools" style={{ color: "var(--accent)" }}>
              how to evaluate AI visibility tools
            </Link>
            .
          </p>
          <p style={{ color: "var(--text-dim)", lineHeight: 1.8 }}>
            One thing this page would have got wrong if we had built it earlier:
            our scoring once counted a model replying{" "}
            <em>&ldquo;I&rsquo;m not familiar with that brand&rdquo;</em> as a
            mention, because the sentence contains the brand name. That inflated
            two reports to 100% and 75%. It is fixed, and it is the first
            question worth asking any vendor here, us included.
          </p>
          <p style={{ color: "var(--text-dim)", lineHeight: 1.8 }}>
            A flat result is a real finding. If this number never moves, the
            useful thing is knowing why.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <Link href="/services/ai-visibility-audit" className="btn btn-primary">
              Get your own baseline →
            </Link>
            <Link href="/pricing" className="btn btn-ghost">
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
