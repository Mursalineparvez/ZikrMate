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
} from 'lucide-react';
import { soundHaptics } from '../utils/audioHaptics';
import { ThemeMode, ZikrLanguage } from '../types';
import { QURAN_UI, SURAH_MEANINGS } from '../utils/appTranslations';

interface QuranViewProps {
  soundEnabled: boolean;
  themeMode?: ThemeMode;
  selectedLanguage?: ZikrLanguage;
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

export const QuranView: React.FC<QuranViewProps> = ({
  soundEnabled,
  themeMode = 'day',
  selectedLanguage = 'bn',
}) => {
  const isDay = themeMode === 'day';

  // Navigation & Surah State
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [surahDetail, setSurahDetail] = useState<QuranSurahDetail | null>(null);
  const [isLoadingSurah, setIsLoadingSurah] = useState(false);
  const [surahLoadError, setSurahLoadError] = useState<string | null>(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJuz, setSelectedJuz] = useState<number | 'all'>('all');

  // Reader Customizations
  const [selectedReciterId, setSelectedReciterId] = useState<string>(() => {
    return localStorage.getItem('noor_quran_reciter') || 'ar.alafasy';
  });
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('noor_quran_fontsize') as FontSize) || 'large';
  });
  const [showTranslation, setShowTranslation] = useState<boolean>(() => {
    const saved = localStorage.getItem('noor_quran_show_trans');
    return saved !== null ? saved === 'true' : true;
  });
  const [showTransliteration, setShowTransliteration] = useState<boolean>(() => {
    const saved = localStorage.getItem('noor_quran_show_pronounce');
    return saved !== null ? saved === 'true' : true;
  });
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingMode, setPlayingMode] = useState<'surah' | 'ayah' | null>(null);
  const [currentPlayingAyahNum, setCurrentPlayingAyahNum] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem('noor_quran_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Last Read Position
  const [lastRead, setLastRead] = useState<{
    surahNumber: number;
    ayahNumber: number;
    surahName: string;
    surahEnglishName: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('noor_quran_last_read');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // UI Interactive States
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [jumpVerseInput, setJumpVerseInput] = useState('');
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Audio setup
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setAudioCurrentTime(audio.currentTime);
        setAudioDuration(audio.duration);
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setPlayingMode(null);
      setCurrentPlayingAyahNum(null);
      setAudioProgress(0);
    };

    const handleError = () => {
      setIsPlaying(false);
      setPlayingMode(null);
      setCurrentPlayingAyahNum(null);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.src = '';
    };
  }, []);

  // Save customizations
  useEffect(() => {
    localStorage.setItem('noor_quran_reciter', selectedReciterId);
  }, [selectedReciterId]);

  useEffect(() => {
    localStorage.setItem('noor_quran_fontsize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('noor_quran_show_trans', String(showTranslation));
  }, [showTranslation]);

  useEffect(() => {
    localStorage.setItem('noor_quran_show_pronounce', String(showTransliteration));
  }, [showTransliteration]);

  useEffect(() => {
    localStorage.setItem('noor_quran_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Reload current Surah if user changes language while reading
  useEffect(() => {
    if (selectedSurahNumber !== null) {
      loadSurah(selectedSurahNumber, currentPlayingAyahNum || undefined);
    }
  }, [selectedLanguage]);

  // Load Surah
  const loadSurah = async (surahNumber: number, initialAyahJump?: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setPlayingMode(null);
      setCurrentPlayingAyahNum(null);
    }

    setSelectedSurahNumber(surahNumber);
    setSurahLoadError(null);

    const cached = getCachedSurah(surahNumber, selectedLanguage);
    if (cached) {
      setSurahDetail(cached);
      updateLastRead(surahNumber, initialAyahJump || 1, cached.name, cached.englishName);
      if (initialAyahJump) {
        setTimeout(() => scrollToAyah(initialAyahJump), 300);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const fallbackAyahs = OFFLINE_FALLBACK_SURAHS[surahNumber];
    if (fallbackAyahs) {
      const meta = ALL_114_SURAHS.find((s) => s.number === surahNumber);
      if (meta) {
        setSurahDetail({ ...meta, ayahs: fallbackAyahs, language: selectedLanguage });
        updateLastRead(surahNumber, initialAyahJump || 1, meta.name, meta.englishName);
      }
    }

    setIsLoadingSurah(true);
    try {
      const data = await fetchSurah(surahNumber, selectedReciterId, selectedLanguage);
      setSurahDetail(data);
      updateLastRead(surahNumber, initialAyahJump || 1, data.name, data.englishName);
      if (initialAyahJump) {
        setTimeout(() => scrollToAyah(initialAyahJump), 300);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      if (!fallbackAyahs) {
        setSurahLoadError('Unable to load Surah data. Please check your connection.');
      }
    } finally {
      setIsLoadingSurah(false);
    }
  };

  const updateLastRead = (
    surahNumber: number,
    ayahNumber: number,
    surahName: string,
    surahEnglishName: string
  ) => {
    const rec = { surahNumber, ayahNumber, surahName, surahEnglishName };
    setLastRead(rec);
    try {
      localStorage.setItem('noor_quran_last_read', JSON.stringify(rec));
    } catch {}
  };

  const scrollToAyah = (ayahNum: number) => {
    const el = ayahRefs.current.get(ayahNum);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-teal-400');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-teal-400');
      }, 2500);
    }
  };

  // Play Full Surah Audio
  const playSurahAudio = () => {
    if (!surahDetail || !audioRef.current) return;

    if (isPlaying && playingMode === 'surah') {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const reciter = QURAN_RECITERS.find((r) => r.id === selectedReciterId) || QURAN_RECITERS[0];
    const padded = String(surahDetail.number).padStart(3, '0');
    const audioUrl = `${reciter.surahAudioBase}/${padded}.mp3`;

    audioRef.current.src = audioUrl;
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setPlayingMode('surah');
        setCurrentPlayingAyahNum(null);
        if (soundEnabled) soundHaptics.playTap();
      })
      .catch((err) => {
        console.error('Audio playback failed', err);
        setIsPlaying(false);
      });
  };

  // Play Individual Ayah Audio
  const playAyahAudio = (ayah: QuranAyah) => {
    if (!surahDetail || !audioRef.current) return;

    if (isPlaying && playingMode === 'ayah' && currentPlayingAyahNum === ayah.number) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentPlayingAyahNum(null);
      setPlayingMode(null);
      return;
    }

    audioRef.current.src = ayah.audioUrl;
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setPlayingMode('ayah');
        setCurrentPlayingAyahNum(ayah.number);
        updateLastRead(surahDetail.number, ayah.number, surahDetail.name, surahDetail.englishName);
        if (soundEnabled) soundHaptics.playTap();
        if (autoScroll) {
          scrollToAyah(ayah.number);
        }
      })
      .catch((err) => {
        console.error('Ayah audio play failed', err);
        setIsPlaying(false);
      });
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setPlayingMode(null);
      setCurrentPlayingAyahNum(null);
      setAudioProgress(0);
    }
  };

  // Bookmarking
  const toggleBookmark = (
    surahNumber: number,
    ayahNumber: number,
    arabicSnippet: string,
    translationSnippet: string
  ) => {
    const isBookmarked = bookmarks.some(
      (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );

    if (isBookmarked) {
      setBookmarks(
        bookmarks.filter((b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber))
      );
      if (soundEnabled) soundHaptics.playTap();
    } else {
      const meta = ALL_114_SURAHS.find((s) => s.number === surahNumber);
      const newBookmark: BookmarkItem = {
        surahNumber,
        ayahNumber,
        surahName: meta?.name || `Surah ${surahNumber}`,
        surahEnglishName: meta?.englishName || `Surah ${surahNumber}`,
        arabicSnippet: arabicSnippet.slice(0, 100),
        translationSnippet: translationSnippet.slice(0, 120),
        timestamp: Date.now(),
      };
      setBookmarks([newBookmark, ...bookmarks]);
      if (soundEnabled) soundHaptics.playMilestone();
    }
  };

  const isAyahBookmarked = (surahNumber: number, ayahNumber: number): boolean => {
    return bookmarks.some((b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
  };

  // Copy Ayah
  const handleCopyAyah = (ayah: QuranAyah) => {
    if (!surahDetail) return;
    const text = `${ayah.arabic}\n\n"${ayah.translation}"\n\n— Quran ${surahDetail.englishName} (${surahDetail.number}:${ayah.number})`;
    navigator.clipboard.writeText(text);
    setCopiedAyah(ayah.number);
    if (soundEnabled) soundHaptics.playTap();
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  // Share Ayah
  const handleShareAyah = async (ayah: QuranAyah) => {
    if (!surahDetail) return;
    const shareData = {
      title: `Noble Quran ${surahDetail.englishName} (${surahDetail.number}:${ayah.number})`,
      text: `${ayah.arabic}\n\n"${ayah.translation}"\n\n— Surah ${surahDetail.englishName} (${surahDetail.number}:${ayah.number})`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      handleCopyAyah(ayah);
    }
  };

  // Jump to Ayah Form submit
  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ayahNum = parseInt(jumpVerseInput, 10);
    if (!surahDetail || isNaN(ayahNum)) return;
    if (ayahNum >= 1 && ayahNum <= surahDetail.numberOfAyahs) {
      scrollToAyah(ayahNum);
      setJumpVerseInput('');
    }
  };

  // Navigation: Next / Prev Surah
  const navigateToSurah = (direction: 'next' | 'prev') => {
    if (!surahDetail) return;
    const target = direction === 'next' ? surahDetail.number + 1 : surahDetail.number - 1;
    if (target >= 1 && target <= 114) {
      loadSurah(target);
    }
  };

  // Filtered 114 Surahs
  const filteredSurahs = useMemo(() => {
    return ALL_114_SURAHS.filter((surah) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        surah.englishName.toLowerCase().includes(q) ||
        surah.englishNameTranslation.toLowerCase().includes(q) ||
        surah.name.includes(q) ||
        String(surah.number) === q;

      const matchesJuz = selectedJuz === 'all' || surah.startJuz === selectedJuz;

      if (!matchesSearch || !matchesJuz) return false;

      if (activeTab === 'meccan') return surah.revelationType === 'Meccan';
      if (activeTab === 'medinan') return surah.revelationType === 'Medinan';
      if (activeTab === 'popular') return POPULAR_SURAHS_NUMBERS.includes(surah.number);

      return true;
    });
  }, [searchQuery, selectedJuz, activeTab]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const arabicFontClass = {
    normal: 'text-2xl sm:text-3xl leading-[2.2]',
    large: 'text-3xl sm:text-4xl leading-[2.4]',
    xl: 'text-3xl sm:text-4xl md:text-5xl leading-[2.6]',
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
          <div
            className={`sticky top-0 z-30 backdrop-blur-xl border rounded-2xl p-3 sm:p-4 shadow-lg flex items-center justify-between gap-3 ${
              isDay
                ? 'bg-white/95 border-[#dcebe8] text-[#103e42]'
                : 'bg-[#0a262c]/95 border-[#184850] text-[#e6f7f5]'
            }`}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  stopAudio();
                  setSelectedSurahNumber(null);
                  setSurahDetail(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer border ${
                  isDay
                    ? 'bg-[#f0f7f6] hover:bg-[#e4f2f0] text-[#1c6469] border-[#d0e6e3]'
                    : 'bg-[#0e2f36] hover:bg-[#123e47] text-teal-200 border-[#1a515c]'
                }`}
              >
                <ArrowLeft className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="hidden sm:inline">{QURAN_UI.backToSurahs[selectedLanguage]}</span>
                <span className="sm:hidden">Index</span>
              </button>

              {/* Quick Surah Dropdown Selector */}
              <select
                value={selectedSurahNumber}
                onChange={(e) => loadSurah(Number(e.target.value))}
                className={`rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[200px] truncate border ${
                  isDay
                    ? 'bg-[#f0f7f6] border-[#cde5e2] text-[#103e42] focus:border-[#1c6469]'
                    : 'bg-[#0e2f36] border-[#1a515c] text-teal-200 focus:border-teal-400'
                }`}
              >
                {ALL_114_SURAHS.map((s) => (
                  <option
                    key={s.number}
                    value={s.number}
                    className={isDay ? 'bg-white text-[#103e42]' : 'bg-[#0e2f36] text-white'}
                  >
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
                  className={`w-24 px-2.5 py-1 text-xs rounded-lg border focus:outline-none ${
                    isDay
                      ? 'bg-[#f0f7f6] border-[#cde5e2] text-[#103e42] placeholder-[#7ca2a7] focus:border-[#1c6469]'
                      : 'bg-[#0e2f36] border-[#1a515c] text-white placeholder-teal-600 focus:border-teal-400'
                  }`}
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-[#1c6469] hover:bg-[#154f53] text-white text-xs font-semibold rounded-lg transition active:scale-95 cursor-pointer shadow-sm"
                >
                  Go
                </button>
              </form>

              {/* Font Size Selector */}
              <div
                className={`flex items-center gap-1 p-1 rounded-xl border ${
                  isDay ? 'bg-[#f0f7f6] border-[#d2ece9]' : 'bg-[#0e2f36] border-[#1a515c]'
                }`}
              >
                <Type className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 ml-1" />
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-1.5 py-0.5 text-xs rounded-lg ${
                    fontSize === 'normal'
                      ? 'bg-[#1c6469] text-white font-bold'
                      : isDay
                      ? 'text-[#507579]'
                      : 'text-teal-300'
                  }`}
                  title="Normal font"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-1.5 py-0.5 text-xs rounded-lg ${
                    fontSize === 'large'
                      ? 'bg-[#1c6469] text-white font-bold'
                      : isDay
                      ? 'text-[#507579]'
                      : 'text-teal-300'
                  }`}
                  title="Large font"
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize('xl')}
                  className={`px-1.5 py-0.5 text-xs rounded-lg ${
                    fontSize === 'xl'
                      ? 'bg-[#1c6469] text-white font-bold'
                      : isDay
                      ? 'text-[#507579]'
                      : 'text-teal-300'
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
                    ? 'bg-[#1c6469] text-white border-[#1c6469]'
                    : isDay
                    ? 'bg-[#f0f7f6] text-[#1c6469] border-[#d2ece9] hover:bg-[#e4f2f0]'
                    : 'bg-[#0e2f36] text-teal-200 border-[#1a515c] hover:bg-[#123e47]'
                }`}
                title="Reading & Audio Settings"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reading & Reciter Drawer */}
          {showSettingsDrawer && (
            <div
              className={`rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 animate-in slide-in-from-top-2 duration-200 border ${
                isDay
                  ? 'bg-white border-[#dcebe8] text-[#103e42]'
                  : 'bg-[#0e2f36] border-[#1a515c] text-[#e6f7f5]'
              }`}
            >
              <div className={`flex items-center justify-between border-b pb-3 ${
                isDay ? 'border-[#e8f3f1]' : 'border-[#17434b]'
              }`}>
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Reader &amp; Audio Customization</span>
                </h4>
                <button
                  onClick={() => setShowSettingsDrawer(false)}
                  className="p-1 rounded-lg hover:opacity-80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Select Reciter */}
                <div>
                  <label className={`block text-[11px] font-semibold mb-1.5 ${
                    isDay ? 'text-[#507579]' : 'text-teal-200/80'
                  }`}>
                    Reciter Voice (Qari)
                  </label>
                  <select
                    value={selectedReciterId}
                    onChange={(e) => setSelectedReciterId(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                      isDay
                        ? 'bg-[#f0f7f6] border-[#cde5e2] text-[#103e42] focus:border-[#1c6469]'
                        : 'bg-[#0a262c] border-[#184850] text-teal-100 focus:border-teal-400'
                    }`}
                  >
                    {QURAN_RECITERS.map((r) => (
                      <option key={r.id} value={r.id} className={isDay ? 'bg-white text-black' : 'bg-[#0e2f36] text-white'}>
                        {r.name} ({r.subtext})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Display Toggles */}
                <div>
                  <label className={`block text-[11px] font-semibold mb-1.5 ${
                    isDay ? 'text-[#507579]' : 'text-teal-200/80'
                  }`}>
                    Display Elements
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowTranslation(!showTranslation)}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                        showTranslation
                          ? 'bg-[#1c6469] text-white border-[#1c6469]'
                          : isDay
                          ? 'bg-[#f0f7f6] text-[#507579] border-[#d2ece9]'
                          : 'bg-[#0a262c] text-teal-300 border-[#184850]'
                      }`}
                    >
                      {QURAN_UI.translationToggle[selectedLanguage]}: {showTranslation ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => setShowTransliteration(!showTransliteration)}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                        showTransliteration
                          ? 'bg-[#1c6469] text-white border-[#1c6469]'
                          : isDay
                          ? 'bg-[#f0f7f6] text-[#507579] border-[#d2ece9]'
                          : 'bg-[#0a262c] text-teal-300 border-[#184850]'
                      }`}
                    >
                      {QURAN_UI.pronounceToggle[selectedLanguage]}: {showTransliteration ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Auto Scroll Toggle */}
                <div>
                  <label className={`block text-[11px] font-semibold mb-1.5 ${
                    isDay ? 'text-[#507579]' : 'text-teal-200/80'
                  }`}>
                    Audio Sync
                  </label>
                  <button
                    onClick={() => setAutoScroll(!autoScroll)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      autoScroll
                        ? 'bg-[#1c6469] text-white border-[#1c6469]'
                        : isDay
                        ? 'bg-[#f0f7f6] text-[#507579] border-[#d2ece9]'
                        : 'bg-[#0a262c] text-teal-300 border-[#184850]'
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#144d52] via-[#1a5e64] to-[#257277] border border-teal-400/30 p-6 sm:p-8 shadow-xl text-center text-white">
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-teal-100 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                  <span>Surah {surahDetail.number} of 114</span>
                  <span>•</span>
                  <span>{surahDetail.revelationType} Revelation</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
                    {surahDetail.englishName}
                  </h1>
                  <h2 className="font-arabic text-4xl sm:text-5xl font-bold text-amber-300 my-2 drop-shadow-md">
                    {surahDetail.fullNameArabic}
                  </h2>
                  <p className="text-sm sm:text-base text-teal-100 italic font-medium">
                    "{surahDetail.englishNameTranslation}"
                  </p>
                </div>

                {/* Meta details badge row */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-xs text-teal-100 pt-1">
                  <span className="px-3 py-1 rounded-lg bg-black/20 border border-white/10 backdrop-blur-md">
                    {surahDetail.numberOfAyahs} {QURAN_UI.ayahs[selectedLanguage]}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-black/20 border border-white/10 backdrop-blur-md">
                    {QURAN_UI.juz[selectedLanguage]} {surahDetail.startJuz}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-black/20 border border-white/10 backdrop-blur-md">
                    {QURAN_UI.reciter[selectedLanguage]}: {QURAN_RECITERS.find((r) => r.id === selectedReciterId)?.name.split(' ')[0]}
                  </span>
                </div>

                {/* Recitation Player Button */}
                <div className="pt-3 flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={playSurahAudio}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[#165a60] hover:bg-teal-50 font-extrabold text-sm shadow-xl transition active:scale-95 cursor-pointer"
                  >
                    {isPlaying && playingMode === 'surah' ? (
                      <>
                        <Pause className="w-5 h-5 fill-current" />
                        <span>{QURAN_UI.pause[selectedLanguage]}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-current" />
                        <span>{QURAN_UI.playSurah[selectedLanguage]}</span>
                      </>
                    )}
                  </button>

                  {/* Audio Progress Bar */}
                  {isPlaying && playingMode === 'surah' && (
                    <div className="w-full max-w-md mt-2 space-y-1">
                      <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-300 h-full transition-all duration-200"
                          style={{ width: `${audioProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-teal-100 font-mono">
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
            <div
              className={`relative py-7 px-4 rounded-2xl text-center overflow-hidden border shadow-sm ${
                isDay
                  ? 'bg-white border-[#dcebe8] text-[#164e52]'
                  : 'bg-[#0e2f36] border-[#1a515c] text-[#2dd4bf]'
              }`}
            >
              <div className="font-arabic text-3xl sm:text-4xl font-bold leading-relaxed">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </div>
              <p className={`text-xs mt-2 italic ${isDay ? 'text-[#507579]' : 'text-[#8ebac0]'}`}>
                In the name of Allah, the Entirely Merciful, the Especially Merciful.
              </p>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoadingSurah && (
            <div className="space-y-4 py-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`p-6 rounded-2xl border animate-pulse space-y-4 ${
                    isDay ? 'bg-white border-[#dcebe8]' : 'bg-[#0e2f36] border-[#1a515c]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className={`w-12 h-6 rounded-lg ${isDay ? 'bg-[#e6f3f2]' : 'bg-[#0a262c]'}`} />
                    <div className={`w-20 h-6 rounded-lg ${isDay ? 'bg-[#e6f3f2]' : 'bg-[#0a262c]'}`} />
                  </div>
                  <div className={`w-full h-12 rounded-xl ${isDay ? 'bg-[#f0f7f6]' : 'bg-[#092226]'}`} />
                  <div className={`w-3/4 h-4 rounded-lg ${isDay ? 'bg-[#f0f7f6]' : 'bg-[#092226]'}`} />
                  <div className={`w-full h-6 rounded-lg ${isDay ? 'bg-[#f0f7f6]' : 'bg-[#092226]'}`} />
                </div>
              ))}
            </div>
          )}

          {/* Error Message & Retry */}
          {surahLoadError && (
            <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-3">
              <p className="text-red-600 dark:text-red-400 font-semibold">{surahLoadError}</p>
              <button
                onClick={() => loadSurah(selectedSurahNumber)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1c6469] hover:bg-[#154f53] text-white text-xs font-bold transition active:scale-95"
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
                const isThisAyahPlaying =
                  isPlaying && playingMode === 'ayah' && currentPlayingAyahNum === ayah.number;

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
                        ? isDay
                          ? 'bg-[#eef8f7] border-2 border-[#1c6469] shadow-md shadow-[#135d66]/15 ring-2 ring-[#1c6469]/20'
                          : 'bg-[#123e47] border-2 border-teal-400 shadow-md ring-2 ring-teal-400/20'
                        : bookmarked
                        ? isDay
                          ? 'bg-[#fffdf5] border-amber-300 shadow-sm'
                          : 'bg-[#193226] border-amber-500/50 shadow-sm'
                        : isDay
                        ? 'bg-white border-[#dcebe8] hover:border-[#b5dcd6] shadow-sm'
                        : 'bg-[#0e2f36] border-[#1a515c] hover:border-[#266e7c] shadow-[#082024]/60'
                    }`}
                  >
                    {/* Ayah Top Meta & Actions Bar */}
                    <div
                      className={`flex items-center justify-between pb-3.5 mb-3.5 border-b text-xs ${
                        isDay ? 'border-[#e8f3f1]' : 'border-[#17434b]'
                      }`}
                    >
                      {/* Left: Ayah Number Badge */}
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-black shadow-inner ${
                            isDay
                              ? 'bg-[#e6f3f2] text-[#1c6469] border-[#cbe4e1]'
                              : 'bg-[#0a262c] text-[#2dd4bf] border-[#184850]'
                          }`}
                        >
                          {ayah.number}
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`font-semibold ${
                              isDay ? 'text-[#103e42]' : 'text-white'
                            }`}
                          >
                            Ayah {ayah.number}
                          </span>
                          <span className={`text-[10px] ${isDay ? 'text-[#6c8f93]' : 'text-[#8ebac0]'}`}>
                            Juz {ayah.juz} • Page {ayah.page}
                          </span>
                        </div>
                        {ayah.sajda && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-[10px] font-bold text-amber-600 dark:text-amber-300">
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
                              ? 'bg-[#1c6469] text-white shadow-md'
                              : isDay
                              ? 'bg-[#f0f7f6] hover:bg-[#e4f2f0] text-[#1c6469] border border-[#d2ece9]'
                              : 'bg-[#0a262c] hover:bg-[#123e47] text-teal-200 border border-[#184850]'
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
                              ? 'text-amber-500 bg-amber-500/15 border border-amber-400'
                              : isDay
                              ? 'text-[#507579] hover:text-[#1c6469] bg-[#f0f7f6] hover:bg-[#e4f2f0] border border-[#d2ece9]'
                              : 'text-teal-300 hover:text-white bg-[#0a262c] hover:bg-[#123e47] border border-[#184850]'
                          }`}
                          title={bookmarked ? 'Remove Bookmark' : 'Bookmark Ayah'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-500' : ''}`} />
                        </button>

                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopyAyah(ayah)}
                          className={`p-2 rounded-xl transition active:scale-90 cursor-pointer border ${
                            isDay
                              ? 'text-[#507579] hover:text-[#1c6469] bg-[#f0f7f6] hover:bg-[#e4f2f0] border-[#d2ece9]'
                              : 'text-teal-300 hover:text-white bg-[#0a262c] hover:bg-[#123e47] border-[#184850]'
                          }`}
                          title="Copy Ayah with Translation"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-teal-600" />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Share Button */}
                        <button
                          onClick={() => handleShareAyah(ayah)}
                          className={`p-2 rounded-xl transition active:scale-90 cursor-pointer border ${
                            isDay
                              ? 'text-[#507579] hover:text-[#1c6469] bg-[#f0f7f6] hover:bg-[#e4f2f0] border-[#d2ece9]'
                              : 'text-teal-300 hover:text-white bg-[#0a262c] hover:bg-[#123e47] border-[#184850]'
                          }`}
                          title="Share Ayah"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text */}
                    <div
                      dir="rtl"
                      className={`font-arabic font-bold ${
                        isDay ? 'text-[#0d4f54]' : 'text-white'
                      } ${arabicFontClass} text-right my-3 selection:bg-teal-500/20`}
                    >
                      {ayah.arabic}
                      <span className="inline-flex items-center justify-center w-7 h-7 mx-2 rounded-full border border-teal-500/40 text-xs font-mono text-teal-600 dark:text-teal-400 align-middle">
                        {ayah.number}
                      </span>
                    </div>

                    {/* Phonetic Transliteration */}
                    {showTransliteration && ayah.transliteration && (
                      <div
                        className={`text-xs sm:text-sm italic font-sans my-2 leading-relaxed ${
                          isDay ? 'text-[#256c71]' : 'text-teal-200/90'
                        }`}
                      >
                        {ayah.transliteration}
                      </div>
                    )}

                    {/* English Translation */}
                    {showTranslation && ayah.translation && (
                      <div
                        className={`text-xs sm:text-sm leading-relaxed font-sans pt-1 ${
                          isDay ? 'text-[#1e3b3e]' : 'text-slate-200'
                        }`}
                      >
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
            <div
              className={`mt-8 pt-6 border-t flex items-center justify-between flex-wrap gap-3 ${
                isDay ? 'border-[#dcebe8]' : 'border-[#17434b]'
              }`}
            >
              {surahDetail.number > 1 ? (
                <button
                  onClick={() => navigateToSurah('prev')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition active:scale-95 cursor-pointer ${
                    isDay
                      ? 'bg-white hover:bg-[#f0f7f6] border-[#dcebe8] text-[#1c6469]'
                      : 'bg-[#0e2f36] hover:bg-[#123e47] border-[#1a515c] text-teal-200'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 text-teal-600 dark:text-teal-400" />
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
                className="px-4 py-2.5 rounded-xl bg-[#1c6469] hover:bg-[#154f53] text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-md"
              >
                Back to All 114 Surahs
              </button>

              {surahDetail.number < 114 ? (
                <button
                  onClick={() => navigateToSurah('next')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition active:scale-95 cursor-pointer ${
                    isDay
                      ? 'bg-white hover:bg-[#f0f7f6] border-[#dcebe8] text-[#1c6469]'
                      : 'bg-[#0e2f36] hover:bg-[#123e47] border-[#1a515c] text-teal-200'
                  }`}
                >
                  <span>
                    Surah {surahDetail.number + 1}: {ALL_114_SURAHS[surahDetail.number]?.englishName}
                  </span>
                  <ChevronRight className="w-4 h-4 text-teal-600 dark:text-teal-400" />
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
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#144d52] via-[#1a5e64] to-[#257277] border border-teal-400/30 p-6 sm:p-7 shadow-xl text-white">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-teal-100 text-xs font-bold tracking-wide backdrop-blur-md">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>الْقُرْآنُ الْكَرِيمُ • The Noble Qur'an</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
                  {QURAN_UI.bannerTitle[selectedLanguage]}
                </h2>
                <p className="text-xs sm:text-sm text-teal-100 max-w-xl leading-relaxed">
                  {QURAN_UI.bannerSub[selectedLanguage]}
                </p>

                {/* Stats Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 backdrop-blur-md text-white font-semibold">
                    114 {QURAN_UI.allSurahs[selectedLanguage]}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 backdrop-blur-md text-teal-100">
                    86 {QURAN_UI.meccan[selectedLanguage]} • 28 {QURAN_UI.medinan[selectedLanguage]}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 backdrop-blur-md text-teal-100">
                    30 {QURAN_UI.juz[selectedLanguage]}
                  </span>
                </div>
              </div>

              {/* Last Read Quick Resume Widget */}
              {lastRead && (
                <div
                  className={`rounded-2xl p-4 min-w-[240px] shadow-lg border ${
                    isDay
                      ? 'bg-white text-[#103e42] border-[#dcebe8]'
                      : 'bg-[#0e2f36] text-white border-[#1a515c]'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider text-teal-600 dark:text-teal-300 flex items-center gap-1.5 mb-1.5">
                    <RotateCcw className="w-3 h-3" />
                    <span>Continue Reading</span>
                  </div>
                  <h4 className="text-sm font-bold truncate">
                    {lastRead.surahEnglishName}
                  </h4>
                  <p className={`text-xs mb-3 ${isDay ? 'text-[#507579]' : 'text-teal-200/80'}`}>
                    Ayah {lastRead.ayahNumber} • {lastRead.surahName}
                  </p>
                  <button
                    onClick={() => loadSurah(lastRead.surahNumber, lastRead.ayahNumber)}
                    className="w-full py-2 px-3 rounded-xl bg-[#1c6469] hover:bg-[#154f53] text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
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
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDay ? 'text-[#7ca2a7]' : 'text-teal-400'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={QURAN_UI.searchPlaceholder[selectedLanguage]}
                  className={`w-full rounded-2xl pl-11 pr-10 py-3 text-sm focus:outline-none transition shadow-sm border ${
                    isDay
                      ? 'bg-white border-[#cde5e2] text-[#103e42] placeholder-[#7ca2a7] focus:border-[#1c6469]'
                      : 'bg-[#0e2f36] border-[#1a515c] text-white placeholder-teal-600 focus:border-teal-400'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
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
                  className={`w-full sm:w-auto rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none cursor-pointer border ${
                    isDay
                      ? 'bg-white border-[#cde5e2] text-[#103e42] focus:border-[#1c6469]'
                      : 'bg-[#0e2f36] border-[#1a515c] text-teal-200 focus:border-teal-400'
                  }`}
                >
                  <option value="all" className={isDay ? 'bg-white text-[#103e42]' : 'bg-[#0e2f36] text-white'}>
                    All {QURAN_UI.juz[selectedLanguage]} (1 - 30)
                  </option>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                    <option key={j} value={j} className={isDay ? 'bg-white text-[#103e42]' : 'bg-[#0e2f36] text-white'}>
                      {QURAN_UI.juz[selectedLanguage]} {j}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                  activeTab === 'all'
                    ? 'bg-[#1c6469] text-white border-[#1c6469] shadow-md shadow-[#135d66]/20'
                    : isDay
                    ? 'bg-white hover:bg-[#eef7f6] text-[#2d6a70] border-[#d2ece9]'
                    : 'bg-[#0e2f36] text-[#8ebac0] border-[#1a515c] hover:text-white'
                }`}
              >
                {QURAN_UI.allSurahs[selectedLanguage]}
              </button>
              <button
                onClick={() => setActiveTab('popular')}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                  activeTab === 'popular'
                    ? 'bg-[#1c6469] text-white border-[#1c6469] shadow-md shadow-[#135d66]/20'
                    : isDay
                    ? 'bg-white hover:bg-[#eef7f6] text-[#2d6a70] border-[#d2ece9]'
                    : 'bg-[#0e2f36] text-[#8ebac0] border-[#1a515c] hover:text-white'
                }`}
              >
                {QURAN_UI.popular[selectedLanguage]} (10)
              </button>
              <button
                onClick={() => setActiveTab('meccan')}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                  activeTab === 'meccan'
                    ? 'bg-[#1c6469] text-white border-[#1c6469] shadow-md shadow-[#135d66]/20'
                    : isDay
                    ? 'bg-white hover:bg-[#eef7f6] text-[#2d6a70] border-[#d2ece9]'
                    : 'bg-[#0e2f36] text-[#8ebac0] border-[#1a515c] hover:text-white'
                }`}
              >
                {QURAN_UI.meccan[selectedLanguage]} (86)
              </button>
              <button
                onClick={() => setActiveTab('medinan')}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                  activeTab === 'medinan'
                    ? 'bg-[#1c6469] text-white border-[#1c6469] shadow-md shadow-[#135d66]/20'
                    : isDay
                    ? 'bg-white hover:bg-[#eef7f6] text-[#2d6a70] border-[#d2ece9]'
                    : 'bg-[#0e2f36] text-[#8ebac0] border-[#1a515c] hover:text-white'
                }`}
              >
                {QURAN_UI.medinan[selectedLanguage]} (28)
              </button>
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                  activeTab === 'bookmarks'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                    : isDay
                    ? 'bg-white hover:bg-[#eef7f6] text-[#2d6a70] border-[#d2ece9]'
                    : 'bg-[#0e2f36] text-[#8ebac0] border-[#1a515c] hover:text-white'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                <span>{QURAN_UI.bookmarks[selectedLanguage]} ({bookmarks.length})</span>
              </button>
            </div>
          </div>

          {/* Bookmarks Tab View */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-3">
              {bookmarks.length === 0 ? (
                <div
                  className={`p-8 text-center rounded-2xl border ${
                    isDay ? 'bg-white border-[#dcebe8]' : 'bg-[#0e2f36] border-[#1a515c]'
                  }`}
                >
                  <Bookmark className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className={`text-sm font-medium ${isDay ? 'text-[#103e42]' : 'text-white'}`}>
                    No bookmarked verses yet.
                  </p>
                  <p className={`text-xs mt-1 ${isDay ? 'text-[#507579]' : 'text-teal-200/80'}`}>
                    Click the bookmark icon on any Ayah while reading to save it here for instant access.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bookmarks.map((b) => (
                    <div
                      key={`${b.surahNumber}:${b.ayahNumber}`}
                      onClick={() => loadSurah(b.surahNumber, b.ayahNumber)}
                      className={`p-4 rounded-2xl transition cursor-pointer shadow-sm group border ${
                        isDay
                          ? 'bg-white hover:bg-[#f6fbfa] border-[#dcebe8] hover:border-[#a8dcd4]'
                          : 'bg-[#0e2f36] hover:bg-[#123e47] border-[#1a515c]'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between pb-2 mb-2 border-b ${
                          isDay ? 'border-[#e8f3f1]' : 'border-[#17434b]'
                        }`}
                      >
                        <span className="font-bold text-xs text-teal-700 dark:text-teal-300">
                          {b.surahEnglishName} ({b.surahNumber}:{b.ayahNumber})
                        </span>
                        <span className="font-arabic text-sm text-teal-800 dark:text-teal-200 font-bold">
                          {b.surahName}
                        </span>
                      </div>
                      {b.arabicSnippet && (
                        <p dir="rtl" className="font-arabic text-sm text-teal-900 dark:text-teal-100 line-clamp-1 mb-1">
                          {b.arabicSnippet}
                        </p>
                      )}
                      {b.translationSnippet && (
                        <p className={`text-xs line-clamp-2 ${isDay ? 'text-[#507579]' : 'text-slate-300'}`}>
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
                    className={`group relative p-4 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between overflow-hidden border ${
                      isDay
                        ? 'bg-white hover:bg-[#f6fbfa] border-[#dcebe8] hover:border-[#a8dcd4] text-[#103e42]'
                        : 'bg-[#0e2f36] hover:bg-[#123e47] border-[#1a515c] text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Surah Number Polygon Badge */}
                      <div
                        className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center font-black text-xs group-hover:scale-105 transition shadow-inner border ${
                          isDay
                            ? 'bg-[#e6f3f2] text-[#1c6469] border-[#cbe4e1]'
                            : 'bg-[#0a262c] text-[#2dd4bf] border-[#184850]'
                        }`}
                      >
                        {surah.number}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold truncate group-hover:text-teal-600 transition">
                            {surah.englishName}
                          </h3>
                          {isPopular && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Daily / Popular" />
                          )}
                        </div>
                        <p className={`text-[11px] truncate max-w-[150px] sm:max-w-[170px] ${
                          isDay ? 'text-[#507579]' : 'text-teal-200/80'
                        }`}>
                          {SURAH_MEANINGS[surah.number]?.[selectedLanguage] || surah.englishNameTranslation}
                        </p>
                        <div className={`flex items-center gap-2 mt-1 text-[10px] ${
                          isDay ? 'text-[#7ca2a7]' : 'text-teal-400/80'
                        }`}>
                          <span>{surah.numberOfAyahs} {QURAN_UI.ayahs[selectedLanguage]}</span>
                          <span>•</span>
                          <span>{QURAN_UI.juz[selectedLanguage]} {surah.startJuz}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Arabic calligraphy title */}
                    <div className="text-right shrink-0 pl-2">
                      <div className="font-arabic text-xl sm:text-2xl font-bold text-teal-700 dark:text-teal-300">
                        {surah.name}
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        surah.revelationType === 'Meccan'
                          ? isDay
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                          : isDay
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                      }`}>
                        {surah.revelationType === 'Meccan' ? QURAN_UI.meccan[selectedLanguage] : QURAN_UI.medinan[selectedLanguage]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No results */}
          {filteredSurahs.length === 0 && activeTab !== 'bookmarks' && (
            <div
              className={`p-12 text-center rounded-3xl space-y-3 border ${
                isDay ? 'bg-white border-[#dcebe8]' : 'bg-[#0e2f36] border-[#1a515c]'
              }`}
            >
              <BookOpen className="w-10 h-10 text-teal-600 mx-auto" />
              <h3 className={`text-base font-bold ${isDay ? 'text-[#103e42]' : 'text-white'}`}>
                No Surahs found for "{searchQuery}"
              </h3>
              <p className={`text-xs ${isDay ? 'text-[#507579]' : 'text-teal-200/80'}`}>
                Try searching by number (e.g. 1, 36, 67) or traditional name like Yaseen, Mulk, Rahman.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedJuz('all');
                  setActiveTab('all');
                }}
                className="px-4 py-2 rounded-xl bg-[#1c6469] text-white text-xs font-bold transition active:scale-95"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
