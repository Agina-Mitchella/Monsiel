import React, { useState } from 'react';
import { AppDestinationResult, FeatureDestinationId } from '../types';
import { ArrowRight, Lock, Sparkles, Compass } from 'lucide-react';

interface FeatureActionCardProps {
  destination: AppDestinationResult;
  onNavigate: (id: FeatureDestinationId, params?: any) => void;
}

export const FeatureActionCard: React.FC<FeatureActionCardProps> = ({ destination, onNavigate }) => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  const handleClick = () => {
    if (destination.permissionRequired && !permissionGranted) {
      setPermissionGranted(true);
      return;
    }
    onNavigate(destination.destinationId, destination.params);
  };

  return (
    <div className="mt-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl p-3 text-[#133E48] transition-all hover:border-[#D5C6B5]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#133E48]">
            <Compass className="w-3.5 h-3.5 text-[#E26D5C]" />
            <span>{destination.label}</span>
          </div>
          <p className="text-xs text-[#4A5568] mt-1 leading-snug">
            {destination.explanation}
          </p>
        </div>
      </div>

      {destination.permissionRequired && !permissionGranted ? (
        <div className="mt-2.5 pt-2 border-t border-[#EFE8DC] bg-[#FFF8EE] -mx-3 -mb-3 p-3 rounded-b-xl">
          <div className="flex items-start gap-2 mb-2 text-xs text-[#805B10]">
            <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#E06D53]" />
            <span>{destination.permissionPrompt || 'The Mirror is a dedicated reflection space. Enter The Mirror?'}</span>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleClick}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#E06D53] hover:bg-[#C95940] text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#E06D53]"
            >
              Confirm & Open Mirror
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 pt-2 border-t border-[#EFE8DC] flex justify-end">
          <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#133E48] hover:bg-[#1A4E5A] text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#133E48] focus:ring-offset-1"
          >
            <span>{destination.actionText || 'Open View'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
