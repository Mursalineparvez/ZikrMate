import React from 'react';
import { RotateCcw, BookmarkPlus, Sparkles, CheckCircle } from 'lucide-react';

interface CircularCenterCounterProps {
  totalCount: number;
  totalZikrs: number;
  completedGoals: number;
  onGlobalReset: () => void;
  onSaveSession: () => void;
}

export const CircularCenterCounter: React.FC<CircularCenterCounterProps> = ({
  totalCount,
  totalZikrs,
  completedGoals,
  onGlobalReset,
  onSaveSession,
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-emerald-950/40 to-slate-950/90 border border-emerald-600/30 p-6 sm:p-8 shadow-2xl shadow-emerald-950/60 flex flex-col items-center justify-center text-center">
      {/* Decorative ambient flares */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Quranic Bismillah */}
      <div className="relative z-10 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Central Master Counter
        </div>
        <div className="font-arabic text-2xl sm:text-3xl text-amber-200/95 font-bold tracking-wide">
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </div>
        <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
          Sum of all active individual Zikir beads in real time
        </p>
      </div>

      {/* Large Circular Center Total Counter (Per Specification Section 2) */}
      <div className="relative z-10 my-3 flex items-center justify-center">
        {/* Outer pulsing halo */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full p-2 bg-gradient-to-tr from-emerald-600/40 via-amber-400/30 to-teal-400/40 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/90 flex items-center justify-center">
          
          {/* Inner Circular Dial with subtle beads decorative ring */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 border border-emerald-700/60 flex flex-col items-center justify-center p-4 relative shadow-inner">
            
            {/* 12 decorative mini beads around edge */}
            <div className="absolute inset-2 border border-dashed border-emerald-500/30 rounded-full pointer-events-none" />

            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Total Center Counter
            </span>

            {/* Giant Prominent Digits */}
            <div className="text-5xl sm:text-6xl font-black text-amber-300 tracking-tight font-sans drop-shadow-md select-none transition-transform duration-150">
              {totalCount.toLocaleString()}
            </div>

            <span className="text-[11px] font-semibold text-slate-300 mt-1">
              Total Invocations
            </span>

            {/* Sub-metrics indicator inside ring */}
            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-800">
              <span>{totalZikrs} Counters</span>
              <span>•</span>
              <span className="text-emerald-300 font-semibold">{completedGoals} Goals Met</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls beneath Circular Counter */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 mt-4">
        {/* Save Current Session to History */}
        <button
          onClick={onSaveSession}
          title="Save this count snapshot into History log"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 text-xs font-semibold shadow-md transition active:scale-95"
        >
          <BookmarkPlus className="w-4 h-4 text-amber-300" />
          <span>Save Session to History</span>
        </button>

        {/* Global Reset with Confirmation */}
        <button
          onClick={onGlobalReset}
          title="Reset all counters to 0 (with safety confirmation prompt)"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 hover:text-red-100 text-xs font-bold transition active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All (0)</span>
        </button>
      </div>
    </section>
  );
};
