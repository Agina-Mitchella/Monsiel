import { describe, it, expect } from 'vitest';
import { DemoMonsielAdapter } from '../src/server/adapters/demoMonsielAdapter';

describe('User Access Isolation', () => {
  it('strictly isolates cycle records between different authenticated users', async () => {
    const adapter = new DemoMonsielAdapter();

    const amaraPeriod = await adapter.getLastPeriodRecord('user_amara');
    const elenaPeriod = await adapter.getLastPeriodRecord('user_elena');
    const emptyUserPeriod = await adapter.getLastPeriodRecord('user_stranger');

    // Amara's period was logged on 2026-09-22
    expect(amaraPeriod.lastPeriodDate).toBe('2026-09-22');
    expect(amaraPeriod.isLoggedFact).toBe(true);

    // Elena's period was logged on 2026-10-02
    expect(elenaPeriod.lastPeriodDate).toBe('2026-10-02');
    expect(elenaPeriod.isLoggedFact).toBe(true);

    // Stranger has no records
    expect(emptyUserPeriod.lastPeriodDate).toBeNull();
    expect(emptyUserPeriod.daysAgo).toBeNull();
  });

  it('strictly isolates saved foods between users and respects their dietary exclusions', async () => {
    const adapter = new DemoMonsielAdapter();

    const amaraSaved = await adapter.searchFoods({ userId: 'user_amara', savedOnly: true });
    const elenaSaved = await adapter.searchFoods({ userId: 'user_elena', savedOnly: true });

    const amaraSavedNames = amaraSaved.map((f) => f.name);
    const elenaSavedNames = elenaSaved.map((f) => f.name);

    expect(amaraSavedNames).toContain('Pumpkin Seeds (Pepitas)');
    expect(amaraSavedNames).toContain('Chamomile & Fresh Ginger Infusion');
    expect(amaraSavedNames).not.toContain('Roasted Sweet Potato Wedges');

    expect(elenaSavedNames).toContain('Roasted Sweet Potato Wedges');
    expect(elenaSavedNames).not.toContain('Pumpkin Seeds (Pepitas)');
  });

  it('strictly isolates journal entries between users', async () => {
    const adapter = new DemoMonsielAdapter();

    const amaraJournals = await adapter.getJournalEntries('user_amara');
    const elenaJournals = await adapter.getJournalEntries('user_elena');

    expect(amaraJournals.some((j) => j.title === 'Noticing morning stillness')).toBe(true);
    expect(amaraJournals.some((j) => j.title === 'Resting without guilt')).toBe(false);

    expect(elenaJournals.some((j) => j.title === 'Resting without guilt')).toBe(true);
    expect(elenaJournals.some((j) => j.title === 'Noticing morning stillness')).toBe(false);
  });
});
