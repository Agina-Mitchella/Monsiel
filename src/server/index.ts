import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import { authMiddleware } from './auth/authMiddleware';
import { DemoMonsielAdapter } from './adapters/demoMonsielAdapter';
import { RealMonsielAdapter } from './adapters/realMonsielAdapter';
import { MonsielAdapter } from './adapters/monsielAdapter';
import { NyotaAgent } from './ai/nyotaAgent';
import { ChatMessage } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(authMiddleware);

// Select adapter based on environment configuration
// If MONSIEL_API_URL and MONSIEL_SERVICE_TOKEN are present, RealMonsielAdapter can be used;
// otherwise DemoMonsielAdapter is used with visibly labeled demonstration data.
const isRealConfigured = !!(process.env.MONSIEL_API_URL && process.env.MONSIEL_SERVICE_TOKEN);
const adapter: MonsielAdapter = isRealConfigured
  ? new RealMonsielAdapter()
  : new DemoMonsielAdapter();

const nyotaAgent = new NyotaAgent(adapter);

// In-memory conversation store strictly partitioned by userId
const conversationsByUser = new Map<string, ChatMessage[]>();

const DEFAULT_WELCOME_MESSAGE =
  'Hi, I’m Nyota. I can help you check in, find food ideas, explore your journal, or open a space to reflect. Where shall we start?';

function getUserConversation(userId: string): ChatMessage[] {
  if (!conversationsByUser.has(userId)) {
    conversationsByUser.set(userId, [
      {
        id: `msg_welcome_${userId}`,
        userId,
        role: 'assistant',
        content: DEFAULT_WELCOME_MESSAGE,
        timestamp: new Date().toISOString()
      }
    ]);
  }
  return conversationsByUser.get(userId)!;
}

// 1. Health & Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    companion: 'Nyota',
    adapterMode: adapter.modeLabel,
    isDemonstrationMode: adapter.isDemonstrationMode,
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    user: req.user
  });
});

// 2. Authenticated user profile
app.get('/api/me', (req, res) => {
  res.json({ user: req.user });
});

// 3. Conversation history
app.get('/api/chat/history', (req, res) => {
  const userId = req.user!.id;
  const history = getUserConversation(userId);
  res.json({ history });
});

// 4. Send chat message
const ChatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long')
});

app.post('/api/chat/message', async (req, res) => {
  try {
    const parseResult = ChatMessageSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { message } = parseResult.data;
    const userId = req.user!.id;
    const history = getUserConversation(userId);

    // Record user message
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      userId,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    history.push(userMsg);

    // Execute agent processing
    const agentResult = await nyotaAgent.handleUserMessage(userId, message, history);

    // Record assistant message
    const assistantMsg: ChatMessage = {
      id: `msg_${Date.now()}_a`,
      userId,
      role: 'assistant',
      content: agentResult.reply,
      timestamp: new Date().toISOString(),
      toolCalls: agentResult.toolCalls,
      pendingJournalDraft: agentResult.pendingJournalDraft,
      suggestedDestinations: agentResult.suggestedDestinations
    };
    history.push(assistantMsg);

    res.json({
      message: assistantMsg,
      provider: agentResult.provider
    });
  } catch (error: any) {
    console.error('Error handling chat message:', error);
    res.status(500).json({ error: error.message || 'Failed to process message' });
  }
});

// 5. Clear conversation
app.post('/api/chat/clear', (req, res) => {
  const userId = req.user!.id;
  conversationsByUser.set(userId, [
    {
      id: `msg_welcome_${userId}_${Date.now()}`,
      userId,
      role: 'assistant',
      content: DEFAULT_WELCOME_MESSAGE,
      timestamp: new Date().toISOString()
    }
  ]);
  res.json({ success: true });
});

// 6. Confirm and save journal entry (prevents duplicate writes)
const SaveJournalSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title cannot be empty'),
  content: z.string().min(1, 'Content cannot be empty'),
  idempotencyKey: z.string().optional()
});

app.post('/api/journal/save', async (req, res) => {
  try {
    const parseResult = SaveJournalSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { id, title, content, idempotencyKey } = parseResult.data;
    const userId = req.user!.id;

    const result = await adapter.saveJournalEntry(userId, {
      id,
      title,
      content,
      idempotencyKey
    });

    res.json({
      success: true,
      entry: result.entry,
      alreadySaved: result.alreadySaved
    });
  } catch (error: any) {
    console.error('Error saving journal entry:', error);
    res.status(500).json({ error: error.message || 'Failed to save journal entry' });
  }
});

// 7. Get user's saved journal entries
app.get('/api/journal/entries', async (req, res) => {
  try {
    const userId = req.user!.id;
    const entries = await adapter.getJournalEntries(userId);
    res.json({ entries });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Cycle records and phase estimate
app.get('/api/cycle/records', async (req, res) => {
  try {
    const userId = req.user!.id;
    const cycleData = await adapter.getRecentCycleLogs(userId);
    const lastPeriod = await adapter.getLastPeriodRecord(userId);
    res.json({
      cycleLogs: cycleData.logs,
      phaseEstimate: cycleData.phaseEstimate,
      lastPeriod
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Food catalogue & saved foods
app.get('/api/foods', async (req, res) => {
  try {
    const userId = req.user!.id;
    const savedOnly = req.query.saved === 'true';
    const query = req.query.q as string | undefined;
    const foods = await adapter.searchFoods({
      userId,
      query,
      savedOnly,
      applyDietaryExclusions: false
    });
    res.json({ foods });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Library articles
app.get('/api/library', async (req, res) => {
  try {
    const query = (req.query.q as string) || '';
    const tag = req.query.tag as string | undefined;
    const articles = await adapter.searchLibrary(query, tag);
    res.json({ articles });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Only start listening if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Monsiel & Nyota Server] running on http://localhost:${PORT}`);
    console.log(`[Adapter Mode] ${adapter.modeLabel}`);
  });
}

export { app, adapter };
