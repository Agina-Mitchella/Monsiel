import { MonsielAdapter } from '../adapters/monsielAdapter';
import { GeminiProvider, AgentProcessResult } from './geminiProvider';
import { LocalCompanionEngine } from './localCompanionEngine';
import { ChatMessage } from '../types';

export class NyotaAgent {
  private geminiProvider: GeminiProvider;
  private localEngine: LocalCompanionEngine;

  constructor(private adapter: MonsielAdapter) {
    this.geminiProvider = new GeminiProvider();
    this.localEngine = new LocalCompanionEngine(adapter);
  }

  async handleUserMessage(
    userId: string,
    messageText: string,
    history: ChatMessage[]
  ): Promise<AgentProcessResult> {
    // If Gemini is available and configured, try Gemini first
    if (this.geminiProvider.isAvailable()) {
      try {
        const geminiHistory = history
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .slice(-8)
          .map((m) => ({
            role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
            parts: [{ text: m.content }]
          }));

        return await this.geminiProvider.runConversationTurn(
          userId,
          messageText,
          geminiHistory,
          this.adapter
        );
      } catch (err) {
        console.warn('[NyotaAgent] Gemini API invocation failed, falling back to Local Engine:', err);
      }
    }

    // Use Local Companion Engine (guarantees offline/deterministic functionality)
    const localResult = await this.localEngine.processMessage(userId, messageText);
    return {
      ...localResult,
      provider: 'local_fallback'
    };
  }
}
