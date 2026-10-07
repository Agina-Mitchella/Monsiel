import { GoogleGenerativeAI } from '@google/generative-ai';
import { MonsielAdapter } from '../adapters/monsielAdapter';
import { NYOTA_SYSTEM_INSTRUCTION, NYOTA_TOOLS } from './toolsDefinition';
import {
  ToolCallExecutionResult,
  JournalDraft,
  AppDestinationResult,
  FeatureDestinationId
} from '../types';

export interface AgentProcessResult {
  reply: string;
  toolCalls: ToolCallExecutionResult[];
  pendingJournalDraft?: JournalDraft;
  suggestedDestinations?: AppDestinationResult[];
  provider: 'gemini' | 'local_fallback';
}

export class GeminiProvider {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName: string;

  constructor(apiKey?: string, modelName = 'gemini-1.5-flash') {
    this.modelName = modelName;
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (key) {
      this.genAI = new GoogleGenerativeAI(key);
    }
  }

  isAvailable(): boolean {
    return !!this.genAI;
  }

  async runConversationTurn(
    userId: string,
    messageText: string,
    conversationHistory: { role: 'user' | 'model'; parts: { text: string }[] }[],
    adapter: MonsielAdapter
  ): Promise<AgentProcessResult> {
    if (!this.genAI) {
      throw new Error('Gemini API key is not configured.');
    }

    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: NYOTA_SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: NYOTA_TOOLS }]
    });

    const chat = model.startChat({
      history: conversationHistory
    });

    const toolExecutionResults: ToolCallExecutionResult[] = [];
    const suggestedDestinations: AppDestinationResult[] = [];
    let pendingJournalDraft: JournalDraft | undefined;

    // Send the user prompt
    let response = await chat.sendMessage(messageText);

    // Loop for multi-step tool calls if any
    let iterations = 0;
    const MAX_TOOL_ITERATIONS = 4;

    while (response.response.functionCalls() && iterations < MAX_TOOL_ITERATIONS) {
      iterations++;
      const functionCalls = response.response.functionCalls()!;
      const functionResponses = [];

      for (const call of functionCalls) {
        const { name, args } = call;
        let result: any = null;
        let status: 'success' | 'error' = 'success';
        let errorMessage: string | undefined;

        try {
          switch (name) {
            case 'open_feature': {
              const featId = (args as any).featureId as FeatureDestinationId;
              const dest = adapter.resolveDestination(featId, args as any);
              suggestedDestinations.push(dest);
              result = dest;
              break;
            }

            case 'search_library_articles': {
              const query = (args as any).query;
              const tag = (args as any).tag;
              const articles = await adapter.searchLibrary(query, tag);
              result = { articlesFound: articles.length, articles };
              suggestedDestinations.push(adapter.resolveDestination('library'));
              break;
            }

            case 'search_foods': {
              const query = (args as any).query;
              const savedOnly = (args as any).savedOnly;
              const respectDietary = (args as any).respectDietary;
              const foods = await adapter.searchFoods({
                userId,
                query,
                savedOnly,
                applyDietaryExclusions: respectDietary !== false
              });
              result = { foodsFound: foods.length, foods };
              suggestedDestinations.push(
                adapter.resolveDestination(savedOnly ? 'nourishment_saved' : 'nourishment')
              );
              break;
            }

            case 'read_cycle_records': {
              const recordType = (args as any).recordType;
              if (recordType === 'last_period') {
                result = await adapter.getLastPeriodRecord(userId);
                suggestedDestinations.push(adapter.resolveDestination('cycle_calendar'));
              } else if (recordType === 'daily_check_in') {
                result = await adapter.getCheckIns(userId, 3);
                suggestedDestinations.push(adapter.resolveDestination('my_rhythm'));
              } else {
                result = await adapter.getRecentCycleLogs(userId, 5);
                suggestedDestinations.push(adapter.resolveDestination('cycle_calendar'));
              }
              break;
            }

            case 'prepare_journal_entry': {
              const draftText = (args as any).draftText;
              const title = (args as any).title || 'Reflection';
              const draft: JournalDraft = {
                id: `draft_${Date.now()}`,
                userId,
                title,
                content: draftText,
                createdAt: new Date().toISOString(),
                status: 'draft'
              };
              pendingJournalDraft = draft;
              result = {
                status: 'draft_prepared',
                message: 'Draft prepared. Waiting for authenticated user confirmation before writing to journal.'
              };
              break;
            }

            default:
              status = 'error';
              errorMessage = `Unknown tool: ${name}`;
              result = { error: errorMessage };
          }
        } catch (err: any) {
          status = 'error';
          errorMessage = err.message || 'Tool execution error';
          result = { error: errorMessage };
        }

        toolExecutionResults.push({
          toolName: name,
          parameters: args as Record<string, any>,
          result,
          status,
          errorMessage
        });

        functionResponses.push({
          response: {
            name,
            content: result
          }
        });
      }

      // Send tool results back to Gemini
      response = await chat.sendMessage(functionResponses);
    }

    const reply = response.response.text();

    return {
      reply,
      toolCalls: toolExecutionResults,
      pendingJournalDraft,
      suggestedDestinations,
      provider: 'gemini'
    };
  }
}
