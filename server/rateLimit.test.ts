// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { checkRateLimit, hashClientKey, isRateLimited, redisConfig, RATE_MAX } from './rateLimit';

const redisEnv = { UPSTASH_REDIS_REST_URL: 'https://example.upstash.io/', UPSTASH_REDIS_REST_TOKEN: 'secret-token' };

/** Fake Upstash pipeline endpoint that keeps real counters in a Map. */
function fakeRedis() {
  const store = new Map<string, number>();
  const fetchImpl = vi.fn<typeof fetch>(async (_url, init) => {
    const commands = JSON.parse(String(init?.body)) as string[][];
    const [, key] = commands[0];
    const count = (store.get(key) ?? 0) + 1;
    store.set(key, count);
    return new Response(JSON.stringify([{ result: count }, { result: 1 }]), { status: 200 });
  });
  return { store, fetchImpl };
}

describe('In-memory rate limiter (per-instance fallback)', () => {
  it('rate-limits a single client after the per-minute budget and resets next window', () => {
    const key = 'rate-test-client';
    const results = Array.from({ length: RATE_MAX + 1 }, () => isRateLimited(key, 1_000));
    expect(results.slice(0, RATE_MAX).every((limited) => !limited)).toBe(true);
    expect(results[RATE_MAX]).toBe(true);
    expect(isRateLimited(key, 1_000 + 61_000)).toBe(false);
  });
});

describe('Distributed rate limiter (Upstash Redis REST)', () => {
  it('reads both Upstash and Vercel Marketplace variable names', () => {
    expect(redisConfig(redisEnv)).toEqual({ url: 'https://example.upstash.io', token: 'secret-token' });
    expect(redisConfig({ KV_REST_API_URL: 'https://kv.example', KV_REST_API_TOKEN: 't' })).toEqual({ url: 'https://kv.example', token: 't' });
    expect(redisConfig({ UPSTASH_REDIS_REST_URL: 'https://only-url.example' })).toBeNull();
  });

  it('enforces one global budget shared by every instance through Redis', async () => {
    const { fetchImpl } = fakeRedis();
    const now = 5 * 60_000;
    for (let i = 0; i < RATE_MAX; i++) {
      expect(await checkRateLimit('198.51.100.7', redisEnv, fetchImpl, now)).toEqual({ limited: false, backend: 'redis' });
    }
    expect(await checkRateLimit('198.51.100.7', redisEnv, fetchImpl, now)).toEqual({ limited: true, backend: 'redis' });
    // A new window starts a fresh counter.
    expect((await checkRateLimit('198.51.100.7', redisEnv, fetchImpl, now + 60_000)).limited).toBe(false);
  });

  it('sends an authenticated pipeline and never stores the raw IP address', async () => {
    const { fetchImpl } = fakeRedis();
    await checkRateLimit('198.51.100.8', redisEnv, fetchImpl, 0);
    const [url, init = {}] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://example.upstash.io/pipeline');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer secret-token');
    const body = String(init.body);
    expect(body).not.toContain('198.51.100.8');
    expect(body).toContain(await hashClientKey('198.51.100.8'));
    expect(body).toContain('PEXPIRE');
  });

  it('falls back to the per-instance limiter when Redis is unavailable', async () => {
    const failing = vi.fn<typeof fetch>(async () => new Response('down', { status: 503 }));
    expect(await checkRateLimit('198.51.100.9', redisEnv, failing, 0)).toEqual({ limited: false, backend: 'memory' });
    const throwing = vi.fn<typeof fetch>(async () => { throw new TypeError('network'); });
    expect((await checkRateLimit('198.51.100.9', redisEnv, throwing, 0)).backend).toBe('memory');
  });

  it('uses the in-memory limiter when Redis is not configured', async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    expect(await checkRateLimit('198.51.100.10', {}, fetchImpl, 0)).toEqual({ limited: false, backend: 'memory' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('hashes client keys deterministically to fixed-length hex', async () => {
    const a = await hashClientKey('203.0.113.5');
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(await hashClientKey('203.0.113.5')).toBe(a);
    expect(await hashClientKey('203.0.113.6')).not.toBe(a);
  });
});
