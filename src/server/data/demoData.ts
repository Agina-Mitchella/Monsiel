import {
  UserProfile,
  LibraryArticle,
  FoodItem,
  CycleLogRecord,
  CheckInRecord,
  JournalDraft
} from '../types';

export const DEMO_DATA_TAG = 'DEMONSTRATION_DATA_PROTOTYPE_MODE';

export const DEMO_USERS: Record<string, UserProfile> = {
  'user_amara': {
    id: 'user_amara',
    name: 'Amara',
    dietaryExclusions: ['gluten-free', 'vegetarian'],
    averageCycleLength: 28,
  },
  'user_elena': {
    id: 'user_elena',
    name: 'Elena',
    dietaryExclusions: ['dairy-free', 'nut-free'],
    averageCycleLength: 31,
  }
};

export const DEMO_LIBRARY_ARTICLES: LibraryArticle[] = [
  {
    id: 'art_sleep_01',
    title: 'Gentle Sleep Habits Across Your Rhythm',
    summary: 'How body temperature variations can influence deep rest, and simple evening wind-down rituals.',
    tags: ['sleep', 'rest', 'evening', 'temperature'],
    readingTimeMinutes: 4,
    reviewedBy: 'Reviewed by Monsiel Wellbeing Editorial Board',
    keyTakeaway: 'Prioritizing a cool room and dimmed lighting supports deeper non-REM sleep cycles.',
    fullUrl: '/library/gentle-sleep-habits'
  },
  {
    id: 'art_nourish_02',
    title: 'Everyday Iron & Sustenance During Bleed Days',
    summary: 'Exploring plant-based iron pairings and warming preparations that are gentle on digestion.',
    tags: ['nutrition', 'iron', 'bleed', 'period', 'digestion'],
    readingTimeMinutes: 5,
    reviewedBy: 'Reviewed by Monsiel Certified Nutritionists',
    keyTakeaway: 'Pairing non-heme iron sources like lentils and leafy greens with vitamin C aids natural absorption.',
    fullUrl: '/library/everyday-iron-sustenance'
  },
  {
    id: 'art_movement_03',
    title: 'Honoring Movement and Stillness Without Pressure',
    summary: 'Shifting from rigid workout routines to listening to your current energy reservoir.',
    tags: ['movement', 'exercise', 'rest', 'activity', 'energy'],
    readingTimeMinutes: 3,
    reviewedBy: 'Reviewed by Monsiel Somatic Movement Panel',
    keyTakeaway: 'Gentle stretching or restorative walks can be just as beneficial as high-intensity training.',
    fullUrl: '/library/honoring-movement-stillness'
  },
  {
    id: 'art_reflection_04',
    title: 'The Art of The Mirror: Guided Reflection for Emotional Clarity',
    summary: 'A supportive exploration of noticing patterns in mood without self-criticism.',
    tags: ['reflection', 'mirror', 'mindfulness', 'journaling'],
    readingTimeMinutes: 4,
    reviewedBy: 'Reviewed by Monsiel Clinical Psychology Advisors',
    keyTakeaway: 'Observing emotions with curious detachment helps build self-trust over consecutive cycles.',
    fullUrl: '/library/art-of-the-mirror'
  }
];

export const DEMO_FOOD_CATALOGUE: FoodItem[] = [
  {
    id: 'food_pumpkin_seeds',
    name: 'Pumpkin Seeds (Pepitas)',
    category: 'seed',
    servingIdea: 'Lightly toasted with sea salt over roasted soup, or sprinkled onto morning oats.',
    dietaryTags: ['gluten-free', 'vegan', 'dairy-free', 'nut-free'],
    phaseNotes: 'Often enjoyed during follicular days; rich in zinc and magnesium.'
  },
  {
    id: 'food_chamomile_ginger_tea',
    name: 'Chamomile & Fresh Ginger Infusion',
    category: 'tea',
    servingIdea: 'Steep fresh crushed ginger root and dried chamomile blossoms with warm lemon water.',
    dietaryTags: ['gluten-free', 'vegan', 'dairy-free', 'nut-free'],
    phaseNotes: 'Warming and soothing for evening routines or during menstrual cramping.'
  },
  {
    id: 'food_sweet_potato',
    name: 'Roasted Sweet Potato Wedges',
    category: 'vegetable',
    servingIdea: 'Tossed in olive oil and rosemary, baked until caramelized, served alongside tahini dip.',
    dietaryTags: ['gluten-free', 'vegan', 'dairy-free', 'nut-free'],
    phaseNotes: 'Complex carbohydrates that offer steady, gentle blood glucose support in luteal phases.'
  },
  {
    id: 'food_red_lentils',
    name: 'Warming Red Lentil Dahl',
    category: 'grain',
    servingIdea: 'Simmered with cumin, turmeric, coconut milk, and crushed garlic, topped with cilantro.',
    dietaryTags: ['gluten-free', 'vegan', 'dairy-free', 'nut-free'],
    phaseNotes: 'Provides comforting plant protein and iron during bleeding or restorative days.'
  },
  {
    id: 'food_avocado',
    name: 'Creamy Hass Avocado',
    category: 'fruit',
    servingIdea: 'Sliced onto warm sourdough or mashed with lime and sea salt as an afternoon snack.',
    dietaryTags: ['gluten-free', 'vegan', 'dairy-free', 'nut-free'],
    phaseNotes: 'A source of monounsaturated fats and potassium.'
  },
  {
    id: 'food_almonds',
    name: 'Sprouted Raw Almonds',
    category: 'seed',
    servingIdea: 'Soaked overnight or blended into fresh almond butter with cinnamon.',
    dietaryTags: ['gluten-free', 'vegan', 'dairy-free'], // Not nut-free!
    phaseNotes: 'Rich in vitamin E and plant-based protein.'
  }
];

// Seeded cycle logs for user_amara
export const DEMO_CYCLE_LOGS_AMARA: CycleLogRecord[] = [
  {
    id: 'log_amara_01',
    userId: 'user_amara',
    date: '2026-09-22',
    flow: 'medium',
    symptoms: ['mild cramps', 'lower back tenderness'],
    isPeriodStart: true,
    notes: 'Started morning with warm tea and heat pad.',
    isLoggedFact: true
  },
  {
    id: 'log_amara_02',
    userId: 'user_amara',
    date: '2026-09-23',
    flow: 'heavy',
    symptoms: ['fatigue', 'cramps'],
    isPeriodStart: false,
    notes: 'Rest day, gentle walk.',
    isLoggedFact: true
  },
  {
    id: 'log_amara_03',
    userId: 'user_amara',
    date: '2026-09-26',
    flow: 'spotting',
    symptoms: ['rising energy'],
    isPeriodStart: false,
    isLoggedFact: true
  }
];

// Seeded check-in for user_amara
export const DEMO_CHECKINS_AMARA: CheckInRecord[] = [
  {
    id: 'checkin_amara_01',
    userId: 'user_amara',
    date: '2026-10-06',
    energyLevel: 'radiant',
    moodTags: ['grounded', 'creative'],
    bodyFeelings: ['light', 'well-rested'],
    isLoggedFact: true
  }
];

// Seeded cycle logs for user_elena (demonstrating user isolation)
export const DEMO_CYCLE_LOGS_ELENA: CycleLogRecord[] = [
  {
    id: 'log_elena_01',
    userId: 'user_elena',
    date: '2026-10-02',
    flow: 'heavy',
    symptoms: ['headache', 'bloating'],
    isPeriodStart: true,
    notes: 'Took extra time off screens.',
    isLoggedFact: true
  }
];

export const DEMO_SAVED_FOODS: Record<string, string[]> = {
  'user_amara': ['food_pumpkin_seeds', 'food_chamomile_ginger_tea'],
  'user_elena': ['food_sweet_potato']
};

export const DEMO_JOURNAL_ENTRIES: Record<string, JournalDraft[]> = {
  'user_amara': [
    {
      id: 'journal_amara_01',
      userId: 'user_amara',
      title: 'Noticing morning stillness',
      content: 'Took ten minutes in the sun before checking emails. Feeling a quiet rhythm returning today.',
      createdAt: '2026-10-04T08:30:00Z',
      status: 'saved',
      savedAt: '2026-10-04T08:32:00Z'
    }
  ],
  'user_elena': [
    {
      id: 'journal_elena_01',
      userId: 'user_elena',
      title: 'Resting without guilt',
      content: 'Allowed myself an afternoon nap today. Body felt exhausted after a long work week.',
      createdAt: '2026-10-03T16:00:00Z',
      status: 'saved',
      savedAt: '2026-10-03T16:02:00Z'
    }
  ]
};
