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
import {
  DEMO_USERS,
  DEMO_LIBRARY_ARTICLES,
  DEMO_FOOD_CATALOGUE,
  DEMO_CYCLE_LOGS_AMARA,
  DEMO_CHECKINS_AMARA,
  DEMO_CYCLE_LOGS_ELENA,
  DEMO_SAVED_FOODS,
  DEMO_JOURNAL_ENTRIES
} from '../data/demoData';

export class DemoMonsielAdapter implements MonsielAdapter {
  readonly isDemonstrationMode = true;
  readonly modeLabel = 'Demonstration Adapter (Demo Mode: Monsiel backend absent)';

  private users = new Map<string, UserProfile>(Object.entries(DEMO_USERS));
  private articles: LibraryArticle[] = [...DEMO_LIBRARY_ARTICLES];
  private foodCatalogue: FoodItem[] = [...DEMO_FOOD_CATALOGUE];
  
  // Isolated per-user data stores
  private cycleLogsByUser = new Map<string, CycleLogRecord[]>();
  private checkInsByUser = new Map<string, CheckInRecord[]>();
  private savedFoodsByUser = new Map<string, Set<string>>();
  private journalsByUser = new Map<string, JournalDraft[]>();
  
  // Idempotency tracking to prevent duplicate writes
  private seenIdempotencyKeys = new Set<string>();

  constructor() {
    // Seed isolated data for Amara
    this.cycleLogsByUser.set('user_amara', [...DEMO_CYCLE_LOGS_AMARA]);
    this.checkInsByUser.set('user_amara', [...DEMO_CHECKINS_AMARA]);
    this.savedFoodsByUser.set('user_amara', new Set(DEMO_SAVED_FOODS['user_amara'] || []));
    this.journalsByUser.set('user_amara', [...(DEMO_JOURNAL_ENTRIES['user_amara'] || [])]);

    // Seed isolated data for Elena
    this.cycleLogsByUser.set('user_elena', [...DEMO_CYCLE_LOGS_ELENA]);
    this.checkInsByUser.set('user_elena', []);
    this.savedFoodsByUser.set('user_elena', new Set(DEMO_SAVED_FOODS['user_elena'] || []));
    this.journalsByUser.set('user_elena', [...(DEMO_JOURNAL_ENTRIES['user_elena'] || [])]);
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (this.users.has(userId)) {
      return this.users.get(userId)!;
    }
    // Return a default demo user if new
    const fallbackUser: UserProfile = {
      id: userId,
      name: 'Monsiel Member',
      dietaryExclusions: [],
      averageCycleLength: 28
    };
    this.users.set(userId, fallbackUser);
    return fallbackUser;
  }

  resolveDestination(destinationId: FeatureDestinationId, params?: Record<string, any>): AppDestinationResult {
    switch (destinationId) {
      case 'my_rhythm':
        return {
          destinationId,
          label: 'My Rhythm',
          path: '/rhythm',
          explanation: 'Your personal rhythm home screen and daily check-in.',
          actionText: 'Open My Rhythm',
          params
        };
      case 'cycle_calendar':
        return {
          destinationId,
          label: 'Cycle & Body Calendar',
          path: '/cycle',
          explanation: 'Recorded period logs, symptoms, and estimated cycle phases.',
          actionText: 'View Calendar',
          params
        };
      case 'nourishment':
        return {
          destinationId,
          label: 'Nourishment Catalogue',
          path: '/nourishment',
          explanation: 'Curated food catalogue with practical serving ideas and dietary filters.',
          actionText: 'Browse Foods',
          params
        };
      case 'nourishment_saved':
        return {
          destinationId,
          label: 'Saved Foods (Nourishment)',
          path: '/nourishment?view=saved',
          explanation: 'Your personal collection of saved food ideas.',
          actionText: 'View Saved Foods',
          params
        };
      case 'activity_ideas':
        return {
          destinationId,
          label: 'Activity & Rest Ideas',
          path: '/activities',
          explanation: 'Movement, gentle stillness, and reflection suggestions by phase.',
          actionText: 'Explore Activity Ideas',
          params
        };
      case 'journal':
        return {
          destinationId,
          label: 'My Journal',
          path: '/journal',
          explanation: 'Your private space for writing, editing, and revisiting entries.',
          actionText: 'Open My Journal',
          params
        };
      case 'mirror':
        return {
          destinationId,
          label: 'The Mirror',
          path: '/mirror',
          explanation: 'Dedicated guided reflection experience.',
          actionText: 'Open The Mirror',
          permissionRequired: true,
          permissionPrompt:
            'The Mirror is a dedicated reflection space. Would you like to enter The Mirror? Any text from Nyota will only transfer if you confirm.',
          params
        };
      case 'library':
        return {
          destinationId,
          label: 'Library',
          path: '/library',
          explanation: 'Published, expert-reviewed wellbeing articles and search.',
          actionText: 'Explore Library',
          params
        };
      case 'breathing':
        return {
          destinationId,
          label: 'Breathing Practices',
          path: '/breathing',
          explanation: 'Short guided exercises for grounding and calm.',
          actionText: 'Start Breathing Practice',
          params
        };
      case 'moon_reflection':
        return {
          destinationId,
          label: 'Moon Reflection',
          path: '/moon-reflection',
          explanation: 'Optional symbolic reflection, clearly separated from biological cycle information.',
          actionText: 'View Moon Reflection',
          params
        };
      default:
        return {
          destinationId: 'my_rhythm',
          label: 'My Rhythm',
          path: '/rhythm',
          explanation: 'Home screen for your rhythm.',
          actionText: 'Open Home',
          params
        };
    }
  }

  async searchLibrary(query: string, tag?: string): Promise<LibraryArticle[]> {
    const q = query.toLowerCase().trim();
    const t = tag?.toLowerCase().trim();

    return this.articles.filter((art) => {
      const matchTag = t ? art.tags.some((x) => x.toLowerCase().includes(t)) : true;
      if (!matchTag) return false;

      if (!q) return true;
      return (
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.tags.some((x) => x.toLowerCase().includes(q))
      );
    });
  }

  async searchFoods(options: {
    userId: string;
    query?: string;
    applyDietaryExclusions?: boolean;
    savedOnly?: boolean;
  }): Promise<FoodItem[]> {
    const user = await this.getUserProfile(options.userId);
    const userSavedIds = this.savedFoodsByUser.get(options.userId) || new Set<string>();

    let results = this.foodCatalogue.map((food) => ({
      ...food,
      isSaved: userSavedIds.has(food.id)
    }));

    if (options.savedOnly) {
      results = results.filter((f) => f.isSaved);
    }

    if (options.applyDietaryExclusions && user && user.dietaryExclusions.length > 0) {
      results = results.filter((food) => {
        // If user is gluten-free, food must include gluten-free tag
        if (user.dietaryExclusions.includes('gluten-free') && !food.dietaryTags.includes('gluten-free')) {
          return false;
        }
        // If user is vegetarian, food must include vegetarian tag
        if (user.dietaryExclusions.includes('vegetarian') && !food.dietaryTags.includes('vegan') && !food.dietaryTags.includes('vegetarian')) {
          return false;
        }
        // If user is nut-free, food must include nut-free tag
        if (user.dietaryExclusions.includes('nut-free') && !food.dietaryTags.includes('nut-free')) {
          return false;
        }
        // If user is dairy-free, food must include dairy-free tag
        if (user.dietaryExclusions.includes('dairy-free') && !food.dietaryTags.includes('dairy-free')) {
          return false;
        }
        return true;
      });
    }

    if (options.query) {
      const q = options.query.toLowerCase().trim();
      results = results.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.servingIdea.toLowerCase().includes(q) ||
          f.phaseNotes.toLowerCase().includes(q) ||
          f.dietaryTags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return results;
  }

  async getLastPeriodRecord(userId: string): Promise<{
    lastPeriodDate: string | null;
    daysAgo: number | null;
    isLoggedFact: boolean;
    details?: CycleLogRecord;
  }> {
    const logs = this.cycleLogsByUser.get(userId) || [];
    // Sort descending by date
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    const lastPeriodStart = sorted.find((log) => log.isPeriodStart);

    if (!lastPeriodStart) {
      return {
        lastPeriodDate: null,
        daysAgo: null,
        isLoggedFact: true
      };
    }

    const today = new Date('2026-10-07T12:00:00Z');
    const logDate = new Date(`${lastPeriodStart.date}T12:00:00Z`);
    const diffTime = Math.abs(today.getTime() - logDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      lastPeriodDate: lastPeriodStart.date,
      daysAgo: diffDays,
      isLoggedFact: true,
      details: lastPeriodStart
    };
  }

  async getRecentCycleLogs(userId: string, limit = 5): Promise<{
    logs: CycleLogRecord[];
    phaseEstimate: PhaseEstimate;
  }> {
    const logs = this.cycleLogsByUser.get(userId) || [];
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);

    // Compute estimated phase based on last period start date
    const lastPeriodStart = sorted.find((l) => l.isPeriodStart);
    let estimatedDay = 1;
    let phaseName: 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal' = 'Follicular';

    if (lastPeriodStart) {
      const today = new Date('2026-10-07T12:00:00Z');
      const start = new Date(`${lastPeriodStart.date}T12:00:00Z`);
      const days = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      estimatedDay = Math.max(1, days);

      if (estimatedDay <= 5) {
        phaseName = 'Menstrual';
      } else if (estimatedDay <= 13) {
        phaseName = 'Follicular';
      } else if (estimatedDay <= 17) {
        phaseName = 'Ovulatory';
      } else {
        phaseName = 'Luteal';
      }
    }

    const phaseEstimate: PhaseEstimate = {
      phaseName,
      estimatedDayOfCycle: estimatedDay,
      basis: lastPeriodStart
        ? `Calculated from your logged period start on ${lastPeriodStart.date}.`
        : 'Default 28-day model baseline without recent period start log.',
      isEstimate: true,
      disclaimer: 'Estimated calculation based on logged cycle history. Not a clinical measurement.'
    };

    return {
      logs: sorted,
      phaseEstimate
    };
  }

  async getCheckIns(userId: string, limit = 5): Promise<CheckInRecord[]> {
    const list = this.checkInsByUser.get(userId) || [];
    return [...list].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
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
    // Check idempotency key to prevent duplicate writes
    if (entry.idempotencyKey && this.seenIdempotencyKeys.has(entry.idempotencyKey)) {
      const existing = (this.journalsByUser.get(userId) || []).find(
        (j) => j.id === entry.id || j.content === entry.content
      );
      if (existing) {
        return { entry: existing, alreadySaved: true };
      }
    }

    let userEntries = this.journalsByUser.get(userId);
    if (!userEntries) {
      userEntries = [];
      this.journalsByUser.set(userId, userEntries);
    }

    // Check if ID already exists in user's journal
    const existingById = userEntries.find((j) => j.id === entry.id);
    if (existingById) {
      existingById.title = entry.title;
      existingById.content = entry.content;
      existingById.status = 'saved';
      existingById.savedAt = new Date().toISOString();
      return { entry: existingById, alreadySaved: true };
    }

    const newEntry: JournalDraft = {
      id: entry.id || `journal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title: entry.title.trim() || 'Journal Entry',
      content: entry.content.trim(),
      createdAt: new Date().toISOString(),
      status: 'saved',
      savedAt: new Date().toISOString()
    };

    userEntries.unshift(newEntry);

    if (entry.idempotencyKey) {
      this.seenIdempotencyKeys.add(entry.idempotencyKey);
    }

    return { entry: newEntry, alreadySaved: false };
  }

  async getJournalEntries(userId: string): Promise<JournalDraft[]> {
    return this.journalsByUser.get(userId) || [];
  }
}
