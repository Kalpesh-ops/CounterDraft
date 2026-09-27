/**
 * Rate limiting for the GenAI gateway.
 *
 * Serverless instances do not share memory, so a limiter held in a local Map only
 * limits each instance separately. When an Upstash Redis REST endpoint is configured
 * (for example through the Vercel Marketplace), counters live in Redis and the limit is
 * enforced globally across every instance. Without Redis, or if Redis is unreachable,
 * the in-memory limiter still protects each instance, so abuse protection never
 * disappears entirely.
 */

export const RATE_WINDOW_MS = 60_000;
export const RATE_MAX = 20;
const RATE_MAX_TRACKED = 5_000;
const REDIS_TIMEOUT_MS = 1_000;

export interface RateLimitEnv {
  /** Upstash Redis REST endpoint and token (names used by the Upstash console). */
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  /** Same values under the names the Vercel Marketplace integration injects. */
  KV_REST_API_URL?: string;
  KV_REST_API_TOKEN?: string;
}

export interface RateLimitResult {
  limited: boolean;
  /** Which store made the decision; useful in tests and logs, never sent to clients. */
  backend: 'redis' | 'memory';
}

// ---------------------------------------------------------------------------
// In-memory fallback (per instance)
// ---------------------------------------------------------------------------

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

/** Drops expired buckets so memory stays bounded without resetting active clients' limits. */
function pruneRateBuckets(now: number): void {
  for (const [key, bucket] of rateBuckets) {
    if (bucket.resetAt <= now) rateBuckets.delete(key);
  }
}

/** Fixed-window limiter held in this instance's memory. */
export function isRateLimited(key: string, now = Date.now()): boolean {
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (rateBuckets.size >= RATE_MAX_TRACKED) pruneRateBuckets(now);
    if (rateBuckets.size >= RATE_MAX_TRACKED) return true; // Fail closed under a flood of distinct clients.
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_MAX;
}

// ---------------------------------------------------------------------------
// Distributed limiter (Upstash Redis REST, no SDK)
// ---------------------------------------------------------------------------

/** Returns the Redis REST endpoint and token if both are configured. */
export function redisConfig(env: RateLimitEnv): { url: string; token: string } | null {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ''), token };
}

/** SHA-256 of the client identifier, so raw IP addresses are never written to Redis. */
export async function hashClientKey(key: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return Array.from(new Uint8Array(digest).slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Increments this client's counter for the current window in one pipelined round trip.
 * The window index is part of the key, so INCR alone is atomic and race-free; PEXPIRE
 * only garbage-collects old windows.
 */
async function incrementInRedis(
  config: { url: string; token: string },
  key: string,
  now: number,
  fetchImpl: typeof fetch
): Promise<number> {
  const windowIndex = Math.floor(now / RATE_WINDOW_MS);
  const redisKey = `counterdraft:genai:rl:${await hashClientKey(key)}:${windowIndex}`;
  const response = await fetchImpl(`${config.url}/pipeline`, {
    method: 'POST',
    headers: { authorization: `Bearer ${config.token}`, 'content-type': 'application/json' },
    body: JSON.stringify([
      ['INCR', redisKey],
      ['PEXPIRE', redisKey, String(RATE_WINDOW_MS * 2)],
    ]),
    signal: AbortSignal.timeout(REDIS_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Redis responded ${response.status}`);

  const data: unknown = await response.json();
  const first = Array.isArray(data) ? data[0] : undefined;
  const count = typeof first === 'object' && first !== null && 'result' in first ? Number(first.result) : NaN;
  if (!Number.isFinite(count)) throw new Error('Unexpected Redis response');
  return count;
}

/**
 * Global limit when Redis is configured and reachable; otherwise the per-instance limit.
 * A Redis outage degrades to local limiting instead of failing open or blocking everyone.
 */
export async function checkRateLimit(
  key: string,
  env: RateLimitEnv,
  fetchImpl: typeof fetch = fetch,
  now = Date.now()
): Promise<RateLimitResult> {
  const config = redisConfig(env);
  if (config) {
    try {
      const count = await incrementInRedis(config, key, now, fetchImpl);
      return { limited: count > RATE_MAX, backend: 'redis' };
    } catch {
      // Fall through to the in-memory limiter.
    }
  }
  return { limited: isRateLimited(key, now), backend: 'memory' };
}
