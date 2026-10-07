import { MonsielAdapter } from './monsielAdapter';
import {
  FeatureDestinationId,
  UserProfile,
  LibraryArticle,
  FoodItem,
  CycleLogRecord,
  CheckInRecord,
  PhaseEstimate,
  JournalDraft,
  AppDestinationResult
} from '../types';

export class MonsielNotConnectedError extends Error {
  constructor(action: string) {
    super(
      `[Monsiel Integration] Cannot execute "${action}": Real Monsiel repository and backend services are not linked to this workspace. Please provide the Monsiel project repository or configure MONSIEL_API_URL and MONSIEL_SERVICE_TOKEN in .env.`
    );
    this.name = 'MonsielNotConnectedError';
  }
}

/**
 * RealMonsielAdapter
 * 
 * Production adapter designed to connect directly to Monsiel's real services
 * (REST / GraphQL / Microservices / Database) once the codebase or service
 * endpoints are mounted.
 */
export class RealMonsielAdapter implements MonsielAdapter {
  readonly isDemonstrationMode = false;
  readonly modeLabel = 'Connected Monsiel Service Adapter';

  private apiUrl: string;
  private serviceToken: string;

  constructor(apiUrl?: string, serviceToken?: string) {
    this.apiUrl = apiUrl || process.env.MONSIEL_API_URL || '';
    this.serviceToken = serviceToken || process.env.MONSIEL_SERVICE_TOKEN || '';
  }

  private ensureConnected(operation: string) {
    if (!this.apiUrl || !this.serviceToken) {
      throw new MonsielNotConnectedError(operation);
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    this.ensureConnected('getUserProfile');
    const res = await fetch(`${this.apiUrl}/api/v1/users/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${this.serviceToken}` }
    });
    if (!res.ok) return null;
    return (await res.json()) as UserProfile;
  }

  resolveDestination(destinationId: FeatureDestinationId, params?: Record<string, any>): AppDestinationResult {
    // Destination routing metadata
    const paths: Record<FeatureDestinationId, { label: string; path: string; explanation: string; actionText: string; permissionRequired?: boolean }> = {
      my_rhythm: { label: 'My Rhythm', path: '/rhythm', explanation: 'Daily rhythm and check-in.', actionText: 'Open My Rhythm' },
      cycle_calendar: { label: 'Cycle & Body', path: '/cycle', explanation: 'Period logging, calendar, and symptoms.', actionText: 'View Calendar' },
      nourishment: { label: 'Nourishment', path: '/nourishment', explanation: 'Food catalogue and serving ideas.', actionText: 'Explore Foods' },
      nourishment_saved: { label: 'Saved Foods', path: '/nourishment/saved', explanation: 'Your saved foods.', actionText: 'View Saved Foods' },
      activity_ideas: { label: 'Activity Ideas', path: '/activities', explanation: 'Movement and rest ideas by phase.', actionText: 'View Ideas' },
      journal: { label: 'My Journal', path: '/journal', explanation: 'Personal journal entries.', actionText: 'Open Journal' },
      mirror: {
        label: 'The Mirror',
        path: '/mirror',
        explanation: 'Guided reflection experience.',
        actionText: 'Open The Mirror',
        permissionRequired: true
      },
      library: { label: 'Library', path: '/library', explanation: 'Published wellbeing articles.', actionText: 'Explore Library' },
      breathing: { label: 'Breathing Practices', path: '/breathing', explanation: 'Short guided exercises.', actionText: 'Start Breathing' },
      moon_reflection: { label: 'Moon Reflection', path: '/moon', explanation: 'Symbolic reflection space.', actionText: 'View Moon Reflection' }
    };

    const target = paths[destinationId] || paths.my_rhythm;
    return {
      destinationId,
      label: target.label,
      path: target.path,
      explanation: target.explanation,
      actionText: target.actionText,
      permissionRequired: target.permissionRequired,
      permissionPrompt: target.permissionRequired ? 'Permission required to enter The Mirror.' : undefined,
      params
    };
  }

  async searchLibrary(query: string, tag?: string): Promise<LibraryArticle[]> {
    this.ensureConnected('searchLibrary');
    const url = new URL(`${this.apiUrl}/api/v1/library/search`);
    url.searchParams.set('q', query);
    if (tag) url.searchParams.set('tag', tag);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${this.serviceToken}` }
    });
    if (!res.ok) throw new Error(`Failed to search library: ${res.statusText}`);
    return (await res.json()) as LibraryArticle[];
  }

  async searchFoods(options: {
    userId: string;
    query?: string;
    applyDietaryExclusions?: boolean;
    savedOnly?: boolean;
  }): Promise<FoodItem[]> {
    this.ensureConnected('searchFoods');
    const url = new URL(`${this.apiUrl}/api/v1/nourishment/foods`);
    if (options.query) url.searchParams.set('q', options.query);
    if (options.savedOnly) url.searchParams.set('savedOnly', 'true');
    if (options.applyDietaryExclusions) url.searchParams.set('respectDietary', 'true');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.serviceToken}`,
        'X-User-Id': options.userId
      }
    });
    if (!res.ok) throw new Error(`Failed to search foods: ${res.statusText}`);
    return (await res.json()) as FoodItem[];
  }

  async getLastPeriodRecord(userId: string): Promise<{
    lastPeriodDate: string | null;
    daysAgo: number | null;
    isLoggedFact: boolean;
    details?: CycleLogRecord;
  }> {
    this.ensureConnected('getLastPeriodRecord');
    const res = await fetch(`${this.apiUrl}/api/v1/cycle/last-period`, {
      headers: {
        Authorization: `Bearer ${this.serviceToken}`,
        'X-User-Id': userId
      }
    });
    if (!res.ok) throw new Error(`Failed to fetch last period record: ${res.statusText}`);
    return await res.json();
  }

  async getRecentCycleLogs(userId: string, limit = 5): Promise<{
    logs: CycleLogRecord[];
    phaseEstimate: PhaseEstimate;
  }> {
    this.ensureConnected('getRecentCycleLogs');
    const res = await fetch(`${this.apiUrl}/api/v1/cycle/logs?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${this.serviceToken}`,
        'X-User-Id': userId
      }
    });
    if (!res.ok) throw new Error(`Failed to fetch cycle logs: ${res.statusText}`);
    return await res.json();
  }

  async getCheckIns(userId: string, limit = 5): Promise<CheckInRecord[]> {
    this.ensureConnected('getCheckIns');
    const res = await fetch(`${this.apiUrl}/api/v1/rhythm/check-ins?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${this.serviceToken}`,
        'X-User-Id': userId
      }
    });
    if (!res.ok) throw new Error(`Failed to fetch check-ins: ${res.statusText}`);
    return await res.json();
  }

  async saveJournalEntry(
    userId: string,
    entry: {
      id?: string;
      title: string;
      content: string;
      idempotencyKey?: string;
    }
  ): Promise<{ entry: JournalDraft; alreadySaved: boolean }> {
    this.ensureConnected('saveJournalEntry');
    const res = await fetch(`${this.apiUrl}/api/v1/journal/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.serviceToken}`,
        'X-User-Id': userId,
        ...(entry.idempotencyKey ? { 'Idempotency-Key': entry.idempotencyKey } : {})
      },
      body: JSON.stringify(entry)
    });
    if (!res.ok) throw new Error(`Failed to save journal entry: ${res.statusText}`);
    return await res.json();
  }

  async getJournalEntries(userId: string): Promise<JournalDraft[]> {
    this.ensureConnected('getJournalEntries');
    const res = await fetch(`${this.apiUrl}/api/v1/journal/entries`, {
      headers: {
        Authorization: `Bearer ${this.serviceToken}`,
        'X-User-Id': userId
      }
    });
    if (!res.ok) throw new Error(`Failed to fetch journal entries: ${res.statusText}`);
    return await res.json();
  }
}
