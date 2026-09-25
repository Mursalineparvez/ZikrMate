import React from 'react';
import { RotateCcw, BookmarkPlus, Sparkles } from 'lucide-react';
import { ThemeMode } from '../types';

interface CircularCenterCounterProps {
  totalCount: number;
  totalZikrs: number;
  completedGoals: number;
  onGlobalReset: () => void;
  onSaveSession: () => void;
  themeMode?: ThemeMode;
}

export const CircularCenterCounter: React.FC<CircularCenterCounterProps> = ({
  totalCount,
  totalZikrs,
  completedGoals,
  onGlobalReset,
  onSaveSession,
  themeMode = 'day',
}) => {
  const isDay = themeMode === 'day';

  return (
    <section
      className={`relative overflow-hidden rounded-[28px] transition-colors duration-300 p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-xl ${
        isDay
          ? 'bg-white border border-[#d6e8e5] shadow-[#135d66]/5'
          : 'bg-[#0a2528] border border-[#164449] shadow-black/40'
      }`}
    >
      {/* Decorative ambient flares */}
      <div
        className={`absolute top-0 right-0 w-60 h-60 rounded-full blur-3xl pointer-events-none ${
          isDay ? 'bg-teal-500/10' : 'bg-teal-400/10'
        }`}
      />
      <div
        className={`absolute bottom-0 left-0 w-60 h-60 rounded-full blur-3xl pointer-events-none ${
          isDay ? 'bg-amber-400/10' : 'bg-amber-500/10'
        }`}
      />

      {/* Top Quranic Bismillah & Kicker */}
      <div className="relative z-10 mb-3 space-y-1">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1 ${
            isDay
              ? 'bg-[#e6f3f2] text-[#1c6469] border border-[#cbe4e1]'
              : 'bg-teal-950/80 text-teal-300 border border-teal-800/60'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              isDay ? 'bg-[#1c6469]' : 'bg-teal-400'
            }`}
          />
          <span>Central Master Counter</span>
        </div>

        <div
          className={`font-arabic text-2xl sm:text-3xl font-bold tracking-wide ${
            isDay ? 'text-[#164e52]' : 'text-amber-200'
          }`}
        >
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </div>
        <p className={`text-xs ${isDay ? 'text-[#4e7478]' : 'text-teal-200/70'}`}>
          Sum of all active individual Zikir beads in real time
        </p>
      </div>

      {/* Large Circular Center Total Dial */}
      <div className="relative z-10 my-3 flex items-center justify-center">
        {/* Outer Halo */}
        <div
          className={`relative w-56 h-56 sm:w-64 sm:h-64 rounded-full p-2.5 transition-all shadow-2xl flex items-center justify-center ${
            isDay
              ? 'bg-gradient-to-tr from-[#164e52] via-[#247b82] to-[#3aa2aa] shadow-[#135d66]/20'
              : 'bg-gradient-to-tr from-teal-900 via-teal-700 to-amber-500/40 shadow-black/80'
          }`}
        >
          {/* Inner Circular Face */}
          <div
            className={`w-full h-full rounded-full flex flex-col items-center justify-center p-4 relative shadow-inner ${
              isDay
                ? 'bg-[#edf5f4] border-2 border-white'
                : 'bg-gradient-to-b from-[#061a1c] via-[#09282b] to-[#061a1c] border border-teal-600/40'
            }`}
          >
            {/* Decorative dashed bead orbit */}
            <div
              className={`absolute inset-2 border border-dashed rounded-full pointer-events-none ${
                isDay ? 'border-teal-400/40' : 'border-teal-500/30'
              }`}
            />

            <span
              className={`text-[11px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1 ${
                isDay ? 'text-[#1c6469]' : 'text-teal-400'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Total Invocations</span>
            </span>

            {/* Giant Digits */}
            <div
              className={`text-5xl sm:text-6xl font-black tracking-tight font-sans drop-shadow-sm select-none transition-transform duration-150 ${
                isDay ? 'text-[#103e42]' : 'text-amber-300'
              }`}
            >
              {totalCount.toLocaleString()}
            </div>

            <span
              className={`text-[11px] font-medium mt-1 ${
                isDay ? 'text-[#4e7478]' : 'text-slate-300'
              }`}
            >
              Master Tasbeeh Count
            </span>

            {/* Inset Sub-metrics pill */}
            <div
              className={`mt-2 flex items-center gap-2 text-[10px] px-3 py-1 rounded-full font-semibold border ${
                isDay
                  ? 'bg-white text-[#1c6469] border-[#d2ece9] shadow-sm'
                  : 'bg-[#0f3438] text-teal-200 border-[#1a4e54]'
              }`}
            >
              <span>{totalZikrs} Active Counters</span>
              <span>•</span>
              <span className={isDay ? 'text-amber-600 font-bold' : 'text-amber-300 font-bold'}>
                {completedGoals} Goals Met
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls beneath Circular Counter */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 mt-4">
        {/* Save Current Session to History (Matches the deep teal "Join Call" / "Book a Session" button in screenshot) */}
        <button
          onClick={onSaveSession}
          title="Save this count snapshot into History log"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg transition active:scale-95 cursor-pointer ${
            isDay
              ? 'bg-[#1c6469] hover:bg-[#154f53] text-white shadow-[#135d66]/20'
              : 'bg-[#14b8a6] hover:bg-[#0d9488] text-[#041f21] shadow-black/40'
          }`}
        >
          <BookmarkPlus className="w-4 h-4" />
          <span>Save Session to History</span>
        </button>

        {/* Global Reset Button */}
        <button
          onClick={onGlobalReset}
          title="Reset all counters to 0 (with safety confirmation prompt)"
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition active:scale-95 cursor-pointer border ${
            isDay
              ? 'bg-white hover:bg-red-50 text-red-600 border-red-200 shadow-sm'
              : 'bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-800/40'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All</span>
        </button>
      </div>
    </section>
  );
};
