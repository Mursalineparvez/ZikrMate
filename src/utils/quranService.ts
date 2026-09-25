import { ALL_114_SURAHS, SurahMeta } from './quran114List';

export interface QuranAyah {
  number: number;
  globalNumber: number;
  arabic: string;
  transliteration: string;
  translation: string;
  juz: number;
  page: number;
  sajda: boolean;
  audioUrl: string;
}

export interface QuranSurahDetail extends SurahMeta {
  ayahs: QuranAyah[];
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  subtext: string;
}

export const QURAN_RECITERS: Reciter[] = [
  {
    id: 'ar.alafasy',
    name: 'Mishary Rashid Alafasy',
    arabicName: 'مشاري بن راشد العفاسي',
    subtext: 'Clear & Melodic (Default)',
  },
  {
    id: 'ar.abdurrahmaansudais',
    name: 'Abdul Rahman Al-Sudais',
    arabicName: 'عبد الرحمن السديس',
    subtext: 'Imam of Masjid al-Haram, Makkah',
  },
  {
    id: 'ar.mahermuaiqly',
    name: 'Maher Al-Muaiqly',
    arabicName: 'ماهر المعيقلي',
    subtext: 'Emotional & Moving',
  },
  {
    id: 'ar.saadalghamidi',
    name: 'Saad Al-Ghamdi',
    arabicName: 'سعد الغامدي',
    subtext: 'Gentle & Rhythmic',
  },
  {
    id: 'ar.shaatree',
    name: 'Abu Bakr Ash-Shatri',
    arabicName: 'أبو بكر الشاطري',
    subtext: 'Reverent & Slow Pace',
  },
];

export const POPULAR_SURAHS_NUMBERS = [1, 2, 18, 36, 55, 56, 67, 112, 113, 114];

// Memory cache for active session
const memoryCache = new Map<number, QuranSurahDetail>();

// Local storage prefix
const CACHE_PREFIX = 'zikrmate_quran_cache_surah_';

/**
 * Remove prefixed Bismillah from verse 1 for surahs 2..114 (except 9 which has no Bismillah)
 * so that displaying the Bismillah calligraphy header above the verses doesn't duplicate it.
 */
function cleanVerse1Arabic(surahNumber: number, verseNumber: number, text: string): string {
  if (surahNumber !== 1 && surahNumber !== 9 && verseNumber === 1) {
    return text.replace(/^(?:﻿)?بِسْمِ\s*ٱللَّهِ\s*ٱلرَّحْمَٰنِ\s*ٱلرَّحِيمِ\s*/u, '').trim();
  }
  return text.trim();
}

/**
 * Get Surah from cache if available (memory or localStorage)
 */
export function getCachedSurah(surahNumber: number): QuranSurahDetail | null {
  if (memoryCache.has(surahNumber)) {
    return memoryCache.get(surahNumber)!;
  }
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${surahNumber}`);
    if (raw) {
      const parsed = JSON.parse(raw) as QuranSurahDetail;
      memoryCache.set(surahNumber, parsed);
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to read surah cache', err);
  }
  return null;
}

/**
 * Save surah to cache
 */
export function saveCachedSurah(surah: QuranSurahDetail): void {
  memoryCache.set(surah.number, surah);
  try {
    localStorage.setItem(`${CACHE_PREFIX}${surah.number}`, JSON.stringify(surah));
  } catch (err) {
    // If quota exceeded, clean up old non-vital cached surahs
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_PREFIX)) {
          const num = parseInt(key.replace(CACHE_PREFIX, ''), 10);
          if (!POPULAR_SURAHS_NUMBERS.includes(num)) {
            localStorage.removeItem(key);
          }
        }
      }
      localStorage.setItem(`${CACHE_PREFIX}${surah.number}`, JSON.stringify(surah));
    } catch {
      // Ignore storage errors, memoryCache still holds it
    }
  }
}

/**
 * Fetch full Surah with all Ayahs (Arabic Uthmani + English Translation + Transliteration)
 */
export async function fetchSurah(
  surahNumber: number,
  reciterId: string = 'ar.alafasy'
): Promise<QuranSurahDetail> {
  const meta = ALL_114_SURAHS.find((s) => s.number === surahNumber);
  if (!meta) {
    throw new Error(`Surah ${surahNumber} not found in Quran index.`);
  }

  // Check cache first
  const cached = getCachedSurah(surahNumber);
  if (cached && cached.ayahs && cached.ayahs.length === meta.numberOfAyahs) {
    // Update audio URLs if reciter changed
    const updatedAyahs = cached.ayahs.map((ayah) => ({
      ...ayah,
      audioUrl: `https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayah.globalNumber}.mp3`,
    }));
    return {
      ...cached,
      audioUrl: `https://cdn.islamic.network/quran/audio-surah/128/${reciterId}/${surahNumber}.mp3`,
      ayahs: updatedAyahs,
    };
  }

  // Fetch from Al-Quran Cloud API
  const apiUrl = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,en.transliteration`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Failed to load Surah ${meta.englishName} (HTTP ${response.status})`);
  }

  const result = await response.json();
  if (result.code !== 200 || !Array.isArray(result.data) || result.data.length < 2) {
    throw new Error('Received unexpected Quran API response format');
  }

  const arabicData = result.data[0];
  const translationData = result.data[1];
  const transliterationData = result.data[2] || { ayahs: [] };

  const ayahs: QuranAyah[] = arabicData.ayahs.map((arAyah: any, index: number) => {
    const verseNum = arAyah.numberInSurah;
    const globalNum = arAyah.number;
    const translation = translationData.ayahs[index]?.text || '';
    const transliteration = transliterationData.ayahs[index]?.text || '';
    const rawArabic = arAyah.text || '';
    const cleanArabic = cleanVerse1Arabic(surahNumber, verseNum, rawArabic);

    return {
      number: verseNum,
      globalNumber: globalNum,
      arabic: cleanArabic,
      transliteration,
      translation,
      juz: arAyah.juz || meta.startJuz,
      page: arAyah.page || 1,
      sajda: Boolean(arAyah.sajda),
      audioUrl: `https://cdn.islamic.network/quran/audio/128/${reciterId}/${globalNum}.mp3`,
    };
  });

  const detail: QuranSurahDetail = {
    ...meta,
    audioUrl: `https://cdn.islamic.network/quran/audio-surah/128/${reciterId}/${surahNumber}.mp3`,
    ayahs,
  };

  // Save to cache
  saveCachedSurah(detail);

  // Prefetch next Surah in background after slight delay
  if (surahNumber < 114) {
    setTimeout(() => {
      preloadSurah(surahNumber + 1, reciterId).catch(() => {});
    }, 1200);
  }

  return detail;
}

/**
 * Preload a surah in background without blocking
 */
export async function preloadSurah(surahNumber: number, reciterId: string = 'ar.alafasy'): Promise<void> {
  if (getCachedSurah(surahNumber)) return;
  try {
    await fetchSurah(surahNumber, reciterId);
  } catch {
    // Silent background catch
  }
}
