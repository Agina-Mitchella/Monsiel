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

export interface MonsielAdapter {
  readonly isDemonstrationMode: boolean;
  readonly modeLabel: string;

  getUserProfile(userId: string): Promise<UserProfile | null>;
  
  resolveDestination(destinationId: FeatureDestinationId, params?: Record<string, any>): AppDestinationResult;
  
  searchLibrary(query: string, tag?: string): Promise<LibraryArticle[]>;
  
  searchFoods(options: {
    userId: string;
    query?: string;
    applyDietaryExclusions?: boolean;
    savedOnly?: boolean;
  }): Promise<FoodItem[]>;
  
  getLastPeriodRecord(userId: string): Promise<{
    lastPeriodDate: string | null;
    daysAgo: number | null;
    isLoggedFact: boolean;
    details?: CycleLogRecord;
  }>;
  
  getRecentCycleLogs(userId: string, limit?: number): Promise<{
    logs: CycleLogRecord[];
    phaseEstimate: PhaseEstimate;
  }>;
  
  getCheckIns(userId: string, limit?: number): Promise<CheckInRecord[]>;
  
  saveJournalEntry(
    userId: string,
    entry: {
      id?: string;
      title: string;
      content: string;
      idempotencyKey?: string;
    }
  ): Promise<{ entry: JournalDraft; alreadySaved: boolean }>;
  
  getJournalEntries(userId: string): Promise<JournalDraft[]>;
}
