import React, { useState } from 'react';
import { JournalDraft } from '../types';
import { api } from '../services/api';
import { CheckCircle2, BookmarkPlus, Edit3, Loader2 } from 'lucide-react';

interface JournalDraftCardProps {
  draft: JournalDraft;
  onSaved?: (entry: JournalDraft) => void;
}

export const JournalDraftCard: React.FC<JournalDraftCardProps> = ({ draft, onSaved }) => {
  const [title, setTitle] = useState(draft.title);
  const [content, setContent] = useState(draft.content);
  const [isSaved, setIsSaved] = useState(draft.status === 'saved');
  const [isSaving, setIsSaving] = useState(false);
  const [savedTimestamp, setSavedTimestamp] = useState<string | null>(draft.savedAt || null);
  const [error, setError] = useState<string | null>(null);

  // Generate an idempotency key tied to this draft ID and content
  const [idempotencyKey] = useState(`idemp_${draft.id}_${Date.now()}`);

  const handleSave = async () => {
    if (isSaved || isSaving) return;
    setIsSaving(true);
    setError(null);

    try {
      const res = await api.saveJournalEntry({
        id: draft.id,
        title: title.trim(),
        content: content.trim(),
        idempotencyKey
      });

      if (res.success) {
        setIsSaved(true);
        setSavedTimestamp(res.entry.savedAt || new Date().toLocaleTimeString());
        if (onSaved) onSaved(res.entry);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-3 bg-[#FFFDF9] border border-[#E8DFD5] rounded-xl p-4 shadow-sm text-[#133E48]">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#F0E6D8]">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B83A68]">
          <BookmarkPlus className="w-4 h-4" />
          <span>{isSaved ? 'SAVED JOURNAL ENTRY' : 'EDITABLE JOURNAL DRAFT'}</span>
        </div>
        <span className="text-[11px] text-[#718096]">
          {isSaved ? 'Saved in My Journal' : 'Awaiting confirmation'}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-semibold text-[#133E48] mb-1">
            Entry Title
          </label>
          <input
            type="text"
            value={title}
            disabled={isSaved}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm font-semibold px-2.5 py-1.5 rounded-lg border border-[#E2D8CC] bg-[#FDFBF7] text-[#133E48] focus:outline-none focus:ring-2 focus:ring-[#B83A68] disabled:bg-[#F5F1EB] disabled:text-[#4A5568]"
            placeholder="Reflection title..."
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#133E48] mb-1 flex items-center justify-between">
            <span>Your Reflection</span>
            {!isSaved && (
              <span className="text-[10px] text-[#A0AEC0] flex items-center gap-1 font-normal">
                <Edit3 className="w-3 h-3" /> Editable before saving
              </span>
            )}
          </label>
          <textarea
            value={content}
            disabled={isSaved}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full text-sm leading-relaxed px-2.5 py-1.5 rounded-lg border border-[#E2D8CC] bg-[#FDFBF7] text-[#133E48] focus:outline-none focus:ring-2 focus:ring-[#B83A68] disabled:bg-[#F5F1EB] disabled:text-[#4A5568] resize-none"
            placeholder="Your personal words..."
          />
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-[#E26D5C] font-medium">{error}</p>
      )}

      <div className="mt-4 pt-3 border-t border-[#F0E6D8] flex items-center justify-between flex-wrap gap-2">
        {isSaved ? (
          <div className="flex items-center gap-2 text-xs text-[#3E8E62] font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#3E8E62]" />
            <span>Saved to My Journal {savedTimestamp ? `at ${savedTimestamp}` : ''}</span>
          </div>
        ) : (
          <p className="text-[11px] text-[#718096]">
            Only saved after you confirm. Conversations are not automatically saved.
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaved || isSaving || !content.trim()}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            isSaved
              ? 'bg-[#EAF5EE] text-[#3E8E62] cursor-default border border-[#C5E4CF]'
              : 'bg-[#B83A68] hover:bg-[#9B2F56] text-white shadow-sm focus:ring-[#B83A68]'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : isSaved ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Save entry</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
