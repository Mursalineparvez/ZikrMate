import { ZikrItem } from '../types';

export const DEFAULT_ZIKRS: ZikrItem[] = [
  {
    id: 'subhanallah',
    name: 'SubhanAllah',
    arabic: 'سُبْحَانَ ٱللَّٰهِ',
    transliteration: 'Subḥān Allāh',
    meaning: 'Glory be to Allah',
    count: 0,
    target: 33,
    createdAt: 1700000000001,
    color: 'emerald'
  },
  {
    id: 'alhamdulillah',
    name: 'Alhamdulillah',
    arabic: 'ٱلْحَمْدُ لِلَّٰهِ',
    transliteration: 'Al-ḥamdu lillāh',
    meaning: 'All praise is due to Allah',
    count: 0,
    target: 33,
    createdAt: 1700000000002,
    color: 'teal'
  },
  {
    id: 'allahuakbar',
    name: 'Allahu Akbar',
    arabic: 'ٱللَّٰهُ أَكْبَرُ',
    transliteration: 'Allāhu Akbar',
    meaning: 'Allah is the Greatest',
    count: 0,
    target: 34,
    createdAt: 1700000000003,
    color: 'amber'
  },
  {
    id: 'astaghfirullah',
    name: 'Astaghfirullah',
    arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ',
    transliteration: 'Astaghfirullāh',
    meaning: 'I seek forgiveness from Allah',
    count: 0,
    target: 100,
    createdAt: 1700000000004,
    color: 'cyan'
  }
];

export const PRESET_ZIKR_SUGGESTIONS = [
  {
    name: 'La ilaha illallah',
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
    transliteration: 'Lā ilāha illallāh',
    meaning: 'There is no deity worthy of worship except Allah',
    target: 100
  },
  {
    name: 'Salawat on Prophet ﷺ',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    transliteration: 'Allāhumma ṣalli ʿalā Muḥammad',
    meaning: 'O Allah, bestow peace and blessings upon Muhammad',
    target: 100
  },
  {
    name: 'SubhanAllahi wa biHamdihi',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subḥānallāhi wa bi-ḥamdih',
    meaning: 'Glory be to Allah and His is the praise',
    target: 100
  },
  {
    name: 'La Hawla wa la Quwwata illa Billah',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ',
    transliteration: 'Lā ḥawla wa lā quwwata illā billāh',
    meaning: 'There is no power nor strength except with Allah',
    target: 33
  },
  {
    name: 'HasbunAllahu wa Ni\'mal Wakeel',
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    transliteration: 'Ḥasbunallāhu wa niʿmal-wakīl',
    meaning: 'Allah is sufficient for us, and He is the best disposer of affairs',
    target: 40
  },
  {
    name: 'Ayat al-Kursi (Count)',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    transliteration: 'Allāhu lā ilāha illā huwal-ḥayyul-qayyūm',
    meaning: 'The Throne Verse recitation counter',
    target: 7
  }
];
