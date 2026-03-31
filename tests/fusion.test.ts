import { describe, it, expect } from 'vitest';
import { GET } from '../src/app/api/tactical-grid/route';
import fs from 'fs';
import path from 'path';

// Manual .env.local loader for test
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

describe('Tactical Fusion API', () => {
  it('should return a valid unified JSON payload', { timeout: 30000 }, async () => {
    const apiKey = process.env.Open_Router || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ No API key found, skipping real API call or expecting failure.');
    }

    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).not.toHaveProperty('error');
    
    const requiredKeys = ['insights', 'forecasts', 'instability', 'globalRiskScore', 'intelFeed'];
    requiredKeys.forEach(key => {
      expect(data).toHaveProperty(key);
    });
  });
});
