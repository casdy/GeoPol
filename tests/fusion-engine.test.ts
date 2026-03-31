import { it, expect, vi, describe } from 'vitest';
import { callOpenRouterFusion } from '../src/lib/fusion-engine';
import { generateText } from '../src/lib/ai-router';

vi.mock('../src/lib/ai-router', () => ({
  generateText: vi.fn(),
}));

describe('Fusion Engine', () => {
  it('calls the AI router with the correct prompt', async () => {
    (generateText as any).mockResolvedValue('{"status": "STABLE"}');
    const result = await callOpenRouterFusion({ news: [] });
    expect(generateText).toHaveBeenCalled();
    expect(result).toContain('STABLE');
  });

  it('propagates errors from the AI router', async () => {
    (generateText as any).mockRejectedValue(new Error('API Down'));
    await expect(callOpenRouterFusion({})).rejects.toThrow('API Down');
  });
});
