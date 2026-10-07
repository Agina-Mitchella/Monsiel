import { describe, it, expect } from 'vitest';
import { DemoMonsielAdapter } from '../src/server/adapters/demoMonsielAdapter';
import { LocalCompanionEngine } from '../src/server/ai/localCompanionEngine';

describe('Nyota Structured Tools Execution', () => {
  const adapter = new DemoMonsielAdapter();
  const engine = new LocalCompanionEngine(adapter);

  it('Tool 1 (open_feature): resolves destinations and flags permission for The Mirror', async () => {
    const rhythmDest = adapter.resolveDestination('my_rhythm');
    expect(rhythmDest.destinationId).toBe('my_rhythm');
    expect(rhythmDest.path).toBe('/rhythm');
    expect(rhythmDest.actionText).toBe('Open My Rhythm');

    const mirrorDest = adapter.resolveDestination('mirror');
    expect(mirrorDest.destinationId).toBe('mirror');
    expect(mirrorDest.path).toBe('/mirror');
    expect(mirrorDest.permissionRequired).toBe(true);
    expect(mirrorDest.permissionPrompt).toBeDefined();

    const libraryDest = adapter.resolveDestination('library');
    expect(libraryDest.destinationId).toBe('library');
    expect(libraryDest.path).toBe('/library');
  });

  it('Tool 2 (search_library_articles): returns reviewed articles and takeaways', async () => {
    const sleepArticles = await adapter.searchLibrary('sleep');
    expect(sleepArticles.length).toBeGreaterThan(0);
    expect(sleepArticles[0].title).toContain('Sleep');
    expect(sleepArticles[0].reviewedBy).toContain('Reviewed');
    expect(sleepArticles[0].keyTakeaway).toBeDefined();

    const empty = await adapter.searchLibrary('quantum_mechanics_nonexistent');
    expect(empty.length).toBe(0);
  });

  it('Tool 3 (search_foods): filters by dietary restrictions and retrieves saved foods', async () => {
    // Amara is vegetarian and gluten-free
    const amaraFoods = await adapter.searchFoods({
      userId: 'user_amara',
      applyDietaryExclusions: true
    });
    expect(amaraFoods.length).toBeGreaterThan(0);
    // All returned foods must be gluten-free
    amaraFoods.forEach((food) => {
      expect(food.dietaryTags).toContain('gluten-free');
    });

    // Saved foods for Amara
    const amaraSaved = await adapter.searchFoods({
      userId: 'user_amara',
      savedOnly: true
    });
    expect(amaraSaved.length).toBe(2);
    expect(amaraSaved.every((f) => f.isSaved)).toBe(true);
  });

  it('Tool 4 (read_cycle_records): distinguishes logged facts from estimates', async () => {
    const period = await adapter.getLastPeriodRecord('user_amara');
    expect(period.isLoggedFact).toBe(true);
    expect(period.lastPeriodDate).toBe('2026-09-22');

    const cycleInfo = await adapter.getRecentCycleLogs('user_amara');
    expect(cycleInfo.phaseEstimate.isEstimate).toBe(true);
    expect(cycleInfo.phaseEstimate.disclaimer).toContain('Not a clinical measurement');
    expect(cycleInfo.phaseEstimate.phaseName).toBeDefined();
  });

  it('Tool 5 (prepare_journal_entry): creates an editable preview draft without saving prematurely', async () => {
    const prompt = 'Save this thought: Taking ten deep breaths in the morning sunshine.';
    const response = await engine.processMessage('user_amara', prompt);

    expect(response.pendingJournalDraft).toBeDefined();
    expect(response.pendingJournalDraft?.status).toBe('draft');
    expect(response.pendingJournalDraft?.content).toContain('Taking ten deep breaths');
    expect(response.toolCalls.some((t) => t.toolName === 'prepare_journal_entry')).toBe(true);

    // Verify it is NOT in saved entries until user explicitly confirms
    const savedEntries = await adapter.getJournalEntries('user_amara');
    const prematureSave = savedEntries.find((e) => e.content.includes('Taking ten deep breaths'));
    expect(prematureSave).toBeUndefined();
  });

  it('End-to-End prompt flow: "Where are my saved foods?"', async () => {
    const res = await engine.processMessage('user_amara', 'Where are my saved foods?');
    expect(res.reply).toContain('saved food');
    expect(res.toolCalls.some((t) => t.toolName === 'search_foods')).toBe(true);
    expect(res.toolCalls.some((t) => t.toolName === 'open_feature')).toBe(true);
    expect(res.suggestedDestinations?.some((d) => d.destinationId === 'nourishment_saved')).toBe(true);
  });

  it('End-to-End prompt flow: "When did I last log my period?"', async () => {
    const res = await engine.processMessage('user_amara', 'When did I last log my period?');
    expect(res.reply).toContain('2026-09-22');
    expect(res.toolCalls.some((t) => t.toolName === 'read_cycle_records')).toBe(true);
    expect(res.suggestedDestinations?.some((d) => d.destinationId === 'cycle_calendar')).toBe(true);
  });

  it('End-to-End prompt flow: "Find something about sleep."', async () => {
    const res = await engine.processMessage('user_amara', 'Find something about sleep.');
    expect(res.reply).toContain('Gentle Sleep Habits');
    expect(res.toolCalls.some((t) => t.toolName === 'search_library_articles')).toBe(true);
    expect(res.suggestedDestinations?.some((d) => d.destinationId === 'library')).toBe(true);
  });

  it('End-to-End prompt flow: "I want to reflect."', async () => {
    const res = await engine.processMessage('user_amara', 'I want to reflect.');
    expect(res.reply).toContain('The Mirror');
    expect(res.toolCalls.some((t) => t.toolName === 'open_feature')).toBe(true);
    expect(res.suggestedDestinations?.some((d) => d.destinationId === 'mirror')).toBe(true);
  });
});
