// The only concrete provider shipped in this codebase. It exists purely
// to exercise the submit -> store id -> poll -> reflect-result pipeline
// end-to-end (for demos/testing of the *architecture*) — it never
// contacts any external service. A real provider is a separate module
// implementing the same OrderProvider shape (see lib/orders/provider.js)
// and registered in lib/orders/index.js; nothing else changes.
function randomProcessingMs() {
  return 8000 + Math.floor(Math.random() * 12000); // ~8-20s "in progress" window
}

export const simulatedProvider = {
  name: "simulated",

  async submitOrder({ quantity }) {
    const providerOrderId = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return {
      providerOrderId,
      status: "in_progress",
      // Stored verbatim on campaign_orders.metadata and passed back into
      // pollStatus() below — this provider is otherwise stateless.
      metadata: { completesAt: Date.now() + randomProcessingMs(), quantity },
    };
  },

  async pollStatus({ metadata }) {
    if (Date.now() < (metadata?.completesAt ?? 0)) {
      return { status: "in_progress", metadata };
    }
    return {
      status: "completed",
      metadata,
      result: { delivered: metadata?.quantity ?? 1 },
    };
  },

  // No verifyWebhook: this provider never pushes updates, only answers
  // pollStatus() — a real provider that does support webhooks would
  // implement verifyWebhook(payload, headers) to authenticate the
  // request (signature/shared-secret check) and translate it into
  // { providerOrderId, status, result?, error? }.
};
