import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, FeatureDestinationId } from '../types';
import { api, setApiUserId } from '../services/api';
import { NyotaHeader } from './NyotaHeader';
import { ShortcutsBar } from './ShortcutsBar';
import { MessageItem } from './MessageItem';
import { NyotaStarIcon } from './NyotaStarIcon';
import { Send, AlertCircle, RefreshCw } from 'lucide-react';

interface NyotaChatProps {
  currentUserId: string;
  onUserChange: (userId: string) => void;
  onNavigate: (id: FeatureDestinationId, params?: any) => void;
  onDataMutated?: () => void;
}

export const NyotaChat: React.FC<NyotaChatProps> = ({
  currentUserId,
  onUserChange,
  onNavigate,
  onDataMutated
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      setError(null);
      const res = await api.getChatHistory();
      setMessages(res.history);
    } catch (err: any) {
      setError('Could not load conversation history. Check server connection.');
    }
  };

  useEffect(() => {
    setApiUserId(currentUserId);
    loadHistory();
  }, [currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setError(null);
    setLastFailedMessage(null);
    setInputText('');

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      userId: currentUserId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await api.sendMessage(text);
      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, res.message]);
      if (onDataMutated) onDataMutated();
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
      setLastFailedMessage(text);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSendMessage(lastFailedMessage);
    }
  };

  const handleClearChat = async () => {
    try {
      await api.clearChat();
      await loadHistory();
    } catch (err: any) {
      setError('Failed to clear conversation.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF7F2] text-[#133E48] rounded-xl overflow-hidden border border-[#E8DFD5] shadow-sm">
      {/* Companion Header */}
      <NyotaHeader
        currentUserId={currentUserId}
        onUserChange={onUserChange}
        onClearChat={handleClearChat}
      />

      {/* Wrapping Initial Shortcuts Bar */}
      <ShortcutsBar
        onSelectShortcut={(prompt) => handleSendMessage(prompt)}
        disabled={isLoading}
      />

      {/* Conversation Message Area (Cream surface, no faded overlays) */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-[#FDFBF7]"
        aria-live="polite"
        role="log"
        aria-label="Conversation with Nyota"
      >
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            onNavigate={onNavigate}
            onJournalSaved={onDataMutated}
          />
        ))}

        {/* Loading / Thinking Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 mb-4 animate-fade-in" aria-label="Nyota is thinking">
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-center animate-spin">
              <NyotaStarIcon size={20} />
            </div>
            <div className="bg-[#FAF7F2] border border-[#E8DFD5] rounded-2xl rounded-tl-sm px-4 py-2.5 text-xs text-[#5C7075] flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#F4C542] animate-bounce"></span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#E26D5C] animate-bounce [animation-delay:0.15s]"></span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#3E8E62] animate-bounce [animation-delay:0.3s]"></span>
              <span className="font-medium text-[#133E48]">Nyota is reflecting...</span>
            </div>
          </div>
        )}

        {/* Inline Error State with Retry Button */}
        {error && (
          <div className="p-3 my-2 rounded-xl bg-[#FFF2F0] border border-[#F8C8C4] text-[#C53030] text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {lastFailedMessage && (
              <button
                onClick={handleRetry}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#C53030] text-white hover:bg-[#9B2C2C] flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer (Always visible above keyboard, yellow send button) */}
      <footer className="p-3 bg-[#FAF7F2] border-t border-[#E8DFD5]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <label htmlFor="nyota-message-input" className="sr-only">
            Message Nyota
          </label>
          <input
            id="nyota-message-input"
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Ask Nyota, check in, find foods, or save a thought..."
            className="flex-1 px-4 py-2.5 rounded-full border border-[#DFD5C7] bg-[#FFFFFF] text-sm text-[#133E48] placeholder-[#8C9B9E] focus:outline-none focus:ring-2 focus:ring-[#133E48] focus:border-transparent transition-all disabled:opacity-50"
            autoComplete="off"
          />

          {/* Sunny Yellow Send Button */}
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            aria-label="Send message to Nyota"
            className="w-10 h-10 rounded-full bg-[#F4C542] hover:bg-[#E5B532] active:bg-[#D4A325] text-[#133E48] flex items-center justify-center shadow-xs transition-transform transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#F4C542] focus:ring-offset-2"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </footer>
    </div>
  );
};
