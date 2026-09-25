import React from 'react';
import { RotateCcw, Trash2, Edit3, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';
import { ZikrItem } from '../types';

interface ZikrCardProps {
  zikr: ZikrItem;
  index: number;
  totalCards: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onReset: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
  onEdit: (zikr: ZikrItem) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const ZikrCard: React.FC<ZikrCardProps> = ({
  zikr,
  index,
  totalCards,
  onIncrement,
  onDecrement,
  onReset,
  onDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
}) => {
  const hasTarget = zikr.target !== undefined && zikr.target > 0;
  const target = zikr.target || 0;
  const isGoalMet = hasTarget && zikr.count >= target;
  const progressPercent = hasTarget ? Math.min(100, Math.round((zikr.count / target) * 100)) : 100;

  return (
    <div
      className={`relative rounded-3xl bg-slate-900/90 border transition-all duration-200 p-5 sm:p-6 shadow-xl flex flex-col justify-between overflow-hidden ${
        isGoalMet
          ? 'border-amber-500/50 bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-900 shadow-amber-950/20'
          : 'border-emerald-800/40 hover:border-emerald-700/60 shadow-black/40'
      }`}
    >
      {/* Top Section: Name, Reorder buttons, Arabic Calligraphy & Target */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base sm:text-lg text-white tracking-tight">
              {zikr.name}
            </h3>
            {isGoalMet && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                <CheckCircle2 className="w-3 h-3" />
                Goal Met
              </span>
            )}
          </div>
          {zikr.transliteration && (
            <div className="text-xs text-slate-400 italic">
              {zikr.transliteration}
            </div>
          )}
          {zikr.meaning && (
            <div className="text-[11px] text-slate-400 max-w-xs line-clamp-1">
              {zikr.meaning}
            </div>
          )}
        </div>

        <div className="text-right flex flex-col items-end">
          {zikr.arabic && (
            <div className="font-arabic text-2xl sm:text-3xl text-emerald-400 font-bold leading-tight" dir="rtl">
              {zikr.arabic}
            </div>
          )}
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Target: <span className="text-amber-300 font-bold">{hasTarget ? target : 'None'}</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Big Digital Counter & Progress Bar */}
      <div className="my-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Individual Count
          </span>
          {hasTarget && (
            <span className="text-xs font-bold text-emerald-400">
              {progressPercent}% Complete
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-4xl sm:text-5xl font-black text-white tracking-tight font-sans">
            {zikr.count.toLocaleString()}
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-300">
            {hasTarget ? `${zikr.count} / ${target}` : `${zikr.count}`}
          </div>
        </div>

        {/* Dynamic Progress Track if Target Set */}
        {hasTarget && (
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800 mt-3">
            <div
              className={`h-full transition-all duration-300 ${
                isGoalMet
                  ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Bottom Section: Controls (Reorder, -1, Reset, Edit, Delete, Large +1 button) */}
      <div className="mt-4 pt-3 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Secondary Utility Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          
          {/* Reorder Up */}
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            title="Move Zikr Up"
            className="w-9 h-9 rounded-xl bg-slate-800/70 hover:bg-slate-700 disabled:opacity-25 flex items-center justify-center text-slate-400 hover:text-white transition active:scale-95"
            aria-label="Move Up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          {/* Reorder Down */}
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === totalCards - 1}
            title="Move Zikr Down"
            className="w-9 h-9 rounded-xl bg-slate-800/70 hover:bg-slate-700 disabled:opacity-25 flex items-center justify-center text-slate-400 hover:text-white transition active:scale-95"
            aria-label="Move Down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>

          {/* -1 Decrement Button */}
          <button
            onClick={() => onDecrement(zikr.id)}
            disabled={zikr.count === 0}
            title="Decrement count by 1"
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center text-slate-200 font-bold text-xs transition active:scale-95"
            aria-label="Decrement"
          >
            -1
          </button>

          {/* Reset Individual Counter to 0 */}
          <button
            onClick={() => onReset(zikr.id, zikr.name)}
            title="Reset individual counter to 0 (with confirmation)"
            className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-amber-950/60 hover:text-amber-300 border border-slate-700/40 hover:border-amber-700/50 flex items-center justify-center text-slate-400 transition active:scale-95"
            aria-label="Reset Count"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Edit Zikr Metadata & Target */}
          <button
            onClick={() => onEdit(zikr)}
            title="Edit Zikr name, target, and details"
            className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700/40 flex items-center justify-center text-slate-400 hover:text-white transition active:scale-95"
            aria-label="Edit Zikr"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Zikr */}
          <button
            onClick={() => onDelete(zikr.id, zikr.name)}
            title="Delete this Zikr"
            className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-red-950/60 hover:text-red-400 border border-slate-700/40 hover:border-red-800/50 flex items-center justify-center text-slate-400 transition active:scale-95"
            aria-label="Delete Zikr"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Large Primary Touch Button for +1 (Thumb-friendly touch target) */}
        <button
          onClick={() => onIncrement(zikr.id)}
          className={`flex-1 min-w-[130px] sm:max-w-[170px] h-12 rounded-2xl flex items-center justify-center gap-2 font-black text-white text-lg tracking-wider shadow-lg transition-all duration-150 active:scale-95 select-none cursor-pointer border ${
            isGoalMet
              ? 'bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 hover:from-amber-400 hover:to-emerald-500 border-amber-300/40 shadow-amber-950/50'
              : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/40 shadow-emerald-950/60'
          }`}
          aria-label={`Increment ${zikr.name}`}
        >
          <span className="text-2xl font-black leading-none">+1</span>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-100">
            Tap
          </span>
        </button>
      </div>
    </div>
  );
};
