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

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  screenAwake: boolean;
  theme: AppTheme;
}
