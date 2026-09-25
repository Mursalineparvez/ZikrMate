export interface KitabChapter {
  id: string;
  chapterNumber: number;
  title: string;
  arabicTitle?: string;
  content: string;
  keyTakeaways: string[];
}

export interface KitabItem {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  icon: string;
  chapters: KitabChapter[];
}

export const ISLAMIC_KITABS: KitabItem[] = [
  {
    id: 'hisnul_muslim',
    title: 'Hisnul Muslim (حصن المسلم)',
    author: 'Sheikh Sa\'id bin Ali bin Wahf Al-Qahtani',
    category: 'Adhkar & Fortress of the Muslim',
    icon: '🛡️',
    description: 'The authentic, indispensable pocket treasury of supplications from the Quran and Sunnah.',
    chapters: [
      {
        id: 'hm_1',
        chapterNumber: 1,
        title: 'Remembrance upon Waking Up',
        arabicTitle: 'أذكار الاستيقاظ من النوم',
        content: `1. "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ"
(Al-ḥamdu lillāhil-ladhī aḥyānā ba'da mā amātanā wa ilayhin-nushūr)
"All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection." [Al-Bukhari]

2. "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ"
Whoever says this when waking up, then says: "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ" and seeks forgiveness, his prayer is accepted.`,
        keyTakeaways: [
          'Greet every morning with gratitude for the gift of life.',
          'Acknowledging Allah before any worldly distraction safeguards the soul.',
        ],
      },
      {
        id: 'hm_2',
        chapterNumber: 2,
        title: 'Remembrance Before Sleep',
        arabicTitle: 'أذكار النوم',
        content: `1. Recite Ayat al-Kursi (Surah Al-Baqarah 2:255). A guardian angel protects you and Satan cannot approach you until morning.

2. Cupping hands together, recite Surah Al-Ikhlas, Al-Falaq, and An-Nas, blow into them, and wipe over whatever possible of the body starting from the head and face (3 times).

3. "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ"
(Bismika Rabbī waḍa'tu jambī wa bika arfa'uh)
"In Your name my Lord, I lie down and in Your name I rise." [Al-Bukhari]`,
        keyTakeaways: [
          'Ayat al-Kursi provides absolute divine guardianship throughout the night.',
          'Wiping the body with the three Quls protects from nightmare, evil eye, and harm.',
        ],
      },
    ],
  },
  {
    id: 'forty_hadith_nawawi',
    title: 'An-Nawawi\'s 40 Hadith (الأربعون النووية)',
    author: 'Imam Yahya ibn Sharaf an-Nawawi (d. 676 AH)',
    category: 'Foundations of Islam',
    icon: '📜',
    description: 'The golden bedrock of Islamic jurisprudence, ethics, and spirituality compiled by Imam an-Nawawi.',
    chapters: [
      {
        id: 'nawawi_1',
        chapterNumber: 1,
        title: 'Hadith 1: Actions are by Intentions',
        arabicTitle: 'إنما الأعمال بالنيات',
        content: `عَنْ أَمِيرِ الْمُؤْمِنِينَ أَبِي حَفْصٍ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ:
"إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ."

On the authority of Omar bin Al-Khattab (RA): I heard the Messenger of Allah ﷺ say:
"Actions are judged by intentions, and every person will get the reward according to what he has intended. So whoever emigrated for Allah and His Messenger, his emigration is for Allah and His Messenger; and whoever emigrated for worldly benefit or for a woman to marry, his emigration was for what he emigrated for." [Bukhari & Muslim]`,
        keyTakeaways: [
          'Sincerity (Ikhlas) is the prerequisite for all spiritual acceptance.',
          'Even mundane daily activities (work, eating, sleeping) earn divine reward if intended for Allah.',
        ],
      },
      {
        id: 'nawawi_2',
        chapterNumber: 2,
        title: 'Hadith 2: Islam, Iman & Ihsan (Hadith Jibreel)',
        arabicTitle: 'مراتب الدين: الإسلام، الإيمان، الإحسان',
        content: `Jibreel (Gabriel) AS came in pure white garments to teach the companions:
- Islam is: Testifying none is worthy of worship but Allah and Muhammad is His Messenger, establishing Salah, paying Zakah, fasting Ramadan, and performing Hajj.
- Iman is: To believe in Allah, His Angels, His Books, His Messengers, the Last Day, and Divine Decree (Qadr) - its good and its bad.
- Ihsan is: "To worship Allah as though you see Him, and if you cannot see Him, then know that He sees you." [Sahih Muslim]`,
        keyTakeaways: [
          'Islam comprises outward actions; Iman comprises inward convictions; Ihsan is spiritual excellence.',
          'Living with the consciousness of Allah\'s sight purifies the believer from hypocrisy.',
        ],
      },
    ],
  },
  {
    id: 'kitab_at_tawheed',
    title: 'Kitab at-Tawheed (كتاب التوحيد)',
    author: 'Sheikh Muhammad ibn Abd al-Wahhab',
    category: 'Islamic Monotheism & Creed',
    icon: '✨',
    description: 'The definitive text on the rights of Allah over His servants and the reality of pure Monotheism.',
    chapters: [
      {
        id: 'kt_1',
        chapterNumber: 1,
        title: 'The Purpose of Creation',
        arabicTitle: 'باب فضل التوحيد وما يكفر من الذنوب',
        content: `Allah the Almighty declares:
"وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ"
"And I did not create the jinn and mankind except to worship Me." [Surah Adh-Dhariyat 51:56]

And the Prophet ﷺ said to Mu'adh ibn Jabal (RA): "Do you know what is the right of Allah upon His servants and the right of the servants upon Allah? The right of Allah upon the servants is that they worship Him alone and associate nothing with Him; and the right of the servants upon Allah is that He will not punish whoever associates nothing with Him." [Sahih al-Bukhari & Muslim]`,
        keyTakeaways: [
          'The ultimate meaning of existence is the realization of Tawheed (worshipping the Creator alone).',
          'Pure monotheism is the greatest expiation for sins.',
        ],
      },
    ],
  },
  {
    id: 'fiqh_us_salah',
    title: 'Fiqh of Salah & Purification (فقه الصلاة والطهارة)',
    author: 'Compiled from authentic Sunnah Jurisprudence',
    category: 'Practical Worship & Rulings',
    icon: '🕌',
    description: 'Step-by-step guide to prophetic Wudu (ablution), conditions, pillars, and virtues of the 5 daily prayers.',
    chapters: [
      {
        id: 'fs_1',
        chapterNumber: 1,
        title: 'Conditions & Purification for Salah',
        arabicTitle: 'شروط الصلاة والطهارة',
        content: `The 9 Essential Conditions of Salah:
1. Islam (Belief)
2. Sanity (Aql)
3. Discernment (Tamyiz - age of understanding)
4. Purification from ritual impurity (Wudu/Ghusl)
5. Removal of physical impurities from body, clothes, and place
6. Covering the Awrah (prescribed modesty)
7. Entrance of the prescribed prayer time
8. Facing the Qiblah (the Holy Kaaba)
9. Intention (An-Niyyah in the heart)`,
        keyTakeaways: [
          'Prayer is invalid without pure Wudu and entering at the prescribed time.',
          'Facing the Qiblah unites believers across the globe toward the House of Allah.',
        ],
      },
    ],
  },
];
