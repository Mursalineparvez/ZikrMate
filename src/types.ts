export interface ZikrItem {
  id: string;
  name: string;
  arabic?: string;
  transliteration?: string;
  meaning?: string;
  count: number;
  target?: number;
  createdAt: number;
  updatedAt: number;
  color?: string;
}

export interface HistorySession {
  id: string;
  timestamp: number;
  dateStr: string;
  totalCount: number;
  note?: string;
  breakdown: Array<{
    name: string;
    count: number;
    target?: number;
    arabic?: string;
  }>;
}

export type AppTheme = 'emerald' | 'midnight' | 'teal' | 'gold' | 'light';

export type NavModule =
  | 'zikir_counter'
  | 'quran'
  | 'kitab'
  | 'hadith'
  | 'salat_time'
  | 'dua'
  | 'aamal_tracker';

export type DuaCategory =
  | 'salat'
  | 'quran'
  | 'hadith'
  | 'morning_evening'
  | 'sleep_wake'
  | 'protection'
  | 'forgiveness'
  | 'hardship'
  | 'quranic'
  | 'daily_living';

export interface DuaItem {
  id: string;
  title: string;
  category: DuaCategory;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  virtue?: string;
  suggestedCount?: number;
  timing?: string;
}

export interface HadithItem {
  id: string;
  book: 'Sahih al-Bukhari' | 'Sahih Muslim' | 'Sunan Abi Dawud' | 'Jami` at-Tirmidhi' | 'An-Nawawi 40 Hadith';
  hadithNumber: string;
  chapter: string;
  narrator: string;
  arabicText: string;
  englishTranslation: string;
  topic: 'Faith & Tawheed' | 'Salah & Purification' | 'Character & Akhlaq' | 'Dhikr & Dua' | 'Charity & Kindness' | 'Patience & Trials' | 'Repentance & Mercy';
  grade: 'Sahih' | 'Hasan';
  reflection?: string;
}

export interface AamalCheckItem {
  id: string;
  label: string;
  category: 'prayer' | 'sunnah' | 'quran' | 'dhikr' | 'charity' | 'character';
  arabicLabel?: string;
  completed: boolean;
  points: number;
  details?: string;
}

export interface AamalDayLog {
  dateKey: string; // YYYY-MM-DD
  items: AamalCheckItem[];
  quranPagesRead: number;
  dhikrCount: number;
  reflectionNotes?: string;
  completedRatio: number; // 0 to 1
}

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  screenAwake: boolean;
  theme: AppTheme;
}
