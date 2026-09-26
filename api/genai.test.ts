// @vitest-environment node
import { describe, it, expect, afterEach, vi } from 'vitest';
import { POST, config } from './genai.js';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Vercel Function /api/genai', () => {
  it('allows enough time for long Gemini analyses', () => {
    expect(config.maxDuration).toBeGreaterThanOrEqual(30);
  });

  it('delegates to the gateway using server environment variables', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const response = await POST(new Request('http://localhost/api/genai', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ task: 'qa', question: 'Is the deposit refundable?', clauses: [{ clauseNumber: '1', title: 'Deposit', text: 'Deposit is refundable.' }] }),
    }));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'AI service is not configured.' });
  });
});
