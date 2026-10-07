import React from 'react';
import { ChatMessage, FeatureDestinationId } from '../types';
import { NyotaStarIcon } from './NyotaStarIcon';
import { JournalDraftCard } from './JournalDraftCard';
import { FeatureActionCard } from './FeatureActionCard';
import { Wrench } from 'lucide-react';

interface MessageItemProps {
  message: ChatMessage;
  onNavigate: (id: FeatureDestinationId, params?: any) => void;
  onJournalSaved?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onNavigate, onJournalSaved }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[85%] bg-[#133E48] text-[#FAF7F2] rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <div className="text-[10px] text-[#A2C1C9] text-right mt-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-center shadow-xs">
          <NyotaStarIcon size={22} />
        </div>
      </div>

      <div className="flex-1 max-w-[88%]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-[#133E48]">Nyota</span>
          <span className="text-[10px] text-[#8C9B9E]">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-[#3E8E62] bg-[#EAF5EE] px-1.5 py-0.2 rounded">
            AI Companion
          </span>
        </div>

        {/* Bubble Surface */}
        <div className="bg-[#FAF7F2] border border-[#E8DFD5] rounded-2xl rounded-tl-sm p-4 shadow-sm text-[#133E48]">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#133E48] font-normal">
            {message.content}
          </p>

          {/* Structured tool calls audit badges if present */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-[#EFE8DC] flex flex-wrap gap-1.5">
              {message.toolCalls.map((tc, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#EFE8DC] text-[#133E48] font-mono"
                  title={JSON.stringify(tc.parameters)}
                >
                  <Wrench className="w-2.5 h-2.5 text-[#E06D53]" />
                  <span>{tc.toolName}</span>
                </div>
              ))}
            </div>
          )}

          {/* Pending Editable Journal Draft */}
          {message.pendingJournalDraft && (
            <JournalDraftCard
              draft={message.pendingJournalDraft}
              onSaved={() => {
                if (onJournalSaved) onJournalSaved();
              }}
            />
          )}

          {/* Deep link action destinations */}
          {message.suggestedDestinations && message.suggestedDestinations.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.suggestedDestinations.map((dest, idx) => (
                <FeatureActionCard
                  key={`${dest.destinationId}-${idx}`}
                  destination={dest}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
