import { it, expect, vi, describe } from 'vitest';
import { GET as getFusion } from '../src/app/api/fusion/route';
import { GET as getCron } from '../src/app/api/cron/fusion/route';
import { GET as getGrid } from '../src/app/api/tactical-grid/route';
import { kv } from '@vercel/kv';

vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

// Mock NextRequest
const mockRequest = (url: string, headers: Record<string, string> = {}) => {
  return {
    url,
    headers: {
      get: (key: string) => headers[key] || null,
    },
  } as any;
};

describe('API Routes Integration', () => {
  describe('GET /api/fusion', () => {
    it('returns data from KV', async () => {
      (kv.get as any).mockResolvedValue({ status: 'FUSION_OK' });
      const req = mockRequest('http://api/fusion');
      const res = await getFusion(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe('FUSION_OK');
    });
  });

  describe('GET /api/tactical-grid', () => {
    it('returns 200 and data from KV cache', async () => {
      (kv.get as any).mockResolvedValue({ status: 'GRID_OK' });
      const res = await getGrid();
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe('GRID_OK');
    });

    it('returns 503 if data is pending', async () => {
      (kv.get as any).mockResolvedValue(null);
      const res = await getGrid();
      expect(res.status).toBe(503);
    });
  });

  describe('GET /api/cron/fusion', () => {
    it('returns 401 if CRON_SECRET is missing', async () => {
      const req = mockRequest('http://api/cron/fusion');
      const res = await getCron(req);
      expect(res.status).toBe(401);
    });
  });
});
