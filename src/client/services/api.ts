import { ChatMessage, JournalDraft, UserProfile } from '../types';

let currentUserId = 'user_amara';

export const setApiUserId = (userId: string) => {
  currentUserId = userId;
};

export const getApiUserId = () => currentUserId;

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-User-Id': currentUserId,
  Authorization: `Bearer ${currentUserId}`
});

export const api = {
  async getHealth() {
    const res = await fetch('/api/health', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to reach backend health');
    return await res.json();
  },

  async getProfile(): Promise<{ user: UserProfile }> {
    const res = await fetch('/api/me', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return await res.json();
  },

  async getChatHistory(): Promise<{ history: ChatMessage[] }> {
    const res = await fetch('/api/chat/history', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch chat history');
    return await res.json();
  },

  async sendMessage(message: string): Promise<{ message: ChatMessage; provider: string }> {
    const res = await fetch('/api/chat/message', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to send message' }));
      throw new Error(err.error || 'Server error');
    }
    return await res.json();
  },

  async clearChat(): Promise<{ success: boolean }> {
    const res = await fetch('/api/chat/clear', {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to clear conversation');
    return await res.json();
  },

  async saveJournalEntry(entry: {
    id?: string;
    title: string;
    content: string;
    idempotencyKey?: string;
  }): Promise<{ success: boolean; entry: JournalDraft; alreadySaved: boolean }> {
    const res = await fetch('/api/journal/save', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(entry)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to save entry' }));
      throw new Error(err.error || 'Save failed');
    }
    return await res.json();
  },

  async getJournalEntries(): Promise<{ entries: JournalDraft[] }> {
    const res = await fetch('/api/journal/entries', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch journal entries');
    return await res.json();
  },

  async getCycleRecords(): Promise<any> {
    const res = await fetch('/api/cycle/records', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch cycle records');
    return await res.json();
  },

  async getFoods(savedOnly = false, query = ''): Promise<any> {
    const url = new URL('/api/foods', window.location.origin);
    if (savedOnly) url.searchParams.set('saved', 'true');
    if (query) url.searchParams.set('q', query);
    const res = await fetch(url.toString(), { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch foods');
    return await res.json();
  },

  async getLibrary(query = '', tag = ''): Promise<any> {
    const url = new URL('/api/library', window.location.origin);
    if (query) url.searchParams.set('q', query);
    if (tag) url.searchParams.set('tag', tag);
    const res = await fetch(url.toString(), { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch library');
    return await res.json();
  }
};
