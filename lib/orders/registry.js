// Dependency-injection point for order providers. Nothing in
// lib/orders/service.js or the app/api/campaigns/**/orders routes ever
// imports a concrete provider directly — they resolve one by name
// through getProvider(), so a real provider can be dropped in (register
// it here, or from any module loaded before first use) without touching
// orchestration, routes, or the DB layer at all.
import { assertValidProvider } from "./provider";

const providers = new Map();

export function registerProvider(provider) {
  assertValidProvider(provider);
  providers.set(provider.name, provider);
}

export function getProvider(name) {
  const provider = providers.get(name);
  if (!provider) {
    throw new Error(
      `Unknown order provider "${name}". Register it with registerProvider() before use — see lib/orders/index.js.`
    );
  }
  return provider;
}

export function listProviders() {
  return Array.from(providers.keys());
}
