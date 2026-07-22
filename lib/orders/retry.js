// Generic exponential-backoff retry — used for both submitting and
// polling an order, since either can hit a transient provider-side
// failure (network blip, momentary rate limit) that a second attempt
// would clear. Not provider-specific: any OrderProvider method can be
// wrapped with this.
export async function withRetry(fn, { retries = 3, baseDelayMs = 300 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt));
    }
  }
  throw lastError;
}
