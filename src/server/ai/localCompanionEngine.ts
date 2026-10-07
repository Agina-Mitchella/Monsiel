import { MonsielAdapter } from '../adapters/monsielAdapter';
import {
  ChatMessage,
  ToolCallExecutionResult,
  JournalDraft,
  AppDestinationResult,
  FeatureDestinationId
} from '../types';

export interface LocalEngineResponse {
  reply: string;
  toolCalls: ToolCallExecutionResult[];
  pendingJournalDraft?: JournalDraft;
  suggestedDestinations?: AppDestinationResult[];
}

export class LocalCompanionEngine {
  constructor(private adapter: MonsielAdapter) {}

  async processMessage(userId: string, userMessage: string): Promise<LocalEngineResponse> {
    const raw = userMessage.trim();
    const lower = raw.toLowerCase();

    const toolCalls: ToolCallExecutionResult[] = [];
    const suggestedDestinations: AppDestinationResult[] = [];
    let pendingJournalDraft: JournalDraft | undefined;
    let reply = '';

    // 1. Saved Foods / Nourishment queries
    if (lower.includes('saved food') || lower.includes('my saved') || lower.includes('foods i saved')) {
      const foods = await this.adapter.searchFoods({ userId, savedOnly: true });
      const dest = this.adapter.resolveDestination('nourishment_saved');
      
      toolCalls.push({
        toolName: 'search_foods',
        parameters: { savedOnly: true },
        result: { count: foods.length, foods: foods.map(f => f.name) },
        status: 'success'
      });
      toolCalls.push({
        toolName: 'open_feature',
        parameters: { featureId: 'nourishment_saved' },
        result: dest,
        status: 'success'
      });
      suggestedDestinations.push(dest);

      if (foods.length === 0) {
        reply = "You don't have any saved foods yet. You can browse the Nourishment catalogue to save ideas that feel good for you.";
      } else {
        const names = foods.map(f => f.name).join(', ');
        reply = `You have ${foods.length} saved food idea${foods.length > 1 ? 's' : ''}: ${names}. I’ve opened your saved view below.`;
      }
      return { reply, toolCalls, suggestedDestinations };
    }

    // General Food / Nourishment
    if (lower.includes('food') || lower.includes('nourish') || lower.includes('what should i eat') || lower.includes('recipe')) {
      const foods = await this.adapter.searchFoods({ userId, applyDietaryExclusions: true });
      const dest = this.adapter.resolveDestination('nourishment');
      
      toolCalls.push({
        toolName: 'search_foods',
        parameters: { respectDietary: true },
        result: { count: foods.length, foods },
        status: 'success'
      });
      suggestedDestinations.push(dest);

      const ideas = foods.slice(0, 2).map(f => `${f.name} (${f.servingIdea})`).join('; ');
      reply = `Here are everyday food ideas tailored to your preferences: ${ideas}. Explore more in Nourishment below.`;
      return { reply, toolCalls, suggestedDestinations };
    }

    // 2. Last period / cycle records
    if (
      lower.includes('last log') ||
      lower.includes('last period') ||
      lower.includes('when was my period') ||
      lower.includes('log my period') ||
      lower.includes('when did i bleed')
    ) {
      const periodRecord = await this.adapter.getLastPeriodRecord(userId);
      const dest = this.adapter.resolveDestination('cycle_calendar');

      toolCalls.push({
        toolName: 'read_cycle_records',
        parameters: { recordType: 'last_period' },
        result: periodRecord,
        status: 'success'
      });
      toolCalls.push({
        toolName: 'open_feature',
        parameters: { featureId: 'cycle_calendar' },
        result: dest,
        status: 'success'
      });
      suggestedDestinations.push(dest);

      if (periodRecord.lastPeriodDate) {
        reply = `Your last logged period start was on ${periodRecord.lastPeriodDate} (${periodRecord.daysAgo} days ago). You can view or update your cycle details in the calendar.`;
      } else {
        reply = "You haven't logged a period start yet. You can log your first entry directly in the Cycle & Body calendar below.";
      }
      return { reply, toolCalls, suggestedDestinations };
    }

    // General cycle / phase check
    if (lower.includes('cycle') || lower.includes('phase') || lower.includes('symptom')) {
      const { logs, phaseEstimate } = await this.adapter.getRecentCycleLogs(userId);
      const dest = this.adapter.resolveDestination('cycle_calendar');

      toolCalls.push({
        toolName: 'read_cycle_records',
        parameters: { recordType: 'recent_logs' },
        result: { recentLogCount: logs.length, phaseEstimate },
        status: 'success'
      });
      suggestedDestinations.push(dest);

      reply = `Based on your cycle history, your estimated phase is ${phaseEstimate.phaseName} (Day ~${phaseEstimate.estimatedDayOfCycle}). Remember this is an estimate, not a medical measurement.`;
      return { reply, toolCalls, suggestedDestinations };
    }

    // 3. Library articles (sleep, iron, rest, movement, etc.)
    if (
      lower.includes('sleep') ||
      lower.includes('article') ||
      lower.includes('library') ||
      lower.includes('iron') ||
      lower.includes('movement') ||
      lower.includes('rest') ||
      lower.includes('read')
    ) {
      let queryTerm = 'sleep';
      if (lower.includes('iron')) queryTerm = 'iron';
      else if (lower.includes('movement') || lower.includes('exercise')) queryTerm = 'movement';
      else if (lower.includes('reflection')) queryTerm = 'reflection';
      else if (lower.includes('sleep')) queryTerm = 'sleep';
      else queryTerm = '';

      const articles = await this.adapter.searchLibrary(queryTerm);
      const dest = this.adapter.resolveDestination('library');

      toolCalls.push({
        toolName: 'search_library_articles',
        parameters: { query: queryTerm },
        result: { found: articles.length, articles },
        status: 'success'
      });
      suggestedDestinations.push(dest);

      if (articles.length > 0) {
        const top = articles[0];
        reply = `I found "${top.title}". ${top.keyTakeaway} You can read the full article in the Library.`;
      } else {
        reply = `I didn't find specific articles matching "${queryTerm}", but you can search our full collection in the Library.`;
      }
      return { reply, toolCalls, suggestedDestinations };
    }

    // 4. Reflection / The Mirror
    if (lower.includes('reflect') || lower.includes('mirror') || lower.includes('guided reflection')) {
      const dest = this.adapter.resolveDestination('mirror');
      
      toolCalls.push({
        toolName: 'open_feature',
        parameters: { featureId: 'mirror' },
        result: dest,
        status: 'success'
      });
      suggestedDestinations.push(dest);

      reply = "The Mirror is Monsiel’s dedicated space for guided reflection. Would you like to step inside?";
      return { reply, toolCalls, suggestedDestinations };
    }

    // 5. Journal saving / drafts
    if (
      lower.startsWith('save this') ||
      lower.startsWith('save my thought') ||
      lower.includes('save to journal') ||
      lower.includes('save this thought') ||
      lower.includes('journal this')
    ) {
      // Extract text after trigger
      let draftText = raw
        .replace(/^(save this thought|save this|save my thought|save to journal|journal this)[:\s-]*/i, '')
        .trim();

      if (!draftText) {
        draftText = 'A moment of gentle pause and reflection.';
      }

      const draft: JournalDraft = {
        id: `draft_${Date.now()}`,
        userId,
        title: 'Reflection',
        content: draftText,
        createdAt: new Date().toISOString(),
        status: 'draft'
      };

      toolCalls.push({
        toolName: 'prepare_journal_entry',
        parameters: { title: 'Reflection', draftText },
        result: draft,
        status: 'success'
      });

      pendingJournalDraft = draft;
      reply = "I’ve prepared an editable draft of your thought below. Review or edit it, and press 'Save Entry' when you’re ready.";
      return { reply, toolCalls, pendingJournalDraft, suggestedDestinations };
    }

    // Journal browsing
    if (lower.includes('journal') || lower.includes('my thoughts') || lower.includes('my entries')) {
      const dest = this.adapter.resolveDestination('journal');
      toolCalls.push({
        toolName: 'open_feature',
        parameters: { featureId: 'journal' },
        result: dest,
        status: 'success'
      });
      suggestedDestinations.push(dest);
      reply = "You can revisit and edit all your private personal reflections in My Journal.";
      return { reply, toolCalls, suggestedDestinations };
    }

    // 6. Check-in / My Rhythm
    if (lower.includes('check in') || lower.includes('check-in') || lower.includes('rhythm')) {
      const dest = this.adapter.resolveDestination('my_rhythm');
      toolCalls.push({
        toolName: 'open_feature',
        parameters: { featureId: 'my_rhythm' },
        result: dest,
        status: 'success'
      });
      suggestedDestinations.push(dest);
      reply = "I’ve opened My Rhythm so you can complete your daily check-in.";
      return { reply, toolCalls, suggestedDestinations };
    }

    // 7. Breathing practices
    if (lower.includes('breath') || lower.includes('breathe') || lower.includes('calm') || lower.includes('anxious')) {
      const dest = this.adapter.resolveDestination('breathing');
      toolCalls.push({
        toolName: 'open_feature',
        parameters: { featureId: 'breathing' },
        result: dest,
        status: 'success'
      });
      suggestedDestinations.push(dest);
      reply = "Taking a gentle pause can help. I’ve opened our short guided breathing exercises below.";
      return { reply, toolCalls, suggestedDestinations };
    }

    // 8. Moon Reflection
    if (lower.includes('moon')) {
      const dest = this.adapter.resolveDestination('moon_reflection');
      toolCalls.push({
        toolName: 'open_feature',
        parameters: { featureId: 'moon_reflection' },
        result: dest,
        status: 'success'
      });
      suggestedDestinations.push(dest);
      reply = "I’ve opened Moon Reflection. This is an optional symbolic space, kept separate from your biological cycle tracking.";
      return { reply, toolCalls, suggestedDestinations };
    }

    // Default warm, concise reply
    reply = "I’m here to help you navigate Monsiel. Would you like to check in, browse nourishment ideas, or explore your journal?";
    return { reply, toolCalls, suggestedDestinations };
  }
}
