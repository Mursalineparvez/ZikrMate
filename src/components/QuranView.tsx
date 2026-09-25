import React, { useState, useRef, useEffect } from 'react';
import { QURAN_SURAHS, QuranSurah } from '../utils/quranData';
import { Play, Pause, Search, Volume2, Bookmark, Check, BookOpen, ChevronRight, ArrowLeft, Type } from 'lucide-react';
import { soundHaptics } from '../utils/audioHaptics';

interface QuranViewProps {
  soundEnabled: boolean;
}

export const QuranView: React.FC<QuranViewProps> = ({ soundEnabled }) => {
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('large');
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zikrmate_quran_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter surahs
  const filteredSurahs = QURAN_SURAHS.filter(
    (s) =>
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.includes(searchQuery) ||
      s.number.toString().includes(searchQuery)
  );

  // Handle Audio playback
  const togglePlayAudio = () => {
    if (!selectedSurah?.audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(selectedSurah.audioUrl);
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current && audioRef.current.duration) {
          setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      };
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setAudioProgress(0);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Clean audio when surah changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setAudioProgress(0);
    }
  }, [selectedSurah]);

  const toggleBookmark = (surahNum: number, ayahNum: number) => {
    const key = `${surahNum}:${ayahNum}`;
    let updated: string[];
    if (bookmarkedAyahs.includes(key)) {
      updated = bookmarkedAyahs.filter((k) => k !== key);
    } else {
      updated = [...bookmarkedAyahs, key];
      if (soundEnabled) soundHaptics.playMilestone();
    }
    setBookmarkedAyahs(updated);
    try {
      localStorage.setItem('zikrmate_quran_bookmarks', JSON.stringify(updated));
    } catch {}
  };

  const handleCopyAyah = (arabic: string, translation: string, ayahNum: number) => {
    const text = `${arabic}\n\n"${translation}"\n[Surah ${selectedSurah?.englishName} (${selectedSurah?.number}:${ayahNum})]`;
    navigator.clipboard.writeText(text);
    setCopiedAyah(ayahNum);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Quran Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/80 border border-emerald-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>القرآن الكريم • Al-Qur'an al-Kareem</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Noble Quran Recitation &amp; Reader
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Authentic Uthmani Arabic script, phonetically accurate transliteration, and English translations with renowned Qari audio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTransliteration(!showTransliteration)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition active:scale-95 cursor-pointer ${
                showTransliteration
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Transliteration: {showTransliteration ? 'ON' : 'OFF'}
            </button>

            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <Type className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 text-xs rounded-lg ${fontSize === 'normal' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 text-xs rounded-lg font-bold ${fontSize === 'large' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xl')}
                className={`px-2 py-0.5 text-xs rounded-lg font-black ${fontSize === 'xl' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                A++
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Surah Detail / Reader View */}
      {selectedSurah ? (
        <div className="space-y-6">
          {/* Back button and Surah Top Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
            <button
              onClick={() => setSelectedSurah(null)}
              className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/40 transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Surah List</span>
            </button>

            <div className="text-center">
              <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                <span>{selectedSurah.number}. {selectedSurah.englishName}</span>
                <span className="font-arabic text-emerald-400 text-lg">({selectedSurah.name})</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {selectedSurah.englishNameTranslation} • {selectedSurah.numberOfAyahs} Verses • {selectedSurah.revelationType}
              </p>
            </div>

            {/* Audio Recitation Player Button */}
            {selectedSurah.audioUrl && (
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayAudio}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition active:scale-95 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isPlaying ? 'Pause Audio' : 'Play Recitation'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Audio Progress Bar if playing */}
          {isPlaying && (
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-300"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
          )}

          {/* Bismillah Calligraphy (except Surah 9) */}
          {selectedSurah.number !== 9 && selectedSurah.number !== 1 && (
            <div className="text-center py-6 px-4 bg-slate-900/40 rounded-2xl border border-emerald-900/30">
              <div className="font-arabic text-2xl sm:text-3xl text-emerald-300 leading-relaxed">
                بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </div>
              <p className="text-xs text-slate-400 mt-1 italic">
                In the name of Allah, the Entirely Merciful, the Especially Merciful.
              </p>
            </div>
          )}

          {/* Ayahs List */}
          <div className="space-y-4">
            {selectedSurah.ayahs.map((ayah) => {
              const isBookmarked = bookmarkedAyahs.includes(`${selectedSurah.number}:${ayah.number}`);
              const isCopied = copiedAyah === ayah.number;

              const arabicSizeClass =
                fontSize === 'normal'
                  ? 'text-xl sm:text-2xl leading-loose'
                  : fontSize === 'large'
                  ? 'text-2xl sm:text-3xl leading-loose'
                  : 'text-3xl sm:text-4xl leading-loose';

              return (
                <div
                  key={ayah.number}
                  className={`p-5 rounded-2xl border transition-all duration-200 ${
                    isBookmarked
                      ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                      <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-[11px] font-bold text-emerald-300">
                        {ayah.number}
                      </span>
                      <span>Verse {ayah.number}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleBookmark(selectedSurah.number, ayah.number)}
                        className={`p-1.5 rounded-lg transition active:scale-90 cursor-pointer ${
                          isBookmarked
                            ? 'text-amber-400 bg-amber-950/40 border border-amber-500/30'
                            : 'text-slate-400 hover:text-white bg-slate-800/60'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Ayah'}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => handleCopyAyah(ayah.arabic, ayah.translation, ayah.number)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 transition active:scale-90 cursor-pointer"
                        title="Copy Ayah"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookOpen className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Arabic Text */}
                  <div className={`text-right font-arabic font-bold text-slate-100 ${arabicSizeClass} my-3`}>
                    {ayah.arabic}
                  </div>

                  {/* Transliteration */}
                  {showTransliteration && (
                    <div className="text-xs sm:text-sm text-teal-300/80 italic font-mono mb-2">
                      {ayah.transliteration}
                    </div>
                  )}

                  {/* Translation */}
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {ayah.translation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Surahs Selection Grid */
        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Surah by name (e.g. Al-Fatihah, Ya-Sin, Al-Mulk, Al-Kahf)..."
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {filteredSurahs.map((surah) => (
              <div
                key={surah.number}
                onClick={() => setSelectedSurah(surah)}
                className="group p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:shadow-emerald-950/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center font-bold text-xs text-emerald-400 group-hover:bg-emerald-900/80 group-hover:scale-105 transition">
                    {surah.number}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                      {surah.englishName}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {surah.englishNameTranslation} • {surah.numberOfAyahs} Verses
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-arabic text-lg font-bold text-emerald-400 group-hover:text-emerald-300 transition">
                    {surah.name}
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    {surah.revelationType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
