// Server-only: fetches a website's <title> and meta description. Kept out
// of lib/site.js (imported by components/DashboardAnalyzeForm.js, a client
// component) since this uses node:dns/node:net, which can't be bundled for
// the browser.

import dns from "node:dns/promises";
import net from "node:net";
import { parseMeta } from "@/lib/site";

const UA =
  "Mozilla/5.0 (compatible; AEOrank/1.0; +https://aeorank.tech)";

// SSRF guard — this function's whole job is "fetch whatever URL a visitor
// typed in" (onboarding, the autofill endpoint, and the fully public
// /report/[brand]?url= page all funnel here), so it must never be allowed
// to reach internal/private network space (cloud metadata endpoints,
// localhost, RFC1918 ranges, etc.). Checked AFTER DNS resolution — a
// hostname string blocklist alone can't catch a domain that simply
// resolves to a private IP.
function isPrivateOrReservedIp(ip) {
  const version = net.isIP(ip);
  if (!version) return true; // unparseable — treat as unsafe
  if (version === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // loopback
    if (a === 0) return true; // "this network"
    if (a === 169 && b === 254) return true; // link-local incl. cloud metadata (169.254.169.254)
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 (carrier-grade NAT)
    if (a >= 224) return true; // multicast/reserved
    return false;
  }
  const lower = ip.toLowerCase();
  if (lower === "::1") return true; // loopback
  if (lower.startsWith("fe80:")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local (fc00::/7)
  if (lower.startsWith("::ffff:")) return isPrivateOrReservedIp(lower.slice(7)); // IPv4-mapped
  return false;
}

async function assertPublicHttpUrl(rawUrl) {
  const parsed = new URL(rawUrl);
  if (!/^https?:$/.test(parsed.protocol)) throw new Error("Blocked: unsupported protocol.");
  if (parsed.hostname.toLowerCase() === "localhost") throw new Error("Blocked host.");
  let addresses;
  try {
    addresses = await dns.lookup(parsed.hostname, { all: true, verbatim: true });
  } catch {
    throw new Error("Could not resolve host.");
  }
  if (addresses.length === 0 || addresses.some((a) => isPrivateOrReservedIp(a.address))) {
    throw new Error("Blocked host.");
  }
  return parsed;
}

export async function fetchSiteMeta(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    let currentUrl = url;
    let res;
    // Redirects are followed manually (not `redirect: "follow"`) so every
    // hop — not just the original URL — gets the same public-IP check.
    // Otherwise a public URL that 302s to an internal address would sail
    // straight through.
    for (let hop = 0; ; hop++) {
      if (hop > 5) throw new Error("Too many redirects.");
      await assertPublicHttpUrl(currentUrl);
      res = await fetch(currentUrl, {
        headers: { "User-Agent": UA, Accept: "text/html" },
        signal: controller.signal,
        redirect: "manual",
      });
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get("location");
        if (!location) throw new Error("Redirect with no location.");
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }
      break;
    }
    if (!res.ok) throw new Error("status " + res.status);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let html = "";
    let total = 0;
    const MAX = 200_000;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      html += decoder.decode(value, { stream: true });
      if (total > MAX) {
        try { reader.cancel(); } catch {}
        break;
      }
    }
    return parseMeta(html);
  } catch (e) {
    return { title: "", description: "", ok: false, error: String(e.message || e) };
  } finally {
    clearTimeout(timer);
  }
}
