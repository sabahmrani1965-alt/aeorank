# Order providers

This module is a provider-agnostic pipeline for placing an order with an
external service, tracking its lifecycle, and reflecting the result in the
dashboard. It ships with exactly one concrete provider — `simulated`
(`lib/orders/providers/simulatedProvider.js`) — which exists only to
exercise the pipeline end-to-end. It never calls out to anything real.

Nothing in `lib/orders/service.js` or the `app/api/campaigns/**/orders`
routes knows about any specific provider. They only ever call methods on
whatever object `getProvider(name)` returns. That's the extension point:
add a new file that implements the same shape, register it, and the rest
of the app needs zero changes.

## The interface

Documented in full (as JSDoc) in `lib/orders/provider.js`. A provider is a
plain object:

```js
{
  name: "my-provider",           // unique registry key

  async submitOrder({ campaignId, targetUrl, quantity }) {
    // Call the external service's "create order" endpoint here.
    // Must return:
    return {
      providerOrderId: "...",           // the provider's own id for this order
      status: "pending" | "in_progress" | "completed" | "failed",
      metadata: { /* anything you want handed back to you in pollStatus */ },
      result: { /* optional partial result */ },
    };
  },

  async pollStatus({ providerOrderId, metadata }) {
    // Call the external service's "get order status" endpoint here.
    // `metadata` is exactly what you returned from submitOrder (or the
    // last pollStatus/webhook call) — this module never reads or
    // modifies it, so the provider can stash whatever it needs there
    // (an internal cursor, a computed ETA, auth details for that one
    // order, etc).
    return {
      status: "pending" | "in_progress" | "completed" | "failed",
      metadata: { /* updated, if it changed */ },
      result: { delivered: 10, /* ...anything else */ },
      error: "optional human-readable failure reason",
    };
  },

  // Optional. Only implement this if the provider can push updates
  // instead of (or in addition to) being polled.
  async verifyWebhook(payload, headers) {
    // 1. Authenticate the request yourself — HMAC signature, shared
    //    secret header, IP allowlist, whatever that provider uses.
    //    Return null (or throw) if it doesn't check out.
    // 2. Translate the payload into the same shape pollStatus returns,
    //    plus the providerOrderId so the route can look up the row:
    return { providerOrderId: "...", status: "completed", result: {...} };
  },
}
```

`result.delivered` is the one field the orchestration layer actually reads
(to bump the campaign's score when an order completes) — everything else
in `result`/`metadata` is opaque and just stored/displayed as-is.

## Reference template

`lib/orders/providers/exampleRealProvider.js` shows the exact shape a real
adapter would take — same method signatures, same spot to read an API key
from an env var, same spot to make the HTTP call — with the actual
`fetch()` calls commented out and replaced by a stub that refuses to run.
Copy it as a starting point; it isn't a working integration on its own.

## Adding a real provider

1. Create `lib/orders/providers/yourProvider.js` implementing the shape
   above. Put any HTTP calls, auth, and payload mapping in here — this is
   the only file that should know anything about that specific service.
2. Put its credentials in environment variables (`.env.local` locally,
   your host's env var settings in production) — **never commit a live
   key to the repo**. Read it with `process.env.YOUR_PROVIDER_API_KEY`
   inside the provider file.
3. Register it in `lib/orders/index.js`:
   ```js
   import { yourProvider } from "./providers/yourProvider";
   registerProvider(yourProvider);
   ```
4. Either pass `{ provider: "your-provider" }` in the request body to
   `POST /api/campaigns/[id]/orders`, or make it the default for every
   request by setting `DEFAULT_ORDER_PROVIDER=your-provider` in your
   environment (see `lib/orders/index.js`'s `defaultProviderName()`).
5. If it supports webhooks, point the provider's webhook config at:
   `POST /api/campaigns/orders/webhook?provider=your-provider`
   Nothing else to wire up — the route resolves your provider by that
   query param and calls `verifyWebhook()` on it.

## Where things are stored

- `campaign_orders` (Supabase table) — one row per order: `provider`,
  `provider_order_id`, `quantity`, `status`, `metadata`, `result`,
  `error`, and timestamps. `metadata`/`result` are JSONB and entirely
  provider-owned.
- A transition to `status: "completed"` appends one row to
  `campaign_snapshots` (`source: "provider"` for anything other than
  `simulated`) so it shows up on the existing score-over-time chart,
  visually distinct from a real Reddit check.

## Retries and errors

`lib/orders/retry.js`'s `withRetry()` wraps both `submitOrder` and
`pollStatus` calls with exponential backoff — a provider method that
throws is retried a few times before the caller gives up. A `submitOrder`
failure fails the whole request (and the credit charge auto-refunds via
`withCredits` in `lib/credits.js`). A `pollStatus` failure marks that one
order `status: "failed"` with the error message attached, rather than
retrying forever.
