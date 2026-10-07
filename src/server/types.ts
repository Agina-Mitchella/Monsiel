export type FeatureDestinationId =
  | 'my_rhythm'
  | 'cycle_calendar'
  | 'nourishment'
  | 'nourishment_saved'
  | 'activity_ideas'
  | 'journal'
  | 'mirror'
  | 'library'
  | 'breathing'
  | 'moon_reflection';

export interface UserProfile {
  id: string;
  name: string;
  dietaryExclusions: string[];
  averageCycleLength: number;
}

export interface LibraryArticle {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  readingTimeMinutes: number;
  reviewedBy: string;
  keyTakeaway: string;
  fullUrl: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: 'seed' | 'vegetable' | 'fruit' | 'grain' | 'protein' | 'tea' | 'other';
  servingIdea: string;
  dietaryTags: string[]; // e.g. ['gluten-free', 'vegan', 'dairy-free']
  phaseNotes: string; // Information, never guaranteed benefits
  isSaved?: boolean;
}

export interface CycleLogRecord {
  id: string;
  userId: string;
  date: string; // ISO YYYY-MM-DD
  flow: 'light' | 'medium' | 'heavy' | 'spotting';
  symptoms: string[];
  isPeriodStart: boolean;
  notes?: string;
  isLoggedFact: true; // Explicitly distinguishes facts from estimates
}

export interface CheckInRecord {
  id: string;
  userId: string;
  date: string;
  energyLevel: 'low' | 'steady' | 'radiant' | 'restless';
  moodTags: string[];
  bodyFeelings: string[];
  isLoggedFact: true;
}

export interface PhaseEstimate {
  phaseName: 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal';
  estimatedDayOfCycle: number;
  basis: string;
  isEstimate: true;
  disclaimer: string;
}

export interface JournalDraft {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  status: 'draft' | 'saved';
  savedAt?: string;
}

export interface AppDestinationResult {
  destinationId: FeatureDestinationId;
  label: string;
  path: string;
  explanation: string;
  actionText: string;
  permissionRequired?: boolean;
  permissionPrompt?: string;
  params?: Record<string, any>;
}

export interface ToolCallExecutionResult {
  toolName: string;
  parameters: Record<string, any>;
  result: any;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ToolCallExecutionResult[];
  pendingJournalDraft?: JournalDraft;
  suggestedDestinations?: AppDestinationResult[];
}
