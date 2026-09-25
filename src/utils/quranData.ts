export interface QuranAyah {
  number: number;
  arabic: string;
  transliteration: string;
  translation: string;
}

export interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  audioUrl?: string;
  ayahs: QuranAyah[];
}

export const QURAN_SURAHS: QuranSurah[] = [
  {
    number: 1,
    name: 'الفاتحة',
    englishName: 'Al-Fatihah',
    englishNameTranslation: 'The Opening',
    numberOfAyahs: 7,
    revelationType: 'Meccan',
    audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/1.mp3',
    ayahs: [
      {
        number: 1,
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Bismillāhir-Raḥmānir-Raḥīm',
        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      },
      {
        number: 2,
        arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        transliteration: 'Al-ḥamdu lillāhi Rabbil-\'ālamīn',
        translation: '[All] praise is [due] to Allah, Lord of the worlds.',
      },
      {
        number: 3,
        arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Ar-Raḥmānir-Raḥīm',
        translation: 'The Entirely Merciful, the Especially Merciful,',
      },
      {
        number: 4,
        arabic: 'مَالِكِ يَوْمِ الدِّينِ',
        transliteration: 'Māliki yawmid-dīn',
        translation: 'Sovereign of the Day of Recompense.',
      },
      {
        number: 5,
        arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        transliteration: 'Iyyāka na\'budu wa iyyāka nasta\'īn',
        translation: 'It is You we worship and You we ask for help.',
      },
      {
        number: 6,
        arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        transliteration: 'Ihdinaṣ-ṣirāṭal-mustaqīm',
        translation: 'Guide us to the straight path -',
      },
      {
        number: 7,
        arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        transliteration: 'Ṣirāṭal-ladhīna an\'amta \'alayhim ghayril-maghḍūbi \'alayhim wa laḍ-ḍāllīn',
        translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
      },
    ],
  },
  {
    number: 36,
    name: 'يس',
    englishName: 'Ya-Sin',
    englishNameTranslation: 'Ya-Sin (Heart of the Quran)',
    numberOfAyahs: 12,
    revelationType: 'Meccan',
    audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/36.mp3',
    ayahs: [
      {
        number: 1,
        arabic: 'يس',
        transliteration: 'Yā-Sīn',
        translation: 'Ya, Seen.',
      },
      {
        number: 2,
        arabic: 'وَالْقُرْآنِ الْحَكِيمِ',
        transliteration: 'Wal-Qur\'ānil-ḥakīm',
        translation: 'By the wise Quran,',
      },
      {
        number: 3,
        arabic: 'إِنَّكَ لَمِنَ الْمُرْسَلِينَ',
        transliteration: 'Innaka laminal-mursalīn',
        translation: 'Indeed you, [O Muhammad], are from among the messengers,',
      },
      {
        number: 4,
        arabic: 'عَلَىٰ صِرَاطٍ مُسْتَقِيمٍ',
        transliteration: '\'Alā ṣirāṭim-mustaqīm',
        translation: 'On a straight path.',
      },
      {
        number: 5,
        arabic: 'تَنزِيلَ الْعَزِيزِ الرَّحِيمِ',
        transliteration: 'Tanzīlal-\'Azīzir-Raḥīm',
        translation: '[This is] a revelation of the Exalted in Might, the Merciful,',
      },
      {
        number: 58,
        arabic: 'سَلَامٌ قَوْلًا مِّن رَّبٍّ رَّحِيمٍ',
        transliteration: 'Salāmun qawlam-mir-Rabbir-Raḥīm',
        translation: '[And] "Peace," a word from a Merciful Lord.',
      },
      {
        number: 82,
        arabic: 'إِنَّمَا أَمْرُهُ إِذَا أَرَادَ شَيْئًا أَن يَقُولَ لَهُ كُن فَيَكُونُ',
        transliteration: 'Innamā amruhū idhā arāda shay\'an ay-yaqūla lahū kun fayakūn',
        translation: 'His command is only when He intends a thing that He says to it, "Be," and it is.',
      },
      {
        number: 83,
        arabic: 'فَسُبْحَانَ الَّذِي بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ وَإِلَيْهِ تُرْجَعُونَ',
        transliteration: 'Fa-subḥānal-ladhī biyadihī malakūtu kulli shay\'iw-wa ilayhi turja\'ūn',
        translation: 'So exalted is He in whose hand is the realm of all things, and to Him you will be returned.',
      },
    ],
  },
  {
    number: 67,
    name: 'الملك',
    englishName: 'Al-Mulk',
    englishNameTranslation: 'The Sovereignty (Protection from Grave)',
    numberOfAyahs: 10,
    revelationType: 'Meccan',
    audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/67.mp3',
    ayahs: [
      {
        number: 1,
        arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
        transliteration: 'Tabārakal-ladhī biyadihil-mulku wa Huwa \'alā kulli shay\'in Qadīr',
        translation: 'Blessed is He in whose hand is dominion, and He is over all things competent -',
      },
      {
        number: 2,
        arabic: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ',
        transliteration: 'Alladhī khalaqal-mawta wal-ḥayāta liyabluwakum ayyukum aḥsanu \'amalā; wa Huwal-\'Azīzul-Ghafūr',
        translation: '[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -',
      },
      {
        number: 13,
        arabic: 'وَأَسِرُّوا قَوْلَكُمْ أَوِ اجْهَرُوا بِهِ ۖ إِنَّهُ عَلِيمٌ بِذَاتِ الصُّدُورِ',
        transliteration: 'Wa asirrū qawlakum awij-harū bih; innahū \'Alīmum-bidhātis-ṣudūr',
        translation: 'And conceal your speech or publicize it; indeed, He is Knowing of that within the breasts.',
      },
      {
        number: 14,
        arabic: 'أَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ اللَّطِيفُ الْخَبِيرُ',
        transliteration: 'Alā ya\'lamu man khalaqa wa Huwal-Laṭīful-Khabīr',
        translation: 'Does He who created not know, while He is the Subtle, the Acquainted?',
      },
    ],
  },
  {
    number: 112,
    name: 'الإخلاص',
    englishName: 'Al-Ikhlas',
    englishNameTranslation: 'The Sincerity (Monotheism)',
    numberOfAyahs: 4,
    revelationType: 'Meccan',
    audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/112.mp3',
    ayahs: [
      {
        number: 1,
        arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        transliteration: 'Qul Huwallāhu Aḥad',
        translation: 'Say, "He is Allah, [who is] One,',
      },
      {
        number: 2,
        arabic: 'اللَّهُ الصَّمَدُ',
        transliteration: 'Allāhuṣ-Ṣamad',
        translation: 'Allah, the Eternal Refuge.',
      },
      {
        number: 3,
        arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        transliteration: 'Lam yalid wa lam yūlad',
        translation: 'He neither begets nor is born,',
      },
      {
        number: 4,
        arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        transliteration: 'Wa lam yakul-lahū kufuwan aḥad',
        translation: 'Nor is there to Him any equivalent."',
      },
    ],
  },
  {
    number: 113,
    name: 'الفلق',
    englishName: 'Al-Falaq',
    englishNameTranslation: 'The Daybreak (Seeking Refuge)',
    numberOfAyahs: 5,
    revelationType: 'Meccan',
    audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/113.mp3',
    ayahs: [
      {
        number: 1,
        arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
        transliteration: 'Qul a\'ūdhu bi-Rabbil-falaq',
        translation: 'Say, "I seek refuge in the Lord of daybreak',
      },
      {
        number: 2,
        arabic: 'مِن شَرِّ مَا خَلَقَ',
        transliteration: 'Min sharri mā khalaq',
        translation: 'From the evil of that which He created',
      },
      {
        number: 3,
        arabic: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
        transliteration: 'Wa min sharri ghāsiqin idhā waqab',
        translation: 'And from the evil of darkness when it settles',
      },
      {
        number: 4,
        arabic: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
        transliteration: 'Wa min sharrin-naffāthāti fil-\'uqad',
        translation: 'And from the evil of the blowers in knots',
      },
      {
        number: 5,
        arabic: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
        transliteration: 'Wa min sharri ḥāsidin idhā ḥasad',
        translation: 'And from the evil of an envier when he envies."',
      },
    ],
  },
  {
    number: 114,
    name: 'الناس',
    englishName: 'An-Nas',
    englishNameTranslation: 'Mankind (Divine Protection)',
    numberOfAyahs: 6,
    revelationType: 'Meccan',
    audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/114.mp3',
    ayahs: [
      {
        number: 1,
        arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
        transliteration: 'Qul a\'ūdhu bi-Rabbin-nās',
        translation: 'Say, "I seek refuge in the Lord of mankind,',
      },
      {
        number: 2,
        arabic: 'مَلِكِ النَّاسِ',
        transliteration: 'Malikin-nās',
        translation: 'The Sovereign of mankind,',
      },
      {
        number: 3,
        arabic: 'إِلَٰهِ النَّاسِ',
        transliteration: 'Ilāhin-nās',
        translation: 'The God of mankind,',
      },
      {
        number: 4,
        arabic: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
        transliteration: 'Min sharril-waswāsil-khannās',
        translation: 'From the evil of the retreating whisperer -',
      },
      {
        number: 5,
        arabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
        transliteration: 'Alladhī yuwaswisu fī ṣudūrin-nās',
        translation: 'Who whispers [evil] into the breasts of mankind -',
      },
      {
        number: 6,
        arabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
        transliteration: 'Minal-jinnati wan-nās',
        translation: 'From among the jinn and mankind."',
      },
    ],
  },
];
