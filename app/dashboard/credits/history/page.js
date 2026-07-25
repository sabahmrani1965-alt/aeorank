import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { actionLabel, transactionType, buildTransactionQuery } from "@/lib/credits";
import TransactionFilters from "@/components/TransactionFilters";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

function pageHref(params, page) {
  const p = new URLSearchParams(params);
  p.set("page", String(page));
  return `/dashboard/credits/history?${p.toString()}`;
}

export default async function CreditHistoryPage({ searchParams }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const page = Math.max(1, Number(searchParams?.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const filters = {
    q: searchParams?.q || "",
    type: searchParams?.type || "",
    from: searchParams?.from || "",
    to: searchParams?.to || "",
  };

  const { data: transactions, count } = await buildTransactionQuery(supabase, user.id, filters).range(from, to);

  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  const linkParams = {};
  if (filters.q) linkParams.q = filters.q;
  if (filters.type) linkParams.type = filters.type;
  if (filters.from) linkParams.from = filters.from;
  if (filters.to) linkParams.to = filters.to;
  const exportHref = `/api/credits/history/export?${new URLSearchParams(linkParams).toString()}`;

  return (
    <section className="section">
      <div className="container">
        <span className="section-tag">( credits )</span>
        <h2>Credit history</h2>
        <p className="section-sub">
          <Link href="/dashboard/credits" className="header-link">← Back to credits</Link>
        </p>

        <TransactionFilters exportHref={exportHref} />

        {!transactions || transactions.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-dim)" }}>
            {count === 0 && !filters.q && !filters.type && !filters.from && !filters.to
              ? "No credit activity yet."
              : "No transactions match these filters."}
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
                          color: t.amount < 0 ? "var(--state-danger-fg)" : "var(--msg-success)",
                          fontWeight: 600,
                        }}
                      >
                        {t.amount > 0 ? `+${t.amount}` : t.amount}
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--text-dim)" }}>{t.description || "-"}</td>
                      <td style={{ padding: "10px 12px" }}>{transactionType(t.action)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
                {page > 1 && (
                  <Link href={pageHref(linkParams, page - 1)} className="btn btn-ghost">
                    ← Newer
                  </Link>
                )}
                <span style={{ color: "var(--text-dim)", alignSelf: "center", fontSize: 13.5 }}>
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link href={pageHref(linkParams, page + 1)} className="btn btn-ghost">
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
