import React, { useState, useEffect } from 'react';
import {
  AamalCheckItem,
  AamalDayLog,
  ThemeMode,
  ZikrLanguage,
} from '../types';
import {
  DEFAULT_AAMAL_ITEMS,
  getTodayDateKey,
  createInitialDayLog,
} from '../utils/aamalTrackerData';
import { AAMAL_ITEM_TRANSLATIONS, AAMAL_UI } from '../utils/appTranslations';
import {
  CheckCircle,
  Circle,
  Sparkles,
  Flame,
  Award,
  Calendar,
  BookOpen,
  Heart,
  Clock,
  RotateCcw,
  Smile,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundHaptics } from '../utils/audioHaptics';

interface AamalTrackerViewProps {
  soundEnabled: boolean;
  themeMode?: ThemeMode;
  selectedLanguage?: ZikrLanguage;
}

export const AamalTrackerView: React.FC<AamalTrackerViewProps> = ({
  soundEnabled,
  themeMode = 'night',
  selectedLanguage = 'bn',
}) => {
  const isDay = themeMode === 'day';
  const todayKey = getTodayDateKey();

  // Load today's log from localStorage
  const [dayLog, setDayLog] = useState<AamalDayLog>(() => {
    try {
      const saved = localStorage.getItem(`zikrmate_aamal_${todayKey}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return createInitialDayLog(todayKey);
  });

  // Calculate streak from previous days
  const [streakDays, setStreakDays] = useState<number>(() => {
    try {
      let streak = 0;
      const today = new Date();
      for (let i = 1; i <= 30; i++) {
        const past = new Date(today);
        past.setDate(past.getDate() - i);
        const y = past.getFullYear();
        const m = String(past.getMonth() + 1).padStart(2, '0');
        const d = String(past.getDate()).padStart(2, '0');
        const key = `zikrmate_aamal_${y}-${m}-${d}`;
        const log = localStorage.getItem(key);
        if (log) {
          const parsed = JSON.parse(log);
          const done = parsed.items.filter((item: AamalCheckItem) => item.completed).length;
          if (done >= 5) {
            streak++;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      return streak;
    } catch {
      return 0;
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`zikrmate_aamal_${todayKey}`, JSON.stringify(dayLog));
    } catch (e) {
      console.error('Failed to save Aamal log', e);
    }
  }, [dayLog, todayKey]);

  const toggleItem = (id: string) => {
    setDayLog((prev) => {
      const updated = prev.items.map((item) => {
        if (item.id === id) {
          const nextState = !item.completed;
          if (nextState) {
            if (soundEnabled) soundHaptics.playMilestone();
            soundHaptics.vibrate(30);
          } else {
            if (soundEnabled) soundHaptics.playTap();
          }
          return { ...item, completed: nextState };
        }
        return item;
      });

      const completedCount = updated.filter((i) => i.completed).length;
      const ratio = completedCount / updated.length;

      // Celebrate full completion
      if (completedCount === updated.length && soundEnabled) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      return {
        ...prev,
        items: updated,
        completedRatio: ratio,
      };
    });
  };

  const handleUpdateNotes = (notes: string) => {
    setDayLog((prev) => ({ ...prev, reflectionNotes: notes }));
  };

  const completedCount = dayLog.items.filter((i) => i.completed).length;
  const totalCount = dayLog.items.length;
  const percentCompleted = Math.round((completedCount / totalCount) * 100);

  // Group items by category
  const prayers = dayLog.items.filter((i) => i.category === 'prayer');
  const sunnahs = dayLog.items.filter((i) => i.category === 'sunnah');
  const spiritual = dayLog.items.filter((i) => ['quran', 'dhikr'].includes(i.category));
  const character = dayLog.items.filter((i) => ['charity', 'character'].includes(i.category));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#144d52] via-[#1a5e64] to-[#257277] border border-teal-400/30 p-5 sm:p-6 shadow-xl text-white">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-teal-100 text-xs font-semibold mb-2 backdrop-blur-md">
              <Award className="w-3.5 h-3.5" />
              <span>محاسبة النفس • Daily Islamic Deeds &amp; Habits</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-sm">
              {AAMAL_UI.bannerTitle[selectedLanguage]}
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-xl">
              {AAMAL_UI.bannerSub[selectedLanguage]}
            </p>
          </div>

          {/* Streak Badge */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-lg ${
            isDay
              ? 'bg-white border-[#d2ece9] text-[#103e42]'
              : 'bg-[#092226] border-amber-500/40 text-amber-300'
          }`}>
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <div className={`text-xs ${isDay ? 'text-[#507579]' : 'text-slate-400'}`}>
                {AAMAL_UI.streak[selectedLanguage]}
              </div>
              <div className="text-sm sm:text-base font-bold text-amber-400">
                {streakDays} Days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 ${
        isDay
          ? 'bg-white border-[#dcebe8]'
          : 'bg-[#0e2f36] border-[#1a515c]'
      }`}>
        <div className="space-y-2 text-center sm:text-left">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDay ? 'text-[#1c6469]' : 'text-emerald-400'}`}>
            {AAMAL_UI.dailyProgress[selectedLanguage]} ({todayKey})
          </span>
          <h3 className={`text-2xl font-extrabold ${isDay ? 'text-[#103e42]' : 'text-white'}`}>
            {completedCount} / {totalCount} {AAMAL_UI.completed[selectedLanguage]}
          </h3>
          <p className={`text-xs max-w-md ${isDay ? 'text-[#507579]' : 'text-[#8ebac0]'}`}>
            Check off each prescribed prayer, remembrance, and act of goodness as you complete them throughout your day.
          </p>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="46"
              className={isDay ? 'text-[#d8ece9]' : 'text-[#092226]'}
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r="46"
              className="text-emerald-500 transition-all duration-700 ease-out"
              strokeWidth="9"
              strokeDasharray={289}
              strokeDashoffset={289 - (289 * percentCompleted) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`text-2xl font-black ${isDay ? 'text-[#103e42]' : 'text-white'}`}>{percentCompleted}%</span>
            <span className={`text-[10px] font-bold uppercase ${isDay ? 'text-[#507579]' : 'text-[#8ebac0]'}`}>
              {AAMAL_UI.completed[selectedLanguage]}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Prescribed Fardh Prayers */}
      <div className="space-y-3">
        <h3 className={`text-sm font-bold flex items-center gap-2 ${isDay ? 'text-[#103e42]' : 'text-white'}`}>
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>The Five Prescribed Prayers (الصلوات الخمس)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {prayers.map((item) => {
            const t = AAMAL_ITEM_TRANSLATIONS[item.id]?.[selectedLanguage];
            const itemLabel = t?.label || item.label;
            const itemDetails = t?.details || item.details;
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                  item.completed
                    ? isDay
                      ? 'bg-[#eef7f6] border-[#1c6469]/50 shadow-sm'
                      : 'bg-[#092226] border-emerald-500/60 shadow-md'
                    : isDay
                    ? 'bg-white border-[#dcebe8] hover:border-[#b5dcd6]'
                    : 'bg-[#0e2f36] border-[#1a515c] hover:border-[#266e7c]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button className="text-emerald-400">
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 fill-emerald-500 text-white" />
                    ) : (
                      <Circle className={`w-5 h-5 ${isDay ? 'text-[#a2c8c4]' : 'text-slate-600'}`} />
                    )}
                  </button>
                  <div>
                    <h4 className={`text-xs sm:text-sm font-bold ${
                      item.completed
                        ? isDay ? 'text-[#1c6469] line-through' : 'text-emerald-300 line-through'
                        : isDay ? 'text-[#103e42]' : 'text-white'
                    }`}>
                      {itemLabel}
                    </h4>
                    {itemDetails && (
                      <p className={`text-[11px] mt-0.5 ${isDay ? 'text-[#6c8f93]' : 'text-slate-400'}`}>{itemDetails}</p>
                    )}
                  </div>
                </div>

                {item.arabicLabel && (
                  <span className={`font-arabic text-sm font-bold shrink-0 ${isDay ? 'text-[#165a60]' : 'text-emerald-400'}`}>
                    {item.arabicLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Sunnah & Voluntary Prayers */}
      <div className="space-y-3">
        <h3 className={`text-sm font-bold flex items-center gap-2 ${isDay ? 'text-[#103e42]' : 'text-white'}`}>
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Sunnah &amp; Voluntary Prayers (النوافل والسنن)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sunnahs.map((item) => {
            const t = AAMAL_ITEM_TRANSLATIONS[item.id]?.[selectedLanguage];
            const itemLabel = t?.label || item.label;
            const itemDetails = t?.details || item.details;
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                  item.completed
                    ? isDay
                      ? 'bg-[#eef7f6] border-[#1c6469]/50 shadow-sm'
                      : 'bg-[#092226] border-emerald-500/60 shadow-md'
                    : isDay
                    ? 'bg-white border-[#dcebe8] hover:border-[#b5dcd6]'
                    : 'bg-[#0e2f36] border-[#1a515c] hover:border-[#266e7c]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button className="text-emerald-400">
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 fill-emerald-500 text-white" />
                    ) : (
                      <Circle className={`w-5 h-5 ${isDay ? 'text-[#a2c8c4]' : 'text-slate-600'}`} />
                    )}
                  </button>
                  <div>
                    <h4 className={`text-xs sm:text-sm font-bold ${
                      item.completed
                        ? isDay ? 'text-[#1c6469] line-through' : 'text-emerald-300 line-through'
                        : isDay ? 'text-[#103e42]' : 'text-white'
                    }`}>
                      {itemLabel}
                    </h4>
                    {itemDetails && (
                      <p className={`text-[11px] mt-0.5 ${isDay ? 'text-[#6c8f93]' : 'text-slate-400'}`}>{itemDetails}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Quran, Dhikr & Character */}
      <div className="space-y-3">
        <h3 className={`text-sm font-bold flex items-center gap-2 ${isDay ? 'text-[#103e42]' : 'text-white'}`}>
          <BookOpen className="w-4 h-4 text-teal-400" />
          <span>Quran, Dhikr &amp; Acts of Goodness (القرآن والذكر والإحسان)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...spiritual, ...character].map((item) => {
            const t = AAMAL_ITEM_TRANSLATIONS[item.id]?.[selectedLanguage];
            const itemLabel = t?.label || item.label;
            const itemDetails = t?.details || item.details;
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                  item.completed
                    ? isDay
                      ? 'bg-[#eef7f6] border-[#1c6469]/50 shadow-sm'
                      : 'bg-[#092226] border-emerald-500/60 shadow-md'
                    : isDay
                    ? 'bg-white border-[#dcebe8] hover:border-[#b5dcd6]'
                    : 'bg-[#0e2f36] border-[#1a515c] hover:border-[#266e7c]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button className="text-emerald-400">
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 fill-emerald-500 text-white" />
                    ) : (
                      <Circle className={`w-5 h-5 ${isDay ? 'text-[#a2c8c4]' : 'text-slate-600'}`} />
                    )}
                  </button>
                  <div>
                    <h4 className={`text-xs sm:text-sm font-bold ${
                      item.completed
                        ? isDay ? 'text-[#1c6469] line-through' : 'text-emerald-300 line-through'
                        : isDay ? 'text-[#103e42]' : 'text-white'
                    }`}>
                      {itemLabel}
                    </h4>
                    {itemDetails && (
                      <p className={`text-[11px] mt-0.5 ${isDay ? 'text-[#6c8f93]' : 'text-slate-400'}`}>{itemDetails}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Gratitude & Reflection Box */}
      <div className={`p-5 rounded-3xl border space-y-3 ${
        isDay
          ? 'bg-white border-[#dcebe8]'
          : 'bg-[#0e2f36] border-[#1a515c]'
      }`}>
        <label className={`text-xs font-bold flex items-center gap-2 ${isDay ? 'text-[#103e42]' : 'text-white'}`}>
          <Heart className="w-4 h-4 text-rose-400" />
          <span>Daily Gratitude &amp; Soul Reflection (محاسبة النفس وشكر النعم)</span>
        </label>
        <textarea
          value={dayLog.reflectionNotes || ''}
          onChange={(e) => handleUpdateNotes(e.target.value)}
          placeholder="Write down 3 blessings you are grateful for today, or spiritual lessons learned..."
          className={`w-full h-24 rounded-2xl p-3 text-xs sm:text-sm focus:outline-none transition border ${
            isDay
              ? 'bg-[#f0f7f6] border-[#d2ece9] text-[#103e42] placeholder-[#709598] focus:border-[#1c6469]'
              : 'bg-[#092226] border-[#133c44] text-white placeholder-slate-400 focus:border-[#2dd4bf]'
          }`}
        />
      </div>
    </div>
  );
};
