import { createAdminClient } from "@/lib/supabase/admin";
import { getCategory } from "@/lib/categoryData";
import { looksLikeBot, readQueue, readVisits, refOf } from "@/lib/outreach";
import OutreachMark from "@/components/OutreachMark";

export const dynamic = "force-dynamic";

// Who was emailed, who opened their AI report, and who to follow up with.
// Replies land in ilyas@aeorank.tech, not here: mark them, so the automatic
// follow-up skips that person.
const STATUS = {
  queued: ["Queued", "var(--text-muted)"],
  sent: ["Sent", "var(--text)"],
  followed_up: ["Followed up", "var(--text)"],
  replied: ["Replied", "#2f8f5b"],
  optout: ["Opted out", "#c4432a"],
  skipped_named: ["Skipped (now named)", "var(--text-muted)"],
  failed: ["Send failed", "#c4432a"],
};

const when = (iso) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC" : "–";

export default async function AdminOutreach() {
  const admin = createAdminClient();
  if (!admin) return <p style={{ padding: 24 }}>Supabase service role key isn&apos;t configured.</p>;
  const [items, visits] = await Promise.all([readQueue(admin), readVisits(admin)]);

  const rows = items.map((it) => {
    const mine = visits.filter((v) => v.ref === refOf(it.to));
    const people = mine.filter((v) => !looksLikeBot(v, it.sent_at));
    return { it, people, scanners: mine.length - people.length, last: people[0]?.at };
  });
  // Opened-but-not-replied first: the ones worth a personal note today.
  const rank = (r) => (r.people.length && !["replied", "optout"].includes(r.it.status) ? 0 : r.it.sent_at ? 1 : 2);
  rows.sort((a, b) => rank(a) - rank(b) || String(b.last || b.it.sent_at || "").localeCompare(String(a.last || a.it.sent_at || "")));

  const count = (f) => rows.filter(f).length;
  const sent = count((r) => r.it.sent_at);
  const opened = count((r) => r.people.length);
  const replied = count((r) => r.it.status === "replied");

  const th = { textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--card-border)", fontSize: 13, color: "var(--text-muted)", fontWeight: 700, whiteSpace: "nowrap" };
  const td = { padding: "12px", borderBottom: "1px solid var(--border)", verticalAlign: "top", fontSize: 14.5, color: "var(--text)" };

  return (
    <section className="section" style={{ paddingTop: 24 }}>
      <div className="container">
        <h2 style={{ textAlign: "left", fontSize: 28 }}>Outreach</h2>
        <p style={{ color: "var(--text-dim)", marginBottom: 20, maxWidth: 720, lineHeight: 1.6 }}>
          Replies arrive in ilyas@aeorank.tech. Mark them here so the follow-up (sent 4 days after the first email) skips
          that person. &ldquo;Opened&rdquo; counts visits to their report from the email link; visits within two minutes of
          sending or from known scanners are counted separately, as they&apos;re usually email security tools.
        </p>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            ["Emailed", sent],
            ["Opened their report", opened],
            ["Replied", replied],
            ["Queued", count((r) => (r.it.status || "queued") === "queued")],
          ].map(([l, n]) => (
            <div key={l}>
              <div style={{ fontSize: 30, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{n}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{l}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr>
                <th style={th}>Brand</th>
                <th style={th}>Contact</th>
                <th style={th}>Status</th>
                <th style={th}>Sent</th>
                <th style={th}>Follow-up</th>
                <th style={th}>Opened report</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ it, people, scanners, last }) => {
                const [label, color] = STATUS[it.status || "queued"] || [it.status, "var(--text)"];
                return (
                  <tr key={it.to}>
                    <td style={td}>
                      <a href={`/ai-report/${it.category}/${encodeURIComponent(it.brand)}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: "var(--text)" }}>
                        {it.brand}
                      </a>
                      <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{getCategory(it.category)?.name || it.category}</div>
                    </td>
                    <td style={td}>
                      {it.firstname || ""}
                      <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{it.to}</div>
                    </td>
                    <td style={{ ...td, color, fontWeight: 700, whiteSpace: "nowrap" }}>{label}</td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>{when(it.sent_at)}</td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                      {it.followup_id ? when(it.followup_at) : it.followup_skipped ? `Skipped (${it.followup_skipped.replace("_", " ")})` : "–"}
                    </td>
                    <td style={td}>
                      {people.length ? (
                        <>
                          <b style={{ color: "#2f8f5b" }}>
                            {people.length} visit{people.length > 1 ? "s" : ""}
                          </b>
                          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                            last {when(last)}
                            {people[0]?.country ? ` · ${people[0].country}` : ""}
                          </div>
                        </>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>–</span>
                      )}
                      {scanners ? <div style={{ color: "var(--text-muted)", fontSize: 12.5 }}>+{scanners} scanner</div> : null}
                    </td>
                    <td style={td}>{it.sent_at ? <OutreachMark to={it.to} status={it.status} /> : null}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
