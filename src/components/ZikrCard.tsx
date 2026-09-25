import React from 'react';
import { RotateCcw, Trash2, Edit3, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';
import { ZikrItem, ThemeMode } from '../types';

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
  themeMode?: ThemeMode;
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
  themeMode = 'day',
}) => {
  const hasTarget = zikr.target !== undefined && zikr.target > 0;
  const target = zikr.target || 0;
  const isGoalMet = hasTarget && zikr.count >= target;
  const progressPercent = hasTarget ? Math.min(100, Math.round((zikr.count / target) * 100)) : 100;

  const isDay = themeMode === 'day';

  return (
    <div
      className={`relative rounded-[26px] border transition-all duration-200 p-5 sm:p-6 shadow-md flex flex-col justify-between overflow-hidden ${
        isDay
          ? isGoalMet
            ? 'bg-white border-amber-400/70 shadow-amber-500/10'
            : 'bg-white border-[#dcebe8] hover:border-[#b5dcd6] shadow-[#135d66]/5'
          : isGoalMet
          ? 'bg-[#0a2528] border-amber-500/60 shadow-amber-950/20'
          : 'bg-[#0a2528] border-[#164449] hover:border-teal-700/60 shadow-black/40'
      }`}
    >
      {/* Top Section: Name, Subtitle, Arabic, Target */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`font-bold text-base sm:text-lg tracking-tight truncate ${
                isDay ? 'text-[#103e42]' : 'text-white'
              }`}
            >
              {zikr.name}
            </h3>
            {isGoalMet && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                Goal Met
              </span>
            )}
          </div>
          {zikr.transliteration && (
            <div className={`text-xs italic truncate ${isDay ? 'text-[#507579]' : 'text-teal-200/70'}`}>
              {zikr.transliteration}
            </div>
          )}
          {zikr.meaning && (
            <div className={`text-[11px] line-clamp-1 ${isDay ? 'text-[#6c8f93]' : 'text-slate-400'}`}>
              {zikr.meaning}
            </div>
          )}
        </div>

        <div className="text-right flex flex-col items-end shrink-0">
          {zikr.arabic && (
            <div
              className={`font-arabic text-2xl sm:text-3xl font-bold leading-tight ${
                isDay ? 'text-[#165a60]' : 'text-teal-300'
              }`}
              dir="rtl"
            >
              {zikr.arabic}
            </div>
          )}
          <div className={`text-[11px] font-medium mt-1 ${isDay ? 'text-[#6c8f93]' : 'text-slate-400'}`}>
            Target: <span className="font-bold text-amber-500">{hasTarget ? target : 'None'}</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Count Inset Box (Matches Doctor Availability stat boxes in screenshot) */}
      <div
        className={`my-2 p-4 rounded-2xl border transition-colors ${
          isDay
            ? 'bg-[#f0f7f6] border-[#d2ece9]'
            : 'bg-[#06181a] border-[#11383d]'
        }`}
      >
        <div className="flex items-baseline justify-between mb-1.5">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDay ? 'text-[#507579]' : 'text-slate-400'}`}>
            Count
          </span>
          {hasTarget && (
            <span className={`text-xs font-bold ${isDay ? 'text-[#165a60]' : 'text-teal-400'}`}>
              {progressPercent}% Complete
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div
            className={`text-4xl sm:text-5xl font-black tracking-tight font-sans select-none ${
              isDay ? 'text-[#103e42]' : 'text-white'
            }`}
          >
            {zikr.count.toLocaleString()}
          </div>
          <div
            className={`text-xs font-semibold px-2.5 py-1 rounded-xl border ${
              isDay
                ? 'bg-white border-[#cde5e2] text-[#1c6469]'
                : 'bg-[#0f3438] border-[#194e54] text-teal-200'
            }`}
          >
            {hasTarget ? `${zikr.count} / ${target}` : `${zikr.count}`}
          </div>
        </div>

        {/* Progress Bar */}
        {hasTarget && (
          <div
            className={`w-full h-2 rounded-full overflow-hidden mt-3 ${
              isDay ? 'bg-[#d8ece9]' : 'bg-slate-800'
            }`}
          >
            <div
              className={`h-full transition-all duration-300 ${
                isGoalMet
                  ? 'bg-amber-400'
                  : isDay
                  ? 'bg-[#1c6469]'
                  : 'bg-teal-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Primary Action Button: Giant Tap Count (Matches "Book a Session" / "Join Call" in screenshot) */}
      <button
        onClick={() => onIncrement(zikr.id)}
        className={`w-full py-4 mt-3 rounded-2xl text-base font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
          isDay
            ? 'bg-[#1c6469] hover:bg-[#154f53] text-white shadow-[#135d66]/20'
            : 'bg-[#14b8a6] hover:bg-[#0d9488] text-[#041f21] shadow-black/40'
        }`}
      >
        <span>+1 Count ({zikr.name})</span>
      </button>

      {/* Secondary Controls Bar: Decrement, Reset, Edit, Delete, Reorder */}
      <div className="flex items-center justify-between gap-1.5 mt-3 pt-3 border-t border-dashed border-[#dcebe8] dark:border-[#164449]">
        <div className="flex items-center gap-1">
          {/* Decrement Button */}
          <button
            onClick={() => onDecrement(zikr.id)}
            disabled={zikr.count <= 0}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-40 cursor-pointer border ${
              isDay
                ? 'bg-[#eef7f6] hover:bg-[#e2f1f0] text-[#1c6469] border-[#d0e6e3]'
                : 'bg-[#0e3034] hover:bg-[#133d42] text-[#99f6e4] border-[#184a50]'
            }`}
            title="Decrement -1"
          >
            -1
          </button>

          {/* Reset Button */}
          <button
            onClick={() => onReset(zikr.id, zikr.name)}
            className={`p-1.5 rounded-xl transition active:scale-95 cursor-pointer border ${
              isDay
                ? 'bg-[#eef7f6] hover:bg-[#e2f1f0] text-[#507579] hover:text-[#1c6469] border-[#d0e6e3]'
                : 'bg-[#0e3034] hover:bg-[#133d42] text-slate-400 hover:text-white border-[#184a50]'
            }`}
            title="Reset to 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Reorder Up */}
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className={`p-1.5 rounded-xl transition active:scale-95 disabled:opacity-30 cursor-pointer border ${
              isDay
                ? 'bg-[#eef7f6] hover:bg-[#e2f1f0] text-[#507579] border-[#d0e6e3]'
                : 'bg-[#0e3034] text-slate-400 border-[#184a50]'
            }`}
            title="Move Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          {/* Reorder Down */}
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === totalCards - 1}
            className={`p-1.5 rounded-xl transition active:scale-95 disabled:opacity-30 cursor-pointer border ${
              isDay
                ? 'bg-[#eef7f6] hover:bg-[#e2f1f0] text-[#507579] border-[#d0e6e3]'
                : 'bg-[#0e3034] text-slate-400 border-[#184a50]'
            }`}
            title="Move Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(zikr)}
            className={`p-1.5 rounded-xl transition active:scale-95 cursor-pointer border ${
              isDay
                ? 'bg-[#eef7f6] hover:bg-[#e2f1f0] text-[#507579] hover:text-[#1c6469] border-[#d0e6e3]'
                : 'bg-[#0e3034] hover:bg-[#133d42] text-slate-400 hover:text-white border-[#184a50]'
            }`}
            title="Edit Zikr"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(zikr.id, zikr.name)}
            className={`p-1.5 rounded-xl transition active:scale-95 cursor-pointer border ${
              isDay
                ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                : 'bg-red-950/40 hover:bg-red-900/60 text-red-400 border-red-800/40'
            }`}
            title="Delete Zikr"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
