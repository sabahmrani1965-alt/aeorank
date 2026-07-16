import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { actionLabel, buildTransactionQuery } from "@/lib/credits";

export const runtime = "nodejs";

function csvCell(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const params = new URL(req.url).searchParams;
  const filters = {
    q: params.get("q") || "",
    type: params.get("type") || "",
    from: params.get("from") || "",
    to: params.get("to") || "",
  };

  // "Balance after" isn't stored per row, so it's reconstructed from the
  // FULL unfiltered ledger (oldest-first cumulative sum) — computing it
  // from just the filtered rows would silently skip intervening
  // transactions and produce a wrong running balance.
  const { data: allTxns } = await supabase
    .from("credit_transactions")
    .select("id, amount, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const balanceAfterById = new Map();
  let running = 0;
  for (const t of allTxns || []) {
    running += t.amount;
    balanceAfterById.set(t.id, running);
  }

  const { data: rows } = await buildTransactionQuery(supabase, user.id, filters);

  const header = ["Date", "Action", "Description", "Credits", "Balance After", "Status"];
  const lines = [header.join(",")];
  for (const t of rows || []) {
    const status = t.action === "refund" ? "Refunded" : "Completed";
    lines.push(
      [
        new Date(t.created_at).toISOString(),
        actionLabel(t.action),
        t.description || "",
        t.amount,
        balanceAfterById.get(t.id) ?? "",
        status,
      ]
        .map(csvCell)
        .join(",")
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="credits-history-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
