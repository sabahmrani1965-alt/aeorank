import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "leads.json");
const IS_VERCEL = Boolean(process.env.VERCEL);

async function persistLocally(lead) {
  if (IS_VERCEL) return; // filesystem is read-only on Vercel
  try {
    let leads = [];
    try {
      const buf = await fs.readFile(FILE, "utf8");
      leads = JSON.parse(buf);
    } catch {}
    leads.unshift(lead);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(leads.slice(0, 5000), null, 2));
  } catch (e) {
    console.error("[lead] local persist failed:", e?.message || e);
  }
}

async function emailViaResend(lead) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_EMAIL_TO;
  const from = process.env.LEAD_EMAIL_FROM || "leads@aeorank.com";
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `[AEOrank lead] ${lead.name} — ${lead.plan}`,
        text: [
          `Name: ${lead.name}`,
          `Email: ${lead.email}`,
          `Company: ${lead.company || "(none)"}`,
          `Plan: ${lead.plan}`,
          ``,
          `Message:`,
          lead.message || "(none)",
          ``,
          `— received ${lead.createdAt}`,
        ].join("\n"),
      }),
    });
  } catch (e) {
    console.error("[lead] resend failed:", e?.message || e);
  }
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  const name = String(body.name || "").trim().slice(0, 120);
  const email = String(body.email || "").trim().slice(0, 200);
  const company = String(body.company || "").trim().slice(0, 120);
  const message = String(body.message || "").trim().slice(0, 2000);
  const plan = String(body.plan || "general").trim().slice(0, 80);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please provide a valid email address." },
      { status: 400 }
    );
  }
  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Please provide your name." },
      { status: 400 }
    );
  }

  const lead = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
    name, email, company, message, plan,
    ip: req.headers.get("x-forwarded-for") || "unknown",
    userAgent: req.headers.get("user-agent") || "",
  };

  // Always log to server console — Vercel keeps the last ~hour of logs.
  console.log(
    `[lead] ${lead.createdAt} | ${lead.email} | plan=${lead.plan} | name=${lead.name} | company=${lead.company || "-"} | message=${(lead.message || "").replace(/\s+/g, " ").slice(0, 200)}`
  );

  // Persist + email (best-effort, both safe to skip).
  await Promise.all([persistLocally(lead), emailViaResend(lead)]);

  return NextResponse.json({ ok: true, id: lead.id });
}
