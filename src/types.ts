export interface ZikrItem {
  id: string;
  name: string;
  arabic?: string;
  transliteration?: string;
  meaning?: string;
  count: number;
  target: number;
  createdAt: number;
  color?: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  screenAwake: boolean;
}
