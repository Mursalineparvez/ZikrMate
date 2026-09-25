import React, { useState } from 'react';
import { AUTHENTIC_HADITHS } from '../utils/hadithData';
import { HadithItem } from '../types';
import { BookOpen, Search, Bookmark, Check, Copy, Sparkles, Filter, Heart, Share2 } from 'lucide-react';
import { soundHaptics } from '../utils/audioHaptics';

interface HadithViewProps {
  soundEnabled: boolean;
}

export const HadithView: React.FC<HadithViewProps> = ({ soundEnabled }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favoriteHadiths, setFavoriteHadiths] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zikrmate_hadith_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Featured Hadith of the Day (deterministically based on day of year)
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const dailyHadith = AUTHENTIC_HADITHS[dayOfYear % AUTHENTIC_HADITHS.length];

  const topics = [
    'all',
    'Faith & Tawheed',
    'Salah & Purification',
    'Character & Akhlaq',
    'Dhikr & Dua',
    'Charity & Kindness',
    'Patience & Trials',
    'Repentance & Mercy',
  ];

  // Filter hadiths
  const filteredHadiths = AUTHENTIC_HADITHS.filter((h) => {
    const matchesTopic = selectedTopic === 'all' || h.topic === selectedTopic;
    const matchesSearch =
      h.englishTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.narrator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.book.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.arabicText.includes(searchQuery);
    return matchesTopic && matchesSearch;
  });

  const toggleFavorite = (id: string) => {
    let updated: string[];
    if (favoriteHadiths.includes(id)) {
      updated = favoriteHadiths.filter((favId) => favId !== id);
    } else {
      updated = [...favoriteHadiths, id];
      if (soundEnabled) soundHaptics.playMilestone();
    }
    setFavoriteHadiths(updated);
    try {
      localStorage.setItem('zikrmate_hadith_favorites', JSON.stringify(updated));
    } catch {}
  };

  const handleCopyHadith = (hadith: HadithItem) => {
    const text = `Narrated by ${hadith.narrator}:\n\n"${hadith.englishTranslation}"\n\n[${hadith.book} ${hadith.hadithNumber} - Grade: ${hadith.grade}]\n${hadith.arabicText}`;
    navigator.clipboard.writeText(text);
    setCopiedId(hadith.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hadith Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/80 border border-emerald-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>الحديث النبوي الشريف • Prophetic Traditions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Authentic Hadith Treasury
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Priceless sayings, guidance, and character insights of the Prophet Muhammad ﷺ from Sahih al-Bukhari, Sahih Muslim, and classical compendiums.
          </p>
        </div>
      </div>

      {/* Featured: Hadith of the Day */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-900/50">
          <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Hadith of the Day</span>
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 font-semibold">
            {dailyHadith.book} {dailyHadith.hadithNumber}
          </span>
        </div>

        <div className="text-right font-arabic text-xl sm:text-2xl text-emerald-200 leading-relaxed font-bold my-3">
          {dailyHadith.arabicText}
        </div>

        <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed my-3">
          "{dailyHadith.englishTranslation}"
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
          <span className="font-semibold text-emerald-400/90">
            Narrated by {dailyHadith.narrator}
          </span>
          <button
            onClick={() => handleCopyHadith(dailyHadith)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 cursor-pointer"
          >
            {copiedId === dailyHadith.id ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Share Hadith</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search & Topic Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hadiths by keywords, narrator, or wisdom..."
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
          />
        </div>

        {/* Topic Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 cursor-pointer ${
                selectedTopic === topic
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {topic === 'all' ? 'All Topics' : topic}
            </button>
          ))}
        </div>
      </div>

      {/* Hadith Cards Grid */}
      <div className="space-y-4">
        {filteredHadiths.map((hadith) => {
          const isFavorite = favoriteHadiths.includes(hadith.id);
          const isCopied = copiedId === hadith.id;

          return (
            <div
              key={hadith.id}
              className={`p-5 sm:p-6 rounded-3xl border transition-all duration-200 ${
                isFavorite
                  ? 'bg-slate-900/95 border-amber-500/40 shadow-lg'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 font-semibold border border-emerald-800/50">
                    {hadith.book} #{hadith.hadithNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-teal-950 text-teal-300 font-medium text-[11px]">
                    {hadith.grade}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleFavorite(hadith.id)}
                    className={`p-1.5 rounded-lg transition active:scale-90 cursor-pointer ${
                      isFavorite
                        ? 'text-rose-400 bg-rose-950/40 border border-rose-500/30'
                        : 'text-slate-400 hover:text-white bg-slate-800/60'
                    }`}
                    title={isFavorite ? 'Remove Favorite' : 'Save to Favorites'}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleCopyHadith(hadith)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 transition active:scale-90 cursor-pointer"
                    title="Copy Hadith"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Arabic Text */}
              <div className="text-right font-arabic font-bold text-slate-100 text-lg sm:text-xl leading-loose my-3">
                {hadith.arabicText}
              </div>

              {/* English Translation */}
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans mb-3">
                "{hadith.englishTranslation}"
              </p>

              {/* Narrator */}
              <div className="text-xs text-emerald-400/90 font-medium">
                — Narrated by <span className="font-semibold text-white">{hadith.narrator}</span>
              </div>

              {/* Reflection / Commentary */}
              {hadith.reflection && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-start gap-2 bg-emerald-950/20 p-3 rounded-2xl">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="italic leading-relaxed">{hadith.reflection}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
