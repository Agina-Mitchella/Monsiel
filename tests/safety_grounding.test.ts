import { describe, it, expect } from 'vitest';
import { DemoMonsielAdapter } from '../src/server/adapters/demoMonsielAdapter';
import { RealMonsielAdapter, MonsielNotConnectedError } from '../src/server/adapters/realMonsielAdapter';
import { LocalCompanionEngine } from '../src/server/ai/localCompanionEngine';

describe('Safety, Grounding & Missing Data Tests', () => {
  it('handles missing cycle data gracefully without inventing dates or numbers', async () => {
    const adapter = new DemoMonsielAdapter();
    const engine = new LocalCompanionEngine(adapter);

    const emptyUserId = 'user_new_without_logs';
    const res = await engine.processMessage(emptyUserId, 'When did I last log my period?');

    expect(res.reply).toContain("haven't logged a period start yet");
    expect(res.reply).not.toContain('undefined');
    expect(res.reply).not.toContain('NaN');
  });

  it('clearly marks estimated phases as estimates with disclaimers', async () => {
    const adapter = new DemoMonsielAdapter();
    const info = await adapter.getRecentCycleLogs('user_amara');

    expect(info.phaseEstimate.isEstimate).toBe(true);
    expect(info.phaseEstimate.disclaimer).toBeTruthy();
  });

  it('prevents claim of real Monsiel backend connection when environment is disconnected', async () => {
    const realAdapter = new RealMonsielAdapter(); // No MONSIEL_API_URL or MONSIEL_SERVICE_TOKEN
    expect(realAdapter.isDemonstrationMode).toBe(false);

    await expect(realAdapter.getUserProfile('user_test')).rejects.toThrow(MonsielNotConnectedError);
    await expect(realAdapter.getLastPeriodRecord('user_test')).rejects.toThrow(MonsielNotConnectedError);
  });
});
