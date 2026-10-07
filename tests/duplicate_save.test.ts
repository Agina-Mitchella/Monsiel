import { describe, it, expect } from 'vitest';
import { DemoMonsielAdapter } from '../src/server/adapters/demoMonsielAdapter';

describe('Journal Saving & Duplicate Prevention', () => {
  it('saves an entry when explicitly confirmed', async () => {
    const adapter = new DemoMonsielAdapter();
    const result = await adapter.saveJournalEntry('user_amara', {
      title: 'Evening Reflection',
      content: 'Felt calm watching the sun set over the garden.',
      idempotencyKey: 'key_evening_123'
    });

    expect(result.alreadySaved).toBe(false);
    expect(result.entry.title).toBe('Evening Reflection');
    expect(result.entry.status).toBe('saved');
    expect(result.entry.userId).toBe('user_amara');

    const allEntries = await adapter.getJournalEntries('user_amara');
    expect(allEntries.some((e) => e.title === 'Evening Reflection')).toBe(true);
  });

  it('prevents duplicate writes with identical idempotency key', async () => {
    const adapter = new DemoMonsielAdapter();
    const key = 'unique_idempotency_key_456';

    const firstSave = await adapter.saveJournalEntry('user_amara', {
      title: 'Gratitude list',
      content: 'Warm tea, quiet morning, cozy blanket.',
      idempotencyKey: key
    });
    expect(firstSave.alreadySaved).toBe(false);

    // Second attempt with exact same key (e.g. user double-clicked or re-submitted)
    const secondSave = await adapter.saveJournalEntry('user_amara', {
      title: 'Gratitude list',
      content: 'Warm tea, quiet morning, cozy blanket.',
      idempotencyKey: key
    });
    expect(secondSave.alreadySaved).toBe(true);
    expect(secondSave.entry.id).toBe(firstSave.entry.id);

    // Verify journal length did not increase twice
    const entries = await adapter.getJournalEntries('user_amara');
    const matched = entries.filter((e) => e.title === 'Gratitude list');
    expect(matched.length).toBe(1);
  });

  it('updates existing draft rather than duplicating when updating with same draft ID', async () => {
    const adapter = new DemoMonsielAdapter();
    const draftId = 'draft_shared_id_789';

    const first = await adapter.saveJournalEntry('user_amara', {
      id: draftId,
      title: 'Initial Draft Title',
      content: 'Draft content initial text'
    });
    expect(first.alreadySaved).toBe(false);

    const updated = await adapter.saveJournalEntry('user_amara', {
      id: draftId,
      title: 'Updated Final Title',
      content: 'Draft content polished text'
    });
    expect(updated.alreadySaved).toBe(true);
    expect(updated.entry.title).toBe('Updated Final Title');

    const entries = await adapter.getJournalEntries('user_amara');
    const matched = entries.filter((e) => e.id === draftId);
    expect(matched.length).toBe(1);
  });
});
