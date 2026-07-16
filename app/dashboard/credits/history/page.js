import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { actionLabel, transactionType } from "@/lib/credits";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function CreditHistoryPage({ searchParams }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const page = Math.max(1, Number(searchParams?.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: transactions, count } = await supabase
    .from("credit_transactions")
    .select("id, amount, action, description, created_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( credits )</span>
        <h2>Credit history</h2>
        <p className="section-sub">
          <Link href="/dashboard/credits" className="header-link">← Back to credits</Link>
        </p>

        {!transactions || transactions.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            No credit activity yet.
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.1))" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Date</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Action</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Credits</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Description</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-dim)", fontSize: 13 }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--border, rgba(255,255,255,.06))" }}>
                      <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>
                        {new Date(t.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: "10px 12px" }}>{actionLabel(t.action)}</td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          color: t.amount < 0 ? "#ff8a8a" : "#7ee3a3",
                          fontWeight: 600,
                        }}
                      >
                        {t.amount > 0 ? `+${t.amount}` : t.amount}
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>{t.description || "—"}</td>
                      <td style={{ padding: "10px 12px" }}>{transactionType(t.action)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
                {page > 1 && (
                  <Link href={`/dashboard/credits/history?page=${page - 1}`} className="btn btn-ghost">
                    ← Newer
                  </Link>
                )}
                <span style={{ color: "var(--text-dim)", alignSelf: "center", fontSize: 13.5 }}>
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link href={`/dashboard/credits/history?page=${page + 1}`} className="btn btn-ghost">
                    Older →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
