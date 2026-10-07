import React from 'react';
import { Info, ExternalLink } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Demonstration status"
      className="bg-[#FFF8E7] border-b border-[#F0D59E] px-4 py-2.5 text-xs text-[#133E48] flex items-center justify-between flex-wrap gap-2"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F4C542] text-[#133E48]">
          DEMO PROTOTYPE
        </span>
        <span className="font-medium text-[#133E48]">
          Monsiel codebase was absent in workspace. Running an independent Nyota prototype with separated integration adapters & labeled demo data.
        </span>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-[#4A7C59]">
        <span className="flex items-center gap-1 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#3E8E62] inline-block animate-pulse"></span>
          Demo Adapter Active
        </span>
      </div>
    </div>
  );
};
