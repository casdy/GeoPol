import { it, expect, vi, describe } from 'vitest';
import { sanitizeLLMOutput } from '../src/lib/sanitizer';
import { kv } from '@vercel/kv';

vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(),
  },
}));

describe('Sanitizer Engine', () => {
  it('parses clean JSON', async () => {
    const raw = '{"status": "OK"}';
    const result = await sanitizeLLMOutput(raw);
    expect(result.status).toBe('OK');
  });

  it('repairs JSON wrapped in backticks', async () => {
    const raw = 'Here is the data: ```json\n{"status": "REPAIRED"}\n```';
    const result = await sanitizeLLMOutput(raw);
    expect(result.status).toBe('REPAIRED');
  });

  it('repairs JSON with leading/trailing text', async () => {
    const raw = 'Note: findings follow. {"status": "BRUTE_FORCE"} end of transmission.';
    const result = await sanitizeLLMOutput(raw);
    expect(result.status).toBe('BRUTE_FORCE');
  });

  it('falls back to KV on total failure', async () => {
    const raw = 'This is complete gibberish without any curly braces.';
    (kv.get as any).mockResolvedValue({ status: 'BACKUP' });
    const result = await sanitizeLLMOutput(raw);
    expect(result.status).toBe('BACKUP');
  });
});
