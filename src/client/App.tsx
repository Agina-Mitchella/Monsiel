import React, { useState } from 'react';
import { FeatureDestinationId } from './types';
import { DemoBanner } from './components/DemoBanner';
import { NyotaChat } from './components/NyotaChat';
import { MonsielAppCanvas } from './components/MonsielAppCanvas';
import { Sparkles, LayoutGrid, MessageSquare } from 'lucide-react';

export const App: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState('user_amara');
  const [activeView, setActiveView] = useState<FeatureDestinationId>('my_rhythm');
  const [mobileTab, setMobileTab] = useState<'chat' | 'canvas'>('chat');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNavigate = (destinationId: FeatureDestinationId) => {
    setActiveView(destinationId);
    setMobileTab('canvas'); // Switch to canvas on mobile to show the action
  };

  const handleDataMutated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F5EFE6] text-[#133E48] flex flex-col font-sans">
      {/* Prototype Status Banner */}
      <DemoBanner />

      {/* Mobile Switcher (visible only on small screens) */}
      <div className="md:hidden flex border-b border-[#E8DFD5] bg-[#FAF7F2]">
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 ${
            mobileTab === 'chat'
              ? 'border-[#133E48] text-[#133E48]'
              : 'border-transparent text-[#8C9B9E]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Nyota Companion</span>
        </button>
        <button
          onClick={() => setMobileTab('canvas')}
          className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 ${
            mobileTab === 'canvas'
              ? 'border-[#133E48] text-[#133E48]'
              : 'border-transparent text-[#8C9B9E]'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Monsiel App</span>
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6 flex flex-col md:flex-row gap-4 h-[calc(100vh-4rem)]">
        {/* Left Column: Nyota AI Companion */}
        <div
          className={`w-full md:w-[460px] flex-shrink-0 h-full flex flex-col ${
            mobileTab === 'chat' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <NyotaChat
            currentUserId={currentUserId}
            onUserChange={setCurrentUserId}
            onNavigate={handleNavigate}
            onDataMutated={handleDataMutated}
          />
        </div>

        {/* Right Column: Monsiel App Canvas */}
        <div
          className={`flex-1 h-full flex flex-col ${
            mobileTab === 'canvas' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <MonsielAppCanvas
            activeView={activeView}
            onSelectView={setActiveView}
            currentUserId={currentUserId}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </main>
    </div>
  );
};
