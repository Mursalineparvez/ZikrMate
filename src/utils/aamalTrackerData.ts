import { AamalCheckItem, AamalDayLog } from '../types';

export const DEFAULT_AAMAL_ITEMS: Omit<AamalCheckItem, 'completed'>[] = [
  // 5 Prescribed Prayers
  {
    id: 'fajr',
    label: 'Fajr Prayer (صلاة الفجر)',
    category: 'prayer',
    arabicLabel: 'الفجر',
    points: 20,
    details: '2 Sunnah + 2 Fardh prayed on time before sunrise',
  },
  {
    id: 'dhuhr',
    label: 'Dhuhr Prayer (صلاة الظهر)',
    category: 'prayer',
    arabicLabel: 'الظهر',
    points: 20,
    details: '4 Fardh (+ Sunnah before & after)',
  },
  {
    id: 'asr',
    label: 'Asr Prayer (صلاة العصر)',
    category: 'prayer',
    arabicLabel: 'العصر',
    points: 20,
    details: '4 Fardh prayed on time in the afternoon',
  },
  {
    id: 'maghrib',
    label: 'Maghrib Prayer (صلاة المغرب)',
    category: 'prayer',
    arabicLabel: 'المغرب',
    points: 20,
    details: '3 Fardh (+ 2 Sunnah after)',
  },
  {
    id: 'isha',
    label: 'Isha & Witr (صلاة العشاء والوتر)',
    category: 'prayer',
    arabicLabel: 'العشاء',
    points: 20,
    details: '4 Fardh + 2 Sunnah + Witr before sleeping',
  },

  // Daily Sunnah & Nawafil
  {
    id: 'tahajjud',
    label: 'Tahajjud / Qiyam al-Layl (قيام الليل)',
    category: 'sunnah',
    arabicLabel: 'التهجد',
    points: 15,
    details: 'Voluntary night prayer in the last third of the night',
  },
  {
    id: 'duha',
    label: 'Duha Prayer (صلاة الضحى)',
    category: 'sunnah',
    arabicLabel: 'الضحى',
    points: 10,
    details: '2 or 4 rak\'ahs mid-morning charity for 360 joints',
  },

  // Quran & Sacred Remembrance
  {
    id: 'quran_recitation',
    label: 'Daily Quran Tilawah (تلاوة القرآن)',
    category: 'quran',
    arabicLabel: 'القرآن',
    points: 15,
    details: 'Recite at least 1 Rub/Hizb or Surah Al-Mulk',
  },
  {
    id: 'morning_evening_adhkar',
    label: 'Morning & Evening Adhkar (أذكار الصباح والمساء)',
    category: 'dhikr',
    arabicLabel: 'الأذكار',
    points: 15,
    details: 'Protective fortress adhkar from Hisnul Muslim',
  },
  {
    id: 'salawat_prophet',
    label: '100x Salawat upon Prophet ﷺ (الصلاة على النبي)',
    category: 'dhikr',
    arabicLabel: 'الصلاة على النبي',
    points: 10,
    details: 'Allāhumma ṣalli \'alā Sayyidinā Muḥammad',
  },
  {
    id: 'istighfar_100',
    label: '100x Daily Istighfar (الاستغفار اليومي)',
    category: 'dhikr',
    arabicLabel: 'الاستغفار',
    points: 10,
    details: 'Astaghfirullāha wa atūbu ilayh',
  },

  // Charity & Akhlaq
  {
    id: 'sadaqah_kindness',
    label: 'Daily Sadaqah or Act of Mercy (صدقة وإحسان)',
    category: 'charity',
    arabicLabel: 'الصدقة',
    points: 10,
    details: 'Monetary charity, feeding someone, or bringing joy to a family member',
  },
  {
    id: 'gratitude_reflection',
    label: 'Gratitude & Contemplation (شكر النعم)',
    category: 'character',
    arabicLabel: 'الشكر',
    points: 10,
    details: 'Consciously thanking Allah for 3 specific blessings today',
  },
];

export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createInitialDayLog(dateKey: string = getTodayDateKey()): AamalDayLog {
  const items: AamalCheckItem[] = DEFAULT_AAMAL_ITEMS.map((item) => ({
    ...item,
    completed: false,
  }));

  return {
    dateKey,
    items,
    quranPagesRead: 0,
    dhikrCount: 0,
    reflectionNotes: '',
    completedRatio: 0,
  };
}
