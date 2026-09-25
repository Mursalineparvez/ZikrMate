import React, { useState } from 'react';
import { AUTHENTIC_HADITHS } from '../utils/hadithData';
import { HadithItem, ThemeMode } from '../types';
import { BookOpen, Search, Bookmark, Check, Copy, Sparkles, Filter, Heart, Share2 } from 'lucide-react';
import { soundHaptics } from '../utils/audioHaptics';

interface HadithViewProps {
  soundEnabled: boolean;
  themeMode?: ThemeMode;
}

export const HadithView: React.FC<HadithViewProps> = ({ soundEnabled, themeMode = 'day' }) => {
  const isDay = themeMode === 'day';
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
      {/* Hadith Header Banner matching Home Page */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#144d52] via-[#1a5e64] to-[#257277] border border-teal-400/30 p-5 sm:p-6 shadow-xl text-white">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-teal-100 text-xs font-semibold mb-2 backdrop-blur-md">
            <BookOpen className="w-3.5 h-3.5" />
            <span>الحديث النبوي الشريف • Prophetic Traditions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight drop-shadow-sm">
            Authentic Hadith Treasury
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-xl">
            Priceless sayings, guidance, and character insights of the Prophet Muhammad ﷺ from Sahih al-Bukhari, Sahih Muslim, and classical compendiums.
          </p>
        </div>
      </div>

      {/* Featured: Hadith of the Day */}
      <div
        className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden ${
          isDay
            ? 'bg-white border-[#dcebe8] text-[#103e42]'
            : 'bg-[#0e2f36] border-[#1a515c] text-white'
        }`}
      >
        <div
          className={`flex items-center justify-between pb-3 mb-3 border-b ${
            isDay ? 'border-[#e8f3f1]' : 'border-[#17434b]'
          }`}
        >
          <span className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Hadith of the Day</span>
          </span>
          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
              isDay
                ? 'bg-[#e6f3f2] text-[#1c6469] border-[#cbe4e1]'
                : 'bg-[#0a262c] text-[#2dd4bf] border-[#184850]'
            }`}
          >
            {dailyHadith.book} {dailyHadith.hadithNumber}
          </span>
        </div>

        <div
          dir="rtl"
          className={`font-arabic text-xl sm:text-2xl leading-relaxed font-bold my-3 ${
            isDay ? 'text-[#0d4f54]' : 'text-teal-200'
          }`}
        >
          {dailyHadith.arabicText}
        </div>

        <p
          className={`text-sm sm:text-base font-medium leading-relaxed my-3 ${
            isDay ? 'text-[#1e3b3e]' : 'text-slate-200'
          }`}
        >
          "{dailyHadith.englishTranslation}"
        </p>

        <div
          className={`flex items-center justify-between pt-3 border-t text-xs ${
            isDay ? 'border-[#e8f3f1] text-[#507579]' : 'border-[#17434b] text-teal-200/80'
          }`}
        >
          <span className="font-semibold text-teal-700 dark:text-teal-300">
            Narrated by {dailyHadith.narrator}
          </span>
          <button
            onClick={() => handleCopyHadith(dailyHadith)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition active:scale-95 cursor-pointer ${
              isDay
                ? 'bg-[#f0f7f6] hover:bg-[#e4f2f0] text-[#1c6469] border-[#d2ece9]'
                : 'bg-[#0a262c] hover:bg-[#123e47] text-teal-200 border-[#184850]'
            }`}
          >
            {copiedId === dailyHadith.id ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-teal-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-teal-600" />
                <span>Share Hadith</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search & Topic Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${
            isDay ? 'text-[#7ca2a7]' : 'text-teal-400'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hadiths by keywords, narrator, or wisdom..."
            className={`w-full rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none transition shadow-sm border ${
              isDay
                ? 'bg-white border-[#cde5e2] text-[#103e42] placeholder-[#7ca2a7] focus:border-[#1c6469]'
                : 'bg-[#0e2f36] border-[#1a515c] text-white placeholder-teal-600 focus:border-teal-400'
            }`}
          />
        </div>

        {/* Topic Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 cursor-pointer border ${
                selectedTopic === topic
                  ? 'bg-[#1c6469] text-white border-[#1c6469] shadow-md shadow-[#135d66]/20'
                  : isDay
                  ? 'bg-white hover:bg-[#eef7f6] text-[#2d6a70] border-[#d2ece9]'
                  : 'bg-[#0e2f36] text-[#8ebac0] hover:text-white border-[#1a515c]'
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
              className={`p-5 sm:p-6 rounded-3xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                isFavorite
                  ? isDay
                    ? 'bg-[#fffdf5] border-amber-300 shadow-sm'
                    : 'bg-[#142e2b] border-amber-500/50 shadow-sm'
                  : isDay
                  ? 'bg-white border-[#dcebe8] hover:border-[#b5dcd6]'
                  : 'bg-[#0e2f36] border-[#1a515c] hover:border-[#266e7c]'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-3 mb-3 border-b text-xs ${
                  isDay ? 'border-[#e8f3f1]' : 'border-[#17434b]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full font-semibold border ${
                      isDay
                        ? 'bg-[#e6f3f2] text-[#1c6469] border-[#cbe4e1]'
                        : 'bg-[#0a262c] text-[#2dd4bf] border-[#184850]'
                    }`}
                  >
                    {hadith.book} #{hadith.hadithNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg font-medium text-[11px] border ${
                      isDay
                        ? 'bg-[#f0f7f6] text-[#2d6a70] border-[#d2ece9]'
                        : 'bg-[#0a262c] text-teal-300 border-[#184850]'
                    }`}
                  >
                    {hadith.grade}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleFavorite(hadith.id)}
                    className={`p-1.5 rounded-lg transition active:scale-90 cursor-pointer border ${
                      isFavorite
                        ? 'text-rose-500 bg-rose-50 border-rose-200'
                        : isDay
                        ? 'text-[#7ca2a7] hover:text-rose-500 bg-[#f0f7f6] border-[#d2ece9]'
                        : 'text-teal-400 hover:text-white bg-[#0a262c] border-[#184850]'
                    }`}
                    title={isFavorite ? 'Remove Favorite' : 'Save to Favorites'}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleCopyHadith(hadith)}
                    className={`p-1.5 rounded-lg transition active:scale-90 cursor-pointer border ${
                      isDay
                        ? 'text-[#507579] hover:text-[#1c6469] bg-[#f0f7f6] border-[#d2ece9]'
                        : 'text-teal-300 hover:text-white bg-[#0a262c] border-[#184850]'
                    }`}
                    title="Copy Hadith"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Arabic Hadith */}
              <div
                dir="rtl"
                className={`font-arabic text-lg sm:text-xl font-bold leading-relaxed mb-3 ${
                  isDay ? 'text-[#0d4f54]' : 'text-teal-200'
                }`}
              >
                {hadith.arabicText}
              </div>

              {/* English Translation */}
              <p
                className={`text-xs sm:text-sm font-sans leading-relaxed ${
                  isDay ? 'text-[#1e3b3e]' : 'text-slate-200'
                }`}
              >
                "{hadith.englishTranslation}"
              </p>

              {/* Narrator & Topic Footer */}
              <div
                className={`flex items-center justify-between pt-3 mt-3 border-t text-[11px] ${
                  isDay ? 'border-[#e8f3f1] text-[#507579]' : 'border-[#17434b] text-teal-200/80'
                }`}
              >
                <span>Narrated by: <strong className={isDay ? 'text-[#103e42]' : 'text-white'}>{hadith.narrator}</strong></span>
                <span
                  className={`px-2 py-0.5 rounded-full border ${
                    isDay
                      ? 'bg-[#f0f7f6] text-[#2d6a70] border-[#d2ece9]'
                      : 'bg-[#0a262c] text-teal-300 border-[#184850]'
                  }`}
                >
                  {hadith.topic}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
