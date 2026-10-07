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
