// EXAMPLE / TEMPLATE ONLY. This shows the exact shape a real provider
// adapter would have — same method signatures, same place you'd read an
// API key, same place you'd make an HTTP call — but the actual network
// calls below are commented out and replaced with fake logic. This file
// never contacts any external service. Copy this file, fill in the real
// endpoint/fetch calls, and register it under its own name to go live —
// see lib/orders/README.md.

const API_KEY = process.env.EXAMPLE_PROVIDER_API_KEY; // set in .env.local / host env vars, never in code
const BASE_URL = "https://api.example-provider.com/v1"; // placeholder — not a real host

export const exampleRealProvider = {
  name: "example-real-shaped",

  async submitOrder({ targetUrl, quantity }) {
    // --- what a real integration would do here ---
    // const res = await fetch(`${BASE_URL}/orders`, {
    //   method: "POST",
    //   headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
    //   body: JSON.stringify({ url: targetUrl, quantity }),
    // });
    // if (!res.ok) throw new Error(`Provider rejected the order: ${res.status}`);
    // const data = await res.json();
    // return { providerOrderId: data.order_id, status: mapStatus(data.status), metadata: { raw: data } };

    // --- fake stand-in, so this file is safe to run/demo ---
    if (!API_KEY) {
      // Deliberately fails closed if someone actually sets this as the
      // active provider without wiring in a real submitOrder() above —
      // makes it obvious this is a template, not a working adapter.
      throw new Error(
        "exampleRealProvider is a template — implement the real fetch() call before using it."
      );
    }
    return { providerOrderId: `example_${Date.now()}`, status: "in_progress", metadata: { quantity } };
  },

  async pollStatus({ providerOrderId, metadata }) {
    // --- what a real integration would do here ---
    // const res = await fetch(`${BASE_URL}/orders/${providerOrderId}`, {
    //   headers: { "X-API-Key": API_KEY },
    // });
    // if (!res.ok) throw new Error(`Could not check order status: ${res.status}`);
    // const data = await res.json();
    // return { status: mapStatus(data.status), result: { delivered: data.delivered_count } };

    // --- fake stand-in ---
    return { status: "in_progress", metadata };
  },

  // A real provider that pushes webhooks would implement verifyWebhook()
  // here too — see lib/orders/README.md for the shape. Left out entirely
  // in this template since there's nothing real to verify against.
};

// function mapStatus(providerStatus) {
//   // Real providers rarely use the same 4 status strings as this app —
//   // this is where you'd translate theirs into
//   // 'pending' | 'in_progress' | 'completed' | 'failed'.
//   return { queued: "pending", running: "in_progress", done: "completed", error: "failed" }[providerStatus] || "pending";
// }
