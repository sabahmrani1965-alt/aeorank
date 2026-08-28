// Simple bounded-concurrency runner, no extra dependency for what's a
// ~10-line pattern. Used by the cron routes to process many brands or
// prompts per invocation without running everything sequentially (too
// slow for Vercel's function timeout) or all at once (provider rate
// limits).
export async function runWithConcurrency(items, limit, worker) {
  let next = 0;
  async function runner() {
    while (next < items.length) {
      const i = next++;
      await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runner));
}
