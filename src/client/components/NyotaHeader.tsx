import React from 'react';
import { NyotaStarIcon } from './NyotaStarIcon';
import { User, RefreshCw, Trash2, ShieldCheck } from 'lucide-react';

interface NyotaHeaderProps {
  currentUserId: string;
  onUserChange: (userId: string) => void;
  onClearChat: () => void;
  isClearing?: boolean;
}

export const NyotaHeader: React.FC<NyotaHeaderProps> = ({
  currentUserId,
  onUserChange,
  onClearChat,
  isClearing = false
}) => {
  return (
    <header className="px-4 py-3 bg-[#FAF7F2] border-b border-[#E8DFD5] flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#E8DFD5] flex items-center justify-center shadow-xs">
          <NyotaStarIcon size={26} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[#133E48] tracking-tight">Nyota</h1>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#F6C445]/20 text-[#946A00] border border-[#F6C445]/30">
              Monsiel Companion
            </span>
          </div>
          <p className="text-xs text-[#5C7075] font-normal">
            Your AI companion in Monsiel
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* User Switcher to demonstrate isolation */}
        <div className="flex items-center gap-1.5 bg-[#F2ECE1] px-2.5 py-1 rounded-lg border border-[#E2D8CC] text-xs">
          <User className="w-3.5 h-3.5 text-[#133E48]" />
          <span className="text-[11px] font-medium text-[#5C7075] hidden sm:inline">User:</span>
          <select
            value={currentUserId}
            onChange={(e) => onUserChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-[#133E48] focus:outline-none cursor-pointer"
            aria-label="Select active user for isolation demonstration"
          >
            <option value="user_amara">Amara (Gluten-Free, Veg)</option>
            <option value="user_elena">Elena (Dairy-Free, Nut-Free)</option>
          </select>
        </div>

        {/* Clear chat button */}
        <button
          onClick={onClearChat}
          disabled={isClearing}
          title="Restart conversation"
          className="p-1.5 rounded-lg text-[#5C7075] hover:text-[#133E48] hover:bg-[#EFE8DC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#133E48]"
          aria-label="Clear and restart conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
