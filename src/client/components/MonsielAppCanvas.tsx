import React, { useState, useEffect } from 'react';
import { FeatureDestinationId } from '../types';
import { api } from '../services/api';
import {
  CalendarHeart,
  Calendar,
  UtensilsCrossed,
  Sparkles,
  BookOpen,
  Eye,
  Library as LibraryIcon,
  Wind,
  Moon,
  Bookmark,
  CheckCircle,
  Clock,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface MonsielAppCanvasProps {
  activeView: FeatureDestinationId;
  onSelectView: (view: FeatureDestinationId) => void;
  currentUserId: string;
  refreshTrigger: number;
}

export const MonsielAppCanvas: React.FC<MonsielAppCanvasProps> = ({
  activeView,
  onSelectView,
  currentUserId,
  refreshTrigger
}) => {
  const [cycleData, setCycleData] = useState<any>(null);
  const [foods, setFoods] = useState<any[]>([]);
  const [libraryArticles, setLibraryArticles] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [librarySearch, setLibrarySearch] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const [onlySavedFoods, setOnlySavedFoods] = useState(activeView === 'nourishment_saved');
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  useEffect(() => {
    if (activeView === 'nourishment_saved') {
      setOnlySavedFoods(true);
    }
  }, [activeView]);

  useEffect(() => {
    // Fetch data for current view & active user
    api.getCycleRecords().then(setCycleData).catch(() => {});
    api.getFoods(onlySavedFoods, foodSearch).then((res) => setFoods(res.foods || [])).catch(() => {});
    api.getLibrary(librarySearch).then((res) => setLibraryArticles(res.articles || [])).catch(() => {});
    api.getJournalEntries().then((res) => setJournalEntries(res.entries || [])).catch(() => {});
  }, [currentUserId, activeView, onlySavedFoods, foodSearch, librarySearch, refreshTrigger]);

  // Breathing animation cycle
  useEffect(() => {
    if (activeView !== 'breathing') return;
    const interval = setInterval(() => {
      setBreathingPhase((prev) => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [activeView]);

  const navItems = [
    { id: 'my_rhythm' as FeatureDestinationId, label: 'My Rhythm', icon: <CalendarHeart className="w-4 h-4" /> },
    { id: 'cycle_calendar' as FeatureDestinationId, label: 'Cycle & Body', icon: <Calendar className="w-4 h-4" /> },
    { id: 'nourishment' as FeatureDestinationId, label: 'Nourishment', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'activity_ideas' as FeatureDestinationId, label: 'Activity Ideas', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'journal' as FeatureDestinationId, label: 'My Journal', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'mirror' as FeatureDestinationId, label: 'The Mirror', icon: <Eye className="w-4 h-4" /> },
    { id: 'library' as FeatureDestinationId, label: 'Library', icon: <LibraryIcon className="w-4 h-4" /> },
    { id: 'breathing' as FeatureDestinationId, label: 'Breathing', icon: <Wind className="w-4 h-4" /> },
    { id: 'moon_reflection' as FeatureDestinationId, label: 'Moon', icon: <Moon className="w-4 h-4" /> }
  ];

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] rounded-xl border border-[#E8DFD5] overflow-hidden shadow-sm">
      {/* Top Monsiel Navigation Bar */}
      <div className="bg-[#FAF7F2] border-b border-[#E8DFD5] px-3 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="font-serif text-base font-bold text-[#133E48] tracking-tight">Monsiel</span>
          <span className="text-[11px] font-semibold text-[#8C9B9E] hidden sm:inline">&bull; App Views</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
          {navItems.map((item) => {
            const isActive =
              activeView === item.id || (item.id === 'nourishment' && activeView === 'nourishment_saved');
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'nourishment') setOnlySavedFoods(false);
                  onSelectView(item.id);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#133E48] text-[#FFFFFF]'
                    : 'text-[#5C7075] hover:bg-[#EFE8DC] hover:text-[#133E48]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen Body */}
      <div className="flex-1 overflow-y-auto p-5 bg-[#FAF7F2]/40 text-[#133E48]">
        {/* 1. MY RHYTHM */}
        {activeView === 'my_rhythm' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#133E48]">My Rhythm</h2>
                <p className="text-xs text-[#5C7075]">Your personal home screen and daily check-in</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAF5EE] text-[#3E8E62]">
                Today &bull; 07 Oct 2026
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E8DFD5] rounded-xl p-4 shadow-xs">
              <h3 className="text-sm font-bold text-[#133E48] mb-1">Daily Check-In</h3>
              <p className="text-xs text-[#5C7075] mb-3">Notice how your body and thoughts feel today.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Steady', 'Restful', 'Radiant', 'Gentle'].map((tag) => (
                  <button
                    key={tag}
                    className="p-2 text-center rounded-lg border border-[#E8DFD5] bg-[#FAF7F2] hover:bg-[#F4EFEA] text-xs font-semibold text-[#133E48] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {cycleData?.phaseEstimate && (
              <div className="bg-[#FDFBF7] border border-[#E8DFD5] rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#B83A68] uppercase tracking-wide">
                    Estimated Phase
                  </span>
                  <span className="text-[10px] text-[#8C9B9E] italic">
                    {cycleData.phaseEstimate.disclaimer}
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#133E48]">
                  {cycleData.phaseEstimate.phaseName} (Day ~{cycleData.phaseEstimate.estimatedDayOfCycle})
                </h4>
                <p className="text-xs text-[#5C7075] mt-1">{cycleData.phaseEstimate.basis}</p>
              </div>
            )}
          </div>
        )}

        {/* 2. CYCLE & BODY */}
        {activeView === 'cycle_calendar' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#133E48]">Cycle & Body</h2>
              <p className="text-xs text-[#5C7075]">Period logging, symptoms, and estimated cycle phases</p>
            </div>

            {cycleData?.lastPeriod && (
              <div className="bg-[#FFFFFF] border border-[#E8DFD5] rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#3E8E62] bg-[#EAF5EE] px-2 py-0.5 rounded mb-1">
                      Verified Logged Fact
                    </span>
                    <h3 className="text-sm font-bold text-[#133E48]">Last Period Logged Start</h3>
                    <p className="text-xs text-[#5C7075] mt-0.5">
                      {cycleData.lastPeriod.lastPeriodDate
                        ? `${cycleData.lastPeriod.lastPeriodDate} (${cycleData.lastPeriod.daysAgo} days ago)`
                        : 'No period start recorded yet'}
                    </p>
                  </div>
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E26D5C] text-white hover:bg-[#C95940] transition-colors">
                    + Log Period
                  </button>
                </div>
              </div>
            )}

            <div className="bg-[#FFFFFF] border border-[#E8DFD5] rounded-xl p-4 shadow-xs">
              <h3 className="text-sm font-bold text-[#133E48] mb-2">Recorded Cycle History</h3>
              {cycleData?.cycleLogs && cycleData.cycleLogs.length > 0 ? (
                <div className="space-y-2">
                  {cycleData.cycleLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg border border-[#F0E6D8] bg-[#FAF7F2] text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[#133E48]">{log.date}</span>
                        <span className="ml-2 font-medium text-[#E26D5C] capitalize">Flow: {log.flow}</span>
                        {log.isPeriodStart && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[#FBEAE8] text-[#E26D5C] font-semibold">
                            Period Start
                          </span>
                        )}
                        <p className="text-[11px] text-[#5C7075] mt-0.5">
                          Symptoms: {log.symptoms.join(', ')}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-[#3E8E62] bg-[#EAF5EE] px-2 py-0.5 rounded">
                        Logged fact
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#5C7075]">No cycle records found for this user.</p>
              )}
            </div>
          </div>
        )}

        {/* 3. NOURISHMENT */}
        {(activeView === 'nourishment' || activeView === 'nourishment_saved') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-[#133E48]">Nourishment</h2>
                <p className="text-xs text-[#5C7075]">Curated catalogue, practical serving ideas, & saved foods</p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-lg border border-[#E8DFD5]">
                <button
                  onClick={() => setOnlySavedFoods(false)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    !onlySavedFoods ? 'bg-[#133E48] text-white' : 'text-[#5C7075] hover:text-[#133E48]'
                  }`}
                >
                  All Foods
                </button>
                <button
                  onClick={() => setOnlySavedFoods(true)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    onlySavedFoods ? 'bg-[#133E48] text-white' : 'text-[#5C7075] hover:text-[#133E48]'
                  }`}
                >
                  Saved ({foods.filter((f) => f.isSaved).length})
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#8C9B9E]" />
              <input
                type="text"
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
                placeholder="Search ingredients, seeds, teas..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-[#E8DFD5] bg-[#FFFFFF] text-[#133E48] focus:outline-none focus:ring-2 focus:ring-[#133E48]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {foods.map((food) => (
                <div
                  key={food.id}
                  className="bg-[#FFFFFF] border border-[#E8DFD5] rounded-xl p-3.5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-[#133E48]">{food.name}</h4>
                      {food.isSaved && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#3E8E62] bg-[#EAF5EE] px-1.5 py-0.5 rounded">
                          <Bookmark className="w-3 h-3 fill-current" /> Saved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5C7075] leading-relaxed mb-2">{food.servingIdea}</p>
                    <div className="text-[11px] text-[#8C9B9E] italic mb-2">{food.phaseNotes}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-[#F0E6D8]">
                    {food.dietaryTags.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E8DFD5] text-[#5C7075]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. ACTIVITY IDEAS */}
        {activeView === 'activity_ideas' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#133E48]">Activity Ideas</h2>
              <p className="text-xs text-[#5C7075]">Movement, rest, and reflection suggestions by phase</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#FFFFFF] border border-[#E8DFD5] rounded-xl p-4">
                <span className="text-[10px] font-bold text-[#E26D5C] uppercase tracking-wider">Rest</span>
                <h4 className="text-sm font-bold text-[#133E48] mt-1 mb-1">Restorative Yoga & Heat</h4>
                <p className="text-xs text-[#5C7075] leading-relaxed">
                  Supportive child’s pose, warm compresses, and unhurried breath to ease pelvic tension.
                </p>
              </div>
              <div className="bg-[#FFFFFF] border border-[#E8DFD5] rounded-xl p-4">
                <span className="text-[10px] font-bold text-[#3E8E62] uppercase tracking-wider">Movement</span>
                <h4 className="text-sm font-bold text-[#133E48] mt-1 mb-1">Brisk Morning Walks</h4>
                <p className="text-xs text-[#5C7075] leading-relaxed">
                  Natural daylight exposure and steady pacing to kindle morning energy without straining.
                </p>
              </div>
              <div className="bg-[#FFFFFF] border border-[#E8DFD5] rounded-xl p-4">
                <span className="text-[10px] font-bold text-[#B83A68] uppercase tracking-wider">Reflection</span>
                <h4 className="text-sm font-bold text-[#133E48] mt-1 mb-1">Evening Thought Unloading</h4>
                <p className="text-xs text-[#5C7075] leading-relaxed">
                  Writing five unstructured lines in My Journal before bed to release busy mental chatter.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. MY JOURNAL */}
        {activeView === 'journal' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#133E48]">My Journal</h2>
                <p className="text-xs text-[#5C7075]">Writing, editing, saving, and revisiting personal entries</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FAF7F2] text-[#5C7075] border border-[#E8DFD5]">
                {journalEntries.length} Saved Entries
              </span>
            </div>

            <div className="space-y-3">
              {journalEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-[#FFFFFF] border border-[#E8DFD5] rounded-xl p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-sm font-bold text-[#133E48]">{entry.title}</h4>
                    <span className="text-[10px] text-[#8C9B9E]">
                      {new Date(entry.savedAt || entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C7075] leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                  <div className="mt-2 pt-2 border-t border-[#F0E6D8] flex justify-end">
                    <span className="text-[10px] font-semibold text-[#3E8E62] bg-[#EAF5EE] px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Saved entry
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. THE MIRROR */}
        {activeView === 'mirror' && (
          <div className="space-y-4">
            <div className="bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl p-5 text-center">
              <Eye className="w-8 h-8 text-[#E26D5C] mx-auto mb-2" />
              <h2 className="text-lg font-bold text-[#133E48]">The Mirror</h2>
              <p className="text-xs text-[#5C7075] max-w-md mx-auto mt-1 leading-relaxed">
                A dedicated guided reflection experience in Monsiel. This is a private, intentional space to explore your thoughts.
              </p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E8DFD5] rounded-xl p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B83A68]">
                Guided Prompt
              </span>
              <h3 className="text-base font-semibold text-[#133E48]">
                "What has your body been asking for over the last few days?"
              </h3>
              <p className="text-xs text-[#5C7075]">
                Notice without judgment: is it rest, more hydration, quiet, or movement?
              </p>
              <textarea
                rows={4}
                placeholder="Reflect here in privacy..."
                className="w-full text-xs p-3 rounded-lg border border-[#E8DFD5] bg-[#FAF7F2] text-[#133E48] focus:outline-none focus:ring-2 focus:ring-[#133E48]"
              />
            </div>
          </div>
        )}

        {/* 7. LIBRARY */}
        {activeView === 'library' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#133E48]">Library</h2>
              <p className="text-xs text-[#5C7075]">Published educational articles with search and bookmarks</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#8C9B9E]" />
              <input
                type="text"
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                placeholder="Search articles on sleep, iron, cycle science..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-[#E8DFD5] bg-[#FFFFFF] text-[#133E48] focus:outline-none focus:ring-2 focus:ring-[#133E48]"
              />
            </div>

            <div className="space-y-3">
              {libraryArticles.map((art) => (
                <div
                  key={art.id}
                  className="bg-[#FFFFFF] border border-[#E8DFD5] rounded-xl p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-[#133E48]">{art.title}</h4>
                    <span className="text-[10px] text-[#8C9B9E] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {art.readingTimeMinutes} min read
                    </span>
                  </div>
                  <p className="text-xs text-[#5C7075] mb-2">{art.summary}</p>
                  <div className="bg-[#FAF7F2] p-2 rounded-lg border border-[#F0E6D8] mb-2 text-xs text-[#133E48]">
                    <span className="font-semibold text-[#3E8E62]">Key Takeaway: </span>
                    {art.keyTakeaway}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#F0E6D8] text-[10px] text-[#8C9B9E]">
                    <span>{art.reviewedBy}</span>
                    <span className="text-[#133E48] font-semibold flex items-center gap-1">
                      Read full article <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. BREATHING PRACTICES */}
        {activeView === 'breathing' && (
          <div className="space-y-5 text-center py-6">
            <div>
              <h2 className="text-lg font-bold text-[#133E48]">Breathing Practices</h2>
              <p className="text-xs text-[#5C7075]">Short guided exercises for centering and nervous system regulation</p>
            </div>

            <div className="w-48 h-48 mx-auto rounded-full bg-[#FAF7F2] border-4 border-[#3E8E62] flex flex-col items-center justify-center shadow-inner transition-all duration-1000 transform">
              <Wind className="w-8 h-8 text-[#3E8E62] mb-1 animate-pulse" />
              <span className="text-base font-bold text-[#133E48]">{breathingPhase}</span>
              <span className="text-[11px] text-[#5C7075]">4 seconds</span>
            </div>

            <p className="text-xs text-[#5C7075] max-w-xs mx-auto">
              Follow the rhythmic circle. Inhale calmness, hold steadily, and release any tension gently.
            </p>
          </div>
        )}

        {/* 9. MOON REFLECTION */}
        {activeView === 'moon_reflection' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#FFF9ED] border border-[#F0D59E] rounded-xl text-xs text-[#805B10] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#E06D53]" />
              <span>
                <strong>Symbolic Notice:</strong> Moon Reflection is an optional symbolic reflection space, kept strictly separate from biological menstrual cycle data.
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E8DFD5] rounded-xl p-5 shadow-xs text-center space-y-3">
              <Moon className="w-8 h-8 text-[#F4C542] mx-auto" />
              <h3 className="text-base font-bold text-[#133E48]">Waxing Crescent</h3>
              <p className="text-xs text-[#5C7075] max-w-sm mx-auto leading-relaxed">
                A symbolic invitation to notice what seeds of curiosity or creative intentions you might feel drawn to explore right now.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
