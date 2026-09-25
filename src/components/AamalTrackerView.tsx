import React, { useState, useEffect } from 'react';
import {
  AamalCheckItem,
  AamalDayLog,
} from '../types';
import {
  DEFAULT_AAMAL_ITEMS,
  getTodayDateKey,
  createInitialDayLog,
} from '../utils/aamalTrackerData';
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
}

export const AamalTrackerView: React.FC<AamalTrackerViewProps> = ({ soundEnabled }) => {
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
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${day}`;
        const saved = localStorage.getItem(`zikrmate_aamal_${key}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.completedRatio > 0.5) {
            streak++;
          } else if (i > 0) {
            break;
          }
        } else if (i > 0) {
          break;
        }
      }
      return Math.max(1, streak);
    } catch {
      return 1;
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(`zikrmate_aamal_${todayKey}`, JSON.stringify(dayLog));
    } catch {}
  }, [dayLog, todayKey]);

  // Toggle Item Completion
  const toggleItem = (itemId: string) => {
    const updatedItems = dayLog.items.map((item) => {
      if (item.id === itemId) {
        const nextState = !item.completed;
        if (nextState) {
          if (soundEnabled) soundHaptics.playTap();
          soundHaptics.vibrate(40);
        }
        return { ...item, completed: nextState };
      }
      return item;
    });

    const completedCount = updatedItems.filter((i) => i.completed).length;
    const ratio = completedCount / updatedItems.length;

    if (ratio === 1) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#14b8a6', '#f59e0b', '#38bdf8'],
      });
      if (soundEnabled) soundHaptics.playMilestone();
    }

    setDayLog((prev) => ({
      ...prev,
      items: updatedItems,
      completedRatio: ratio,
    }));
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/80 border border-emerald-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>محاسبة النفس • Daily Islamic Deeds &amp; Habits</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Daily Aamal Tracker
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              "The most beloved of deeds to Allah are those that are consistent, even if they are small." — Sahih al-Bukhari
            </p>
          </div>

          {/* Streak Badge */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-2xl border border-amber-500/40 shadow-lg">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <div className="text-xs text-slate-400">Current Streak</div>
              <div className="text-sm sm:text-base font-bold text-amber-300">
                {streakDays} Days Consistent
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Today's Spiritual Progress ({todayKey})
          </span>
          <h3 className="text-2xl font-extrabold text-white">
            {completedCount} of {totalCount} Deeds Accomplished
          </h3>
          <p className="text-xs text-slate-400 max-w-md">
            Check off each prescribed prayer, remembrance, and act of goodness as you complete them throughout your day.
          </p>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="46"
              className="text-slate-800"
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
            <span className="text-2xl font-black text-white">{percentCompleted}%</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Done</span>
          </div>
        </div>
      </div>

      {/* Section 1: Prescribed Fardh Prayers */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>The Five Prescribed Prayers (الصلوات الخمس)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {prayers.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                item.completed
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-950/20'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <button className="text-emerald-400">
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 fill-emerald-500 text-slate-950" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600" />
                  )}
                </button>
                <div>
                  <h4 className={`text-xs sm:text-sm font-bold ${item.completed ? 'text-emerald-200 line-through' : 'text-white'}`}>
                    {item.label}
                  </h4>
                  {item.details && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.details}</p>
                  )}
                </div>
              </div>

              {item.arabicLabel && (
                <span className="font-arabic text-emerald-400 text-sm font-bold shrink-0">
                  {item.arabicLabel}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Sunnah & Voluntary Prayers */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Sunnah &amp; Voluntary Prayers (النوافل والسنن)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sunnahs.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                item.completed
                  ? 'bg-emerald-950/40 border-emerald-500/60'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <button className="text-emerald-400">
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 fill-emerald-500 text-slate-950" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600" />
                  )}
                </button>
                <div>
                  <h4 className={`text-xs sm:text-sm font-bold ${item.completed ? 'text-emerald-200 line-through' : 'text-white'}`}>
                    {item.label}
                  </h4>
                  {item.details && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.details}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Quran, Dhikr & Character */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-400" />
          <span>Quran, Dhikr &amp; Acts of Goodness (القرآن والذكر والإحسان)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...spiritual, ...character].map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                item.completed
                  ? 'bg-emerald-950/40 border-emerald-500/60'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <button className="text-emerald-400">
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 fill-emerald-500 text-slate-950" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600" />
                  )}
                </button>
                <div>
                  <h4 className={`text-xs sm:text-sm font-bold ${item.completed ? 'text-emerald-200 line-through' : 'text-white'}`}>
                    {item.label}
                  </h4>
                  {item.details && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.details}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Gratitude & Reflection Box */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-white flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          <span>Daily Gratitude &amp; Soul Reflection (محاسبة النفس وشكر النعم)</span>
        </label>
        <textarea
          value={dayLog.reflectionNotes || ''}
          onChange={(e) => handleUpdateNotes(e.target.value)}
          placeholder="Write down 3 blessings you are grateful for today, or spiritual lessons learned..."
          className="w-full h-24 bg-slate-800/80 border border-slate-700 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
        />
      </div>
    </div>
  );
};
