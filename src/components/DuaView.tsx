import React, { useState } from 'react';
import { AUTHENTIC_DUAS } from '../utils/duasData';
import { DuaCategory, DuaItem, ZikrItem } from '../types';
import { Search, Plus, Copy, Check, Sparkles, BookOpen, Volume2, Bookmark, CheckCircle2 } from 'lucide-react';
import { soundHaptics } from '../utils/audioHaptics';

interface DuaViewProps {
  onAddDuaToCounters: (dua: DuaItem) => void;
  activeCounters: ZikrItem[];
  soundEnabled: boolean;
}

export const DuaView: React.FC<DuaViewProps> = ({
  onAddDuaToCounters,
  activeCounters,
  soundEnabled,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inlineCounts, setInlineCounts] = useState<{ [key: string]: number }>({});

  const categories = [
    { id: 'all', label: 'All Duas' },
    { id: 'morning_evening', label: 'Morning & Evening' },
    { id: 'salat', label: 'Salat & Prayer' },
    { id: 'sleep_wake', label: 'Sleep & Wakeup' },
    { id: 'protection', label: 'Protection & Ruqyah' },
    { id: 'forgiveness', label: 'Forgiveness (Istighfar)' },
    { id: 'hardship', label: 'Anxiety & Hardship' },
    { id: 'daily_living', label: 'Daily Life' },
  ];

  // Filter duas
  const filteredDuas = AUTHENTIC_DUAS.filter((dua) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      dua.category === selectedCategory ||
      (selectedCategory === 'morning_evening' && dua.category.includes('morning'));
    const matchesSearch =
      dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.arabic.includes(searchQuery) ||
      (dua.virtue && dua.virtue.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleInlineIncrement = (duaId: string, targetCount: number = 33) => {
    if (soundEnabled) soundHaptics.playTap();
    soundHaptics.vibrate(35);

    setInlineCounts((prev) => {
      const current = prev[duaId] || 0;
      const next = current + 1;
      if (next === targetCount && soundEnabled) {
        soundHaptics.playMilestone();
      }
      return { ...prev, [duaId]: next };
    });
  };

  const handleCopyDua = (dua: DuaItem) => {
    const text = `${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n"${dua.translation}"\n\nReference: ${dua.reference}`;
    navigator.clipboard.writeText(text);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Dua Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/80 border border-emerald-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>الأدعية المأثورة • Prophetic Supplications</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Masnoon &amp; Quranic Duas
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Authentic supplications from the Quran and Sunnah with tap repetition counters and one-touch integration with your Zikr Tasbeeh counters.
          </p>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search duas by title, meaning, Arabic, or virtue..."
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duas Cards Grid */}
      <div className="space-y-4">
        {filteredDuas.map((dua) => {
          const isAdded = activeCounters.some(
            (c) => c.name.toLowerCase() === dua.title.toLowerCase() || c.id === dua.id
          );
          const currentCount = inlineCounts[dua.id] || 0;
          const target = dua.suggestedCount || 33;
          const isCompleted = currentCount >= target;

          return (
            <div
              key={dua.id}
              className={`p-5 sm:p-6 rounded-3xl border transition-all duration-200 ${
                isCompleted
                  ? 'bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-800/80">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {dua.title}
                  </h3>
                  {dua.timing && (
                    <span className="text-xs text-emerald-400 font-medium mt-0.5 block">
                      {dua.timing}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyDua(dua)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 border border-slate-700/50 transition active:scale-90 cursor-pointer"
                    title="Copy Dua"
                  >
                    {copiedId === dua.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Add to Counters Button */}
                  <button
                    onClick={() => onAddDuaToCounters(dua)}
                    disabled={isAdded}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40 cursor-default opacity-80'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>In Counters</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>+ Counter</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Arabic Script */}
              <div className="text-right font-arabic font-bold text-emerald-200 text-xl sm:text-2xl leading-loose my-3">
                {dua.arabic}
              </div>

              {/* Transliteration */}
              <div className="text-xs sm:text-sm text-teal-300/90 italic font-mono mb-2">
                {dua.transliteration}
              </div>

              {/* Translation */}
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans mb-3">
                "{dua.translation}"
              </p>

              {/* Virtue & Reference */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                <span className="font-semibold text-emerald-400/90">
                  {dua.reference}
                </span>

                {/* Inline Quick Repetition Bead */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    Recited: <strong className="text-white">{currentCount}</strong> / {target}x
                  </span>
                  <button
                    onClick={() => handleInlineIncrement(dua.id, target)}
                    className="px-3 py-1 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 font-bold text-xs active:scale-95 transition cursor-pointer flex items-center gap-1"
                  >
                    <span>+1 Bead</span>
                  </button>
                </div>
              </div>

              {dua.virtue && (
                <div className="mt-3 p-3 rounded-2xl bg-emerald-950/30 border border-emerald-900/40 text-xs text-emerald-300/90 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{dua.virtue}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
