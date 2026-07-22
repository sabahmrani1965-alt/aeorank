// The contract every order provider must implement — this file is pure
// documentation (JSDoc typedefs), there's no TypeScript in this codebase,
// but the shapes below are what lib/orders/service.js and every
// app/api/campaigns/**/orders route actually rely on. A new provider only
// ever needs to satisfy this shape; nothing else in the app changes.

/**
 * @typedef {'pending'|'in_progress'|'completed'|'failed'} OrderStatus
 */

/**
 * @typedef {Object} ProviderSubmitResult
 * @property {string} providerOrderId - the provider's own id for this order
 * @property {OrderStatus} status
 * @property {Object} [metadata] - opaque, owned entirely by the provider;
 *   stored as-is and passed back verbatim into pollStatus()/webhook
 *   handling. Application code never reads or interprets it.
 * @property {Object} [result] - opaque partial/preliminary result, if any
 */

/**
 * @typedef {Object} ProviderStatusResult
 * @property {OrderStatus} status
 * @property {Object} [metadata] - replaces the stored metadata if present
 * @property {Object} [result] - opaque result payload; when status is
 *   'completed', `result.delivered` (a number) is read by
 *   lib/orders/service.js to bump the campaign's score — everything else
 *   in `result` is left untouched and just stored/displayed.
 * @property {string} [error]
 */

/**
 * @typedef {Object} OrderProvider
 * @property {string} name - unique registry key (see registry.js)
 * @property {(input: {campaignId: string, targetUrl: string, quantity: number}) => Promise<ProviderSubmitResult>} submitOrder
 * @property {(input: {providerOrderId: string, metadata?: Object}) => Promise<ProviderStatusResult>} pollStatus
 * @property {(payload: any, headers: Record<string,string>) => Promise<(ProviderStatusResult & {providerOrderId: string}) | null>} [verifyWebhook] -
 *   optional. Must authenticate the request itself (signature/shared
 *   secret/etc — see the shipped simulated provider for why it omits
 *   this) and return null for anything that doesn't verify.
 */

// Validates an implementation has the required shape before it's ever
// registered — fails fast at startup with a clear message instead of a
// confusing runtime error the first time an order is submitted.
export function assertValidProvider(provider) {
  if (!provider || typeof provider.name !== "string" || !provider.name) {
    throw new Error("An order provider must have a non-empty string `name`.");
  }
  if (typeof provider.submitOrder !== "function") {
    throw new Error(`Order provider "${provider.name}" is missing submitOrder().`);
  }
  if (typeof provider.pollStatus !== "function") {
    throw new Error(`Order provider "${provider.name}" is missing pollStatus().`);
  }
  if (provider.verifyWebhook != null && typeof provider.verifyWebhook !== "function") {
    throw new Error(`Order provider "${provider.name}"'s verifyWebhook must be a function.`);
  }
}
