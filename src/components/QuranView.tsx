import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ALL_114_SURAHS,
  SurahMeta,
} from '../utils/quran114List';
import {
  fetchSurah,
  getCachedSurah,
  QuranSurahDetail,
  QuranAyah,
  QURAN_RECITERS,
  POPULAR_SURAHS_NUMBERS,
} from '../utils/quranService';
import { OFFLINE_FALLBACK_SURAHS } from '../utils/quranData';
import {
  Play,
  Pause,
  Search,
  Volume2,
  VolumeX,
  Bookmark,
  Check,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Type,
  Share2,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  ArrowUp,
  X,
  RefreshCw,
  Compass,
} from 'lucide-react';
import { soundHaptics } from '../utils/audioHaptics';

interface QuranViewProps {
  soundEnabled: boolean;
}

type TabType = 'all' | 'meccan' | 'medinan' | 'popular' | 'bookmarks';
type FontSize = 'normal' | 'large' | 'xl' | '2xl';

interface BookmarkItem {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  surahEnglishName: string;
  arabicSnippet?: string;
  translationSnippet?: string;
  timestamp: number;
}

export const QuranView: React.FC<QuranViewProps> = ({ soundEnabled }) => {
  // Navigation & Surah State
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [surahDetail, setSurahDetail] = useState<QuranSurahDetail | null>(null);
  const [isLoadingSurah, setIsLoadingSurah] = useState(false);
  const [surahLoadError, setSurahLoadError] = useState<string | null>(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJuz, setSelectedJuz] = useState<number | 'all'>('all');

  // Reader Settings
  const [fontSize, setFontSize] = useState<FontSize>('large');
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [jumpVerseInput, setJumpVerseInput] = useState('');

  // Audio Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingMode, setPlayingMode] = useState<'surah' | 'ayah' | 'none'>('none');
  const [currentPlayingAyahNum, setCurrentPlayingAyahNum] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // User Actions
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Bookmarks persistence
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem('zikrmate_quran_bookmarks_v2');
      if (saved) return JSON.parse(saved);
      // Migrate legacy string array if exists
      const legacy = localStorage.getItem('zikrmate_quran_bookmarks');
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy) as string[];
        return parsedLegacy.map((item) => {
          const [s, a] = item.split(':').map(Number);
          const meta = ALL_114_SURAHS.find((m) => m.number === s);
          return {
            surahNumber: s,
            ayahNumber: a,
            surahName: meta?.name || `Surah ${s}`,
            surahEnglishName: meta?.englishName || `Surah ${s}`,
            timestamp: Date.now(),
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  });

  // Last Read persistence
  const [lastRead, setLastRead] = useState<{
    surahNumber: number;
    ayahNumber: number;
    surahName: string;
    surahEnglishName: string;
    timestamp: number;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('zikrmate_quran_last_read');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Audio Element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Watch scroll for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Save bookmarks
  const saveBookmarks = (newBookmarks: BookmarkItem[]) => {
    setBookmarks(newBookmarks);
    try {
      localStorage.setItem('zikrmate_quran_bookmarks_v2', JSON.stringify(newBookmarks));
    } catch {}
  };

  // Toggle Bookmark
  const toggleBookmark = (surahNum: number, ayahNum: number, arabic?: string, translation?: string) => {
    const exists = bookmarks.some((b) => b.surahNumber === surahNum && b.ayahNumber === ayahNum);
    const meta = ALL_114_SURAHS.find((s) => s.number === surahNum);
    if (exists) {
      const updated = bookmarks.filter((b) => !(b.surahNumber === surahNum && b.ayahNumber === ayahNum));
      saveBookmarks(updated);
    } else {
      const updated: BookmarkItem[] = [
        ...bookmarks,
        {
          surahNumber: surahNum,
          ayahNumber: ayahNum,
          surahName: meta?.name || `Surah ${surahNum}`,
          surahEnglishName: meta?.englishName || `Surah ${surahNum}`,
          arabicSnippet: arabic?.slice(0, 70),
          translationSnippet: translation?.slice(0, 90),
          timestamp: Date.now(),
        },
      ];
      saveBookmarks(updated);
      if (soundEnabled) soundHaptics.playMilestone();
    }
  };

  const isAyahBookmarked = (surahNum: number, ayahNum: number) => {
    return bookmarks.some((b) => b.surahNumber === surahNum && b.ayahNumber === ayahNum);
  };

  // Save Last Read
  const recordLastRead = (surahNum: number, ayahNum: number) => {
    const meta = ALL_114_SURAHS.find((s) => s.number === surahNum);
    const data = {
      surahNumber: surahNum,
      ayahNumber: ayahNum,
      surahName: meta?.name || `Surah ${surahNum}`,
      surahEnglishName: meta?.englishName || `Surah ${surahNum}`,
      timestamp: Date.now(),
    };
    setLastRead(data);
    try {
      localStorage.setItem('zikrmate_quran_last_read', JSON.stringify(data));
    } catch {}
  };

  // Load Surah
  const loadSurah = async (surahNum: number, targetAyah?: number) => {
    setSelectedSurahNumber(surahNum);
    setIsLoadingSurah(true);
    setSurahLoadError(null);
    stopAudio();

    // Check cached first
    const cached = getCachedSurah(surahNum);
    if (cached) {
      setSurahDetail(cached);
      setIsLoadingSurah(false);
      recordLastRead(surahNum, targetAyah || 1);
      if (targetAyah) {
        setTimeout(() => scrollToAyah(targetAyah), 300);
      }
      return;
    }

    try {
      const data = await fetchSurah(surahNum, selectedReciter);
      setSurahDetail(data);
      recordLastRead(surahNum, targetAyah || 1);
      if (targetAyah) {
        setTimeout(() => scrollToAyah(targetAyah), 300);
      }
    } catch (err: any) {
      console.warn('Network error loading surah, checking offline fallbacks', err);
      // Check offline fallback
      const fallbackAyahs = OFFLINE_FALLBACK_SURAHS[surahNum];
      const meta = ALL_114_SURAHS.find((s) => s.number === surahNum);
      if (fallbackAyahs && meta) {
        setSurahDetail({
          ...meta,
          ayahs: fallbackAyahs,
        });
      } else {
        setSurahLoadError(
          err.message || 'Unable to fetch verses. Please check your internet connection.'
        );
      }
    } finally {
      setIsLoadingSurah(false);
    }
  };

  // Audio Playback Handling
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlaying(false);
    setPlayingMode('none');
    setCurrentPlayingAyahNum(null);
    setAudioProgress(0);
    setAudioCurrentTime(0);
  };

  // Toggle Full Surah Audio
  const toggleSurahAudio = () => {
    if (!surahDetail) return;

    if (isPlaying && playingMode === 'surah') {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    stopAudio();

    const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${selectedReciter}/${surahDetail.number}.mp3`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setAudioCurrentTime(audio.currentTime);
        setAudioDuration(audio.duration);
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      stopAudio();
    };

    audio.onerror = () => {
      stopAudio();
    };

    audio.play().then(() => {
      setIsPlaying(true);
      setPlayingMode('surah');
    }).catch(() => {
      stopAudio();
    });
  };

  // Play Individual Ayah Audio
  const playAyahAudio = (ayah: QuranAyah) => {
    if (isPlaying && playingMode === 'ayah' && currentPlayingAyahNum === ayah.number) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    stopAudio();

    const audioUrl = `https://cdn.islamic.network/quran/audio/128/${selectedReciter}/${ayah.globalNumber}.mp3`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setAudioCurrentTime(audio.currentTime);
        setAudioDuration(audio.duration);
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      // Auto-play next verse if enabled
      if (surahDetail && ayah.number < surahDetail.numberOfAyahs) {
        const nextAyah = surahDetail.ayahs.find((a) => a.number === ayah.number + 1);
        if (nextAyah) {
          playAyahAudio(nextAyah);
          if (autoScroll) scrollToAyah(nextAyah.number);
          return;
        }
      }
      stopAudio();
    };

    audio.onerror = () => {
      stopAudio();
    };

    audio.play().then(() => {
      setIsPlaying(true);
      setPlayingMode('ayah');
      setCurrentPlayingAyahNum(ayah.number);
      if (autoScroll) scrollToAyah(ayah.number);
    }).catch(() => {
      stopAudio();
    });
  };

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Scroll to specific Ayah
  const scrollToAyah = (ayahNum: number) => {
    const el = ayahRefs.current.get(ayahNum);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpVerseInput, 10);
    if (surahDetail && !isNaN(num) && num >= 1 && num <= surahDetail.numberOfAyahs) {
      scrollToAyah(num);
      setJumpVerseInput('');
    }
  };

  // Copy Ayah
  const handleCopyAyah = (ayah: QuranAyah) => {
    if (!surahDetail) return;
    const text = `${ayah.arabic}\n\n"${ayah.translation}"\n[Surah ${surahDetail.englishName} (${surahDetail.number}:${ayah.number})]`;
    navigator.clipboard.writeText(text);
    setCopiedAyah(ayah.number);
    if (soundEnabled) soundHaptics.playTap();
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  // Share Ayah
  const handleShareAyah = async (ayah: QuranAyah) => {
    if (!surahDetail) return;
    const shareData = {
      title: `Surah ${surahDetail.englishName} ${surahDetail.number}:${ayah.number}`,
      text: `${ayah.arabic}\n\n"${ayah.translation}"\n- Surah ${surahDetail.englishName} (${surahDetail.number}:${ayah.number})`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      handleCopyAyah(ayah);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  // Filtered Surahs list
  const filteredSurahs = useMemo(() => {
    return ALL_114_SURAHS.filter((s) => {
      // Tab filter
      if (activeTab === 'meccan' && s.revelationType !== 'Meccan') return false;
      if (activeTab === 'medinan' && s.revelationType !== 'Medinan') return false;
      if (activeTab === 'popular' && !POPULAR_SURAHS_NUMBERS.includes(s.number)) return false;

      // Juz filter
      if (selectedJuz !== 'all' && s.startJuz !== selectedJuz) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const numMatch = s.number.toString() === q;
        const nameMatch = s.englishName.toLowerCase().includes(q);
        const transMatch = s.englishNameTranslation.toLowerCase().includes(q);
        const arabicMatch = s.name.includes(q) || s.fullNameArabic.includes(q);
        return numMatch || nameMatch || transMatch || arabicMatch;
      }

      return true;
    });
  }, [activeTab, searchQuery, selectedJuz]);

  // Next / Previous Surah helper
  const navigateToSurah = (direction: 'next' | 'prev') => {
    if (!selectedSurahNumber) return;
    const target = direction === 'next' ? selectedSurahNumber + 1 : selectedSurahNumber - 1;
    if (target >= 1 && target <= 114) {
      loadSurah(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Arabic font size classes
  const arabicFontClass = {
    normal: 'text-xl sm:text-2xl leading-[2.2]',
    large: 'text-2xl sm:text-3xl leading-[2.4]',
    xl: 'text-3xl sm:text-4xl leading-[2.6]',
    '2xl': 'text-4xl sm:text-5xl leading-[2.8]',
  }[fontSize];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* ======================================================== */}
      {/* 1. READER VIEW (When a Surah is selected)                */}
      {/* ======================================================== */}
      {selectedSurahNumber !== null ? (
        <div className="space-y-5">
          {/* Top Sticky Bar */}
          <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  stopAudio();
                  setSelectedSurahNumber(null);
                  setSurahDetail(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition active:scale-95 cursor-pointer border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">All 114 Surahs</span>
                <span className="sm:hidden">Index</span>
              </button>

              {/* Quick Surah Dropdown Selector */}
              <select
                value={selectedSurahNumber}
                onChange={(e) => loadSurah(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[150px] sm:max-w-[200px] truncate"
              >
                {ALL_114_SURAHS.map((s) => (
                  <option key={s.number} value={s.number} className="bg-slate-900 text-slate-200">
                    {s.number}. {s.englishName} ({s.numberOfAyahs})
                  </option>
                ))}
              </select>
            </div>

            {/* Jump to Verse & Settings */}
            <div className="flex items-center gap-2">
              {/* Jump to Verse Form */}
              <form onSubmit={handleJumpSubmit} className="hidden md:flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max={surahDetail?.numberOfAyahs || 286}
                  placeholder={`Ayah (1-${surahDetail?.numberOfAyahs || '...'})`}
                  value={jumpVerseInput}
                  onChange={(e) => setJumpVerseInput(e.target.value)}
                  className="w-24 px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition active:scale-95 cursor-pointer"
                >
                  Go
                </button>
              </form>

              {/* Font Size Selector */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                <Type className="w-3.5 h-3.5 text-slate-400 ml-1" />
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-1.5 py-0.5 text-xs rounded-lg ${
                    fontSize === 'normal' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'
                  }`}
                  title="Normal font"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-1.5 py-0.5 text-xs rounded-lg ${
                    fontSize === 'large' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'
                  }`}
                  title="Large font"
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize('xl')}
                  className={`px-1.5 py-0.5 text-xs rounded-lg ${
                    fontSize === 'xl' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'
                  }`}
                  title="Extra Large font"
                >
                  A++
                </button>
              </div>

              {/* Settings Drawer Toggle */}
              <button
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className={`p-2 rounded-xl border transition active:scale-95 cursor-pointer ${
                  showSettingsDrawer
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Reading & Audio Settings"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reading & Reciter Drawer */}
          {showSettingsDrawer && (
            <div className="bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Reader &amp; Audio Customization</span>
                </h4>
                <button
                  onClick={() => setShowSettingsDrawer(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Reciter Picker */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                    Noble Reciter (Qari)
                  </label>
                  <select
                    value={selectedReciter}
                    onChange={(e) => {
                      setSelectedReciter(e.target.value);
                      stopAudio();
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {QURAN_RECITERS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.arabicName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Display Toggles */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                    Display Translations
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowTranslation(!showTranslation)}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                        showTranslation
                          ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                          : 'bg-slate-950 text-slate-500 border-slate-800'
                      }`}
                    >
                      English: {showTranslation ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => setShowTransliteration(!showTransliteration)}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                        showTransliteration
                          ? 'bg-teal-600/30 text-teal-300 border-teal-500'
                          : 'bg-slate-950 text-slate-500 border-slate-800'
                      }`}
                    >
                      Pronounce: {showTransliteration ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Auto Scroll Toggle */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                    Audio Sync
                  </label>
                  <button
                    onClick={() => setAutoScroll(!autoScroll)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      autoScroll
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    Auto-scroll to Active Ayah: {autoScroll ? 'YES' : 'NO'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Surah Header Card */}
          {surahDetail && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 p-6 sm:p-8 shadow-2xl text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <span>Surah {surahDetail.number} of 114</span>
                  <span>•</span>
                  <span>{surahDetail.revelationType} Revelation</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {surahDetail.englishName}
                  </h1>
                  <h2 className="font-arabic text-4xl sm:text-5xl font-bold text-emerald-400 my-2">
                    {surahDetail.fullNameArabic}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 italic font-medium">
                    "{surahDetail.englishNameTranslation}"
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-400">
                  <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
                    <strong className="text-emerald-400">{surahDetail.numberOfAyahs}</strong> Total Verses
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
                    Juz <strong className="text-emerald-400">{surahDetail.startJuz}</strong>
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
                    Reciter:{' '}
                    <strong className="text-slate-200">
                      {QURAN_RECITERS.find((r) => r.id === selectedReciter)?.name}
                    </strong>
                  </span>
                </div>

                {/* Recitation Player Button in Banner */}
                <div className="pt-4 flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={toggleSurahAudio}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 active:scale-95 transition cursor-pointer"
                  >
                    {isPlaying && playingMode === 'surah' ? (
                      <>
                        <Pause className="w-5 h-5 fill-white" />
                        <span>Pause Surah Recitation</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-white" />
                        <span>Listen Full Surah Recitation</span>
                      </>
                    )}
                  </button>

                  {/* Audio Scrubber if playing Surah */}
                  {isPlaying && playingMode === 'surah' && (
                    <div className="w-full max-w-md mt-2 space-y-1">
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full transition-all duration-200"
                          style={{ width: `${audioProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>{formatTime(audioCurrentTime)}</span>
                        <span>{formatTime(audioDuration)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bismillah Calligraphy (Shown for all Surahs except Surah 9 At-Tawbah and Surah 1) */}
          {surahDetail && surahDetail.number !== 9 && surahDetail.number !== 1 && (
            <div className="relative py-7 px-4 bg-slate-900/60 border border-emerald-900/40 rounded-2xl text-center overflow-hidden">
              <div className="font-arabic text-3xl sm:text-4xl text-emerald-300 font-bold leading-relaxed">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </div>
              <p className="text-xs text-slate-400 mt-2 italic">
                In the name of Allah, the Entirely Merciful, the Especially Merciful.
              </p>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoadingSurah && (
            <div className="space-y-4 py-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="w-12 h-6 bg-slate-800 rounded-lg" />
                    <div className="w-20 h-6 bg-slate-800 rounded-lg" />
                  </div>
                  <div className="w-full h-12 bg-slate-800/80 rounded-xl" />
                  <div className="w-3/4 h-4 bg-slate-800/50 rounded-lg" />
                  <div className="w-full h-6 bg-slate-800/60 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {/* Error Message & Retry */}
          {surahLoadError && (
            <div className="p-8 rounded-2xl bg-red-950/40 border border-red-800/50 text-center space-y-3">
              <p className="text-red-300 font-semibold">{surahLoadError}</p>
              <button
                onClick={() => loadSurah(selectedSurahNumber)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-800/60 hover:bg-red-700 text-white text-xs font-bold transition active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Loading Verses</span>
              </button>
            </div>
          )}

          {/* Verses List */}
          {surahDetail && !isLoadingSurah && (
            <div className="space-y-4">
              {surahDetail.ayahs.map((ayah) => {
                const bookmarked = isAyahBookmarked(surahDetail.number, ayah.number);
                const isCopied = copiedAyah === ayah.number;
                const isThisAyahPlaying = isPlaying && playingMode === 'ayah' && currentPlayingAyahNum === ayah.number;

                return (
                  <div
                    key={ayah.number}
                    ref={(el) => {
                      if (el) ayahRefs.current.set(ayah.number, el);
                      else ayahRefs.current.delete(ayah.number);
                    }}
                    id={`ayah-${ayah.number}`}
                    className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 ${
                      isThisAyahPlaying
                        ? 'bg-emerald-950/50 border-emerald-400 shadow-xl shadow-emerald-950/80 ring-1 ring-emerald-400'
                        : bookmarked
                        ? 'bg-emerald-950/25 border-emerald-500/50 shadow-md'
                        : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    {/* Ayah Top Meta & Actions Bar */}
                    <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-800/80 text-xs">
                      {/* Left: Ayah Number Badge */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-950/90 border border-emerald-600/60 flex items-center justify-center text-xs font-black text-emerald-300 shadow-inner">
                          {ayah.number}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-200">
                            Ayah {ayah.number}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Juz {ayah.juz} • Page {ayah.page}
                          </span>
                        </div>
                        {ayah.sajda && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                            ۩ Sajdah
                          </span>
                        )}
                      </div>

                      {/* Right: Actions (Play Audio, Bookmark, Copy, Share) */}
                      <div className="flex items-center gap-1.5">
                        {/* Play Ayah Audio */}
                        <button
                          onClick={() => playAyahAudio(ayah)}
                          className={`p-2 rounded-xl transition active:scale-90 cursor-pointer ${
                            isThisAyahPlaying
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40'
                              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
                          }`}
                          title={isThisAyahPlaying ? 'Pause Ayah Audio' : 'Play Ayah Audio'}
                        >
                          {isThisAyahPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                        </button>

                        {/* Bookmark Button */}
                        <button
                          onClick={() =>
                            toggleBookmark(
                              surahDetail.number,
                              ayah.number,
                              ayah.arabic,
                              ayah.translation
                            )
                          }
                          className={`p-2 rounded-xl transition active:scale-90 cursor-pointer ${
                            bookmarked
                              ? 'text-amber-400 bg-amber-950/50 border border-amber-500/40'
                              : 'text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700'
                          }`}
                          title={bookmarked ? 'Remove Bookmark' : 'Bookmark Ayah'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-400' : ''}`} />
                        </button>

                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopyAyah(ayah)}
                          className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition active:scale-90 cursor-pointer"
                          title="Copy Ayah with Translation"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Share Button */}
                        <button
                          onClick={() => handleShareAyah(ayah)}
                          className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition active:scale-90 cursor-pointer"
                          title="Share Ayah"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text */}
                    <div
                      dir="rtl"
                      className={`font-arabic font-bold text-slate-100 ${arabicFontClass} text-right my-3 selection:bg-emerald-600/40`}
                    >
                      {ayah.arabic}
                      <span className="inline-flex items-center justify-center w-7 h-7 mx-2 rounded-full border border-emerald-600/50 text-xs font-mono text-emerald-400 align-middle">
                        {ayah.number}
                      </span>
                    </div>

                    {/* Phonetic Transliteration */}
                    {showTransliteration && ayah.transliteration && (
                      <div className="text-xs sm:text-sm text-teal-300/85 italic font-sans my-2 leading-relaxed">
                        {ayah.transliteration}
                      </div>
                    )}

                    {/* English Translation */}
                    {showTranslation && ayah.translation && (
                      <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans pt-1">
                        {ayah.translation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Surah Navigation Bar */}
          {surahDetail && (
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
              {surahDetail.number > 1 ? (
                <button
                  onClick={() => navigateToSurah('prev')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-emerald-400" />
                  <span>
                    Surah {surahDetail.number - 1}: {ALL_114_SURAHS[surahDetail.number - 2]?.englishName}
                  </span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => {
                  stopAudio();
                  setSelectedSurahNumber(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/60 text-xs font-bold text-emerald-300 transition active:scale-95 cursor-pointer"
              >
                Back to All 114 Surahs
              </button>

              {surahDetail.number < 114 ? (
                <button
                  onClick={() => navigateToSurah('next')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition active:scale-95 cursor-pointer"
                >
                  <span>
                    Surah {surahDetail.number + 1}: {ALL_114_SURAHS[surahDetail.number]?.englishName}
                  </span>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>
              ) : (
                <div />
              )}
            </div>
          )}
        </div>
      ) : (
        /* ======================================================== */
        /* 2. SURAH INDEX DIRECTORY (All 114 Surahs)                */
        /* ======================================================== */
        <div className="space-y-6">
          {/* Majestic Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/90 border border-emerald-500/30 p-6 sm:p-7 shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>الْقُرْآنُ الْكَرِيمُ • The Noble Qur'an</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  114 Surahs • 6,236 Ayahs
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  Authentic Uthmani Arabic script, accurate English phonetic transliteration, and Sahih International translation with renowned Qari recitations.
                </p>

                {/* Stats Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 font-semibold">
                    114 Complete Surahs
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
                    86 Meccan • 28 Medinan
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
                    30 Juz (Para)
                  </span>
                </div>
              </div>

              {/* Last Read Quick Resume Widget */}
              {lastRead && (
                <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 min-w-[240px] shadow-lg">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1.5">
                    <RotateCcw className="w-3 h-3" />
                    <span>Continue Reading</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {lastRead.surahEnglishName}
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">
                    Ayah {lastRead.ayahNumber} • {lastRead.surahName}
                  </p>
                  <button
                    onClick={() => loadSurah(lastRead.surahNumber, lastRead.ayahNumber)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Resume Ayah {lastRead.ayahNumber}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search, Juz Picker, & Quick Tabs */}
          <div className="space-y-3">
            {/* Search Bar & Direct Number Jump */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Surah Name, Meaning, or Number (e.g. Al-Baqarah, 36, Yasin, Cave)..."
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Juz Filter Dropdown */}
              <div className="w-full sm:w-auto flex items-center gap-2">
                <select
                  value={selectedJuz}
                  onChange={(e) =>
                    setSelectedJuz(e.target.value === 'all' ? 'all' : Number(e.target.value))
                  }
                  className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="all">All Juz (1 - 30)</option>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                    <option key={j} value={j}>
                      Juz {j} (Part {j})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All (114)
              </button>
              <button
                onClick={() => setActiveTab('popular')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'popular'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Popular &amp; Daily (10)
              </button>
              <button
                onClick={() => setActiveTab('meccan')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'meccan'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Meccan / مَكِّيَّة (86)
              </button>
              <button
                onClick={() => setActiveTab('medinan')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'medinan'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Medinan / مَدَنِيَّة (28)
              </button>
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'bookmarks'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                <span>Bookmarks ({bookmarks.length})</span>
              </button>
            </div>
          </div>

          {/* Bookmarks Tab View */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-3">
              {bookmarks.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 font-medium">No bookmarked verses yet.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Click the bookmark icon on any Ayah while reading to save it here for instant access.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bookmarks.map((b) => (
                    <div
                      key={`${b.surahNumber}:${b.ayahNumber}`}
                      onClick={() => loadSurah(b.surahNumber, b.ayahNumber)}
                      className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-900/40 hover:border-emerald-500/50 transition cursor-pointer shadow-md group"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                        <span className="font-bold text-xs text-emerald-400">
                          {b.surahEnglishName} ({b.surahNumber}:{b.ayahNumber})
                        </span>
                        <span className="font-arabic text-sm text-emerald-300 font-bold">
                          {b.surahName}
                        </span>
                      </div>
                      {b.arabicSnippet && (
                        <p dir="rtl" className="font-arabic text-sm text-slate-200 line-clamp-1 mb-1">
                          {b.arabicSnippet}
                        </p>
                      )}
                      {b.translationSnippet && (
                        <p className="text-xs text-slate-400 line-clamp-2">
                          "{b.translationSnippet}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All 114 Surahs Grid */}
          {activeTab !== 'bookmarks' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredSurahs.map((surah) => {
                const isPopular = POPULAR_SURAHS_NUMBERS.includes(surah.number);
                return (
                  <div
                    key={surah.number}
                    onClick={() => loadSurah(surah.number)}
                    className="group relative p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:shadow-emerald-950/40 flex items-center justify-between overflow-hidden"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Surah Number Polygon Badge */}
                      <div className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-950/90 border border-emerald-700/50 flex items-center justify-center font-black text-xs text-emerald-400 group-hover:bg-emerald-900 group-hover:scale-105 transition shadow-inner">
                        {surah.number}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition truncate">
                            {surah.englishName}
                          </h3>
                          {isPopular && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Daily / Popular" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-[150px] sm:max-w-[170px]">
                          {surah.englishNameTranslation}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                          <span>{surah.numberOfAyahs} Verses</span>
                          <span>•</span>
                          <span>Juz {surah.startJuz}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Arabic Name & Revelation Type */}
                    <div className="text-right shrink-0 pl-2">
                      <div className="font-arabic text-xl font-bold text-emerald-400 group-hover:text-emerald-300 transition">
                        {surah.name}
                      </div>
                      <span
                        className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                          surah.revelationType === 'Meccan'
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                            : 'bg-teal-950/70 text-teal-400 border border-teal-800/40'
                        }`}
                      >
                        {surah.revelationType}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty Search Result */}
          {activeTab !== 'bookmarks' && filteredSurahs.length === 0 && (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
              <Search className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-slate-300">
                No Surah found matching "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedJuz('all');
                  setActiveTab('all');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition active:scale-95"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-5 z-40 p-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl transition active:scale-90 cursor-pointer border border-emerald-400/40"
          title="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
