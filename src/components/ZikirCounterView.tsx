import React from 'react';
import { ZikrItem } from '../types';
import { CircularCenterCounter } from './CircularCenterCounter';
import { ZikrCard } from './ZikrCard';
import { Plus, RotateCcw, FileText, Download, Sparkles } from 'lucide-react';

interface ZikirCounterViewProps {
  masterTotal: number;
  zikrs: ZikrItem[];
  completedGoals: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onReset: (zikr: ZikrItem) => void;
  onDelete: (zikr: ZikrItem) => void;
  onEdit: (zikr: ZikrItem) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onGlobalReset: () => void;
  onSaveSession: () => void;
  onOpenAddModal: () => void;
  onRestoreDefaults: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
}

export const ZikirCounterView: React.FC<ZikirCounterViewProps> = ({
  masterTotal,
  zikrs,
  completedGoals,
  onIncrement,
  onDecrement,
  onReset,
  onDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
  onGlobalReset,
  onSaveSession,
  onOpenAddModal,
  onRestoreDefaults,
  onExportPdf,
  isExportingPdf,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Center: Large Circular Total Counter */}
      <CircularCenterCounter
        totalCount={masterTotal}
        totalZikrs={zikrs.length}
        completedGoals={completedGoals}
        onGlobalReset={onGlobalReset}
        onSaveSession={onSaveSession}
      />

      {/* List / Grid Header with Quick Actions */}
      <div className="flex items-center justify-between px-1 pt-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Individual Zikr Counters</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 font-bold border border-emerald-800/60">
              {zikrs.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Export PDF Button */}
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-semibold px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Export PDF Report"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          {/* Add Zikr Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 text-xs text-white font-semibold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/50 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Zikr</span>
          </button>
        </div>
      </div>

      {/* Below: List/Grid of Individual Zikr Cards */}
      {zikrs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {zikrs.map((zikr, index) => (
            <ZikrCard
              key={zikr.id}
              zikr={zikr}
              index={index}
              totalCards={zikrs.length}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              onReset={() => onReset(zikr)}
              onDelete={() => onDelete(zikr)}
              onEdit={onEdit}
              onMoveUp={handleSafeMoveUp(onMoveUp, index)}
              onMoveDown={handleSafeMoveDown(onMoveDown, index)}
            />
          ))}
        </div>
      ) : (
        /* Empty State when all cards are removed */
        <div className="text-center py-16 px-4 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800 backdrop-blur-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-emerald-950 flex items-center justify-center border border-emerald-700/40 text-3xl shadow-xl shadow-emerald-950/50">
            📿
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            No Zikr Counters Remaining
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            You can restore the standard prophetic Azkar or configure your own custom invocations.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onRestoreDefaults}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Restore Defaults</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Zikr</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function handleSafeMoveUp(fn: (index: number) => void, index: number) {
  return () => fn(index);
}

function handleSafeMoveDown(fn: (index: number) => void, index: number) {
  return () => fn(index);
}
