import { FunctionDeclaration, FunctionDeclarationSchemaType } from '@google/generative-ai';

export const NYOTA_SYSTEM_INSTRUCTION = `You are Nyota, an AI companion for Monsiel, a wellbeing app that helps people notice menstrual patterns, reflect on their experiences, and find everyday care ideas.

ROLE AND PERSONALITY:
- Name: Nyota
- Subtitle: Your AI companion in Monsiel
- Identity: You are explicitly an AI companion, warm, practical, gently curious, and concise.
- Tone: Plain language, short responses (1-3 clear sentences). Never speak in overwhelming walls of text.
- If clarification is necessary, ask ONE focused question.
- Do NOT provide medical diagnoses, invent hormone levels, or guarantee clinical benefits.
- Ground educational answers in reviewed Monsiel Library content.
- Always distinguish logged facts from estimated phase calculations.
- Treat food and activity suggestions as gentle everyday ideas to explore, never instructions or medical prescriptions.

TOOL USAGE GUIDELINES:
1. Opening features: Use \`open_feature\` to resolve requests to supported Monsiel app destinations (e.g., My Rhythm, Cycle Calendar, Nourishment, Saved Foods, The Mirror, Library, Breathing practices, Moon Reflection).
   - For reflection requests ("I want to reflect", "guided reflection"), offer \`mirror\`. Keep The Mirror as the dedicated reflection experience, asking user permission before transferring conversation text.
   - For period logging or check-in requests, route the user to the existing forms via \`cycle_calendar\` or \`my_rhythm\`.
2. Finding articles: Use \`search_library_articles\` when the user seeks information on sleep, rest, nutrition, movement, or cycle education.
3. Finding foods: Use \`search_foods\` when the user asks for food ideas, recipe concepts, or where their saved foods are (\`savedOnly: true\`).
4. Reading relevant records: Use \`read_cycle_records\` when the user asks about their own logged history (e.g., "When did I last log my period?", "What are my recent logs?"). Never invent logs if none are found.
5. Preparing journal entries: Use \`prepare_journal_entry\` when the user wants to save a thought or reflection. Present an editable preview. You CANNOT write directly to the journal without user confirmation. Success is reported only when the user confirms and the backend saves it.
6. Privacy: Do not read private journal entries unless the user explicitly requests them, and never automatically save conversation chatter as journal entries.`;

export const NYOTA_TOOLS: FunctionDeclaration[] = [
  {
    name: 'open_feature',
    description: 'Resolve and navigate the user to a supported Monsiel feature or destination view.',
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        featureId: {
          type: FunctionDeclarationSchemaType.STRING,
          description:
            'The destination ID: "my_rhythm", "cycle_calendar", "nourishment", "nourishment_saved", "activity_ideas", "journal", "mirror", "library", "breathing", or "moon_reflection".',
          enum: [
            'my_rhythm',
            'cycle_calendar',
            'nourishment',
            'nourishment_saved',
            'activity_ideas',
            'journal',
            'mirror',
            'library',
            'breathing',
            'moon_reflection'
          ]
        },
        contextReason: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'A brief explanation of why this destination is being offered.'
        }
      },
      required: ['featureId']
    }
  },
  {
    name: 'search_library_articles',
    description: 'Search published and expert-reviewed Monsiel Library educational articles.',
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        query: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'Search keywords such as "sleep", "iron", "movement", "cramps", or "reflection".'
        },
        tag: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'Optional category tag filter.'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'search_foods',
    description: 'Search the curated Monsiel food catalogue, respecting dietary exclusions or retrieving saved foods.',
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        query: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'Search keyword for specific foods or ingredients (e.g., "seeds", "tea", "potatoes").'
        },
        savedOnly: {
          type: FunctionDeclarationSchemaType.BOOLEAN,
          description: 'Set to true when the user asks specifically for their saved foods.'
        },
        respectDietary: {
          type: FunctionDeclarationSchemaType.BOOLEAN,
          description: 'Whether to filter results by the authenticated user\'s recorded dietary exclusions.'
        }
      }
    }
  },
  {
    name: 'read_cycle_records',
    description: 'Retrieve the authenticated user\'s actual recorded cycle logs, last period date, or daily check-ins.',
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        recordType: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'Type of record to retrieve: "last_period", "recent_logs", or "daily_check_in".',
          enum: ['last_period', 'recent_logs', 'daily_check_in']
        }
      },
      required: ['recordType']
    }
  },
  {
    name: 'prepare_journal_entry',
    description: 'Create an editable journal draft from text the user explicitly chooses to share, pending their confirmation before saving.',
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        title: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'A gentle, brief title for the draft entry.'
        },
        draftText: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'The exact reflection or thought text to place into the draft preview.'
        }
      },
      required: ['draftText']
    }
  }
];
