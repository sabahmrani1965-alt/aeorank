// Public entry point for the order system. Registers the one provider
// shipped with this codebase (the simulated reference implementation) and
// re-exports the registry + orchestration functions. A real provider is
// added by creating a module implementing the OrderProvider shape (see
// provider.js) and calling registerProvider() with it — nothing under
// app/api/campaigns/**/orders or lib/orders/service.js needs to change.
import { registerProvider, getProvider, listProviders } from "./registry";
import { simulatedProvider } from "./providers/simulatedProvider";

registerProvider(simulatedProvider);

export { registerProvider, getProvider, listProviders };
export { submitOrder, pollOrder, applyOrderUpdate } from "./service";

// Which provider a request should use when none is specified — lets a
// real provider become the default via env config alone.
export function defaultProviderName() {
  return process.env.DEFAULT_ORDER_PROVIDER || "simulated";
}
