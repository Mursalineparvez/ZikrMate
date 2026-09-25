import React, { useState } from 'react';
import { ZikrItem, ThemeMode } from '../types';
import { CircularCenterCounter } from './CircularCenterCounter';
import { ZikrCard } from './ZikrCard';
import { Plus, FileText, CheckCircle2, Target, ListFilter } from 'lucide-react';

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
  themeMode?: ThemeMode;
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
  themeMode = 'day',
}) => {
  const isDay = themeMode === 'day';
  const [filterMode, setFilterMode] = useState<'all' | 'targets' | 'completed'>('all');

  const filteredZikrs = zikrs.filter((z) => {
    if (filterMode === 'targets') return z.target && z.target > 0;
    if (filterMode === 'completed') return z.target && z.count >= z.target;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Center: Large Circular Total Counter */}
      <CircularCenterCounter
        totalCount={masterTotal}
        totalZikrs={zikrs.length}
        completedGoals={completedGoals}
        onGlobalReset={onGlobalReset}
        onSaveSession={onSaveSession}
        themeMode={themeMode}
      />

      {/* Category Pills (Exact pill style from screenshot: "Bone", "Brain expert", "Dental", etc.) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2
              className={`text-base font-bold tracking-tight flex items-center gap-2 ${
                isDay ? 'text-[#103e42]' : 'text-white'
              }`}
            >
              <span>Active Counters</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  isDay
                    ? 'bg-[#e6f3f2] text-[#1c6469] border-[#cce5e2]'
                    : 'bg-[#0f3438] text-teal-300 border-[#1a4e54]'
                }`}
              >
                {zikrs.length}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Export PDF Button */}
            <button
              onClick={onExportPdf}
              disabled={isExportingPdf}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-2xl border transition active:scale-95 disabled:opacity-50 cursor-pointer ${
                isDay
                  ? 'bg-white hover:bg-[#eef7f6] text-[#1c6469] border-[#d2ece9] shadow-sm'
                  : 'bg-[#0e3034] hover:bg-[#133d42] text-teal-200 border-[#184a50]'
              }`}
              title="Export PDF Report"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>

            {/* Add Zikr Button (Deep spruce teal from screenshot) */}
            <button
              onClick={onOpenAddModal}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-2xl shadow-md transition active:scale-95 cursor-pointer ${
                isDay
                  ? 'bg-[#1c6469] hover:bg-[#154f53] text-white shadow-[#135d66]/20'
                  : 'bg-[#14b8a6] hover:bg-[#0d9488] text-[#041f21]'
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Zikr</span>
            </button>
          </div>
        </div>

        {/* Filter Pills row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition active:scale-95 cursor-pointer whitespace-nowrap border ${
              filterMode === 'all'
                ? isDay
                  ? 'bg-[#1c6469] text-white border-[#1c6469] shadow-md shadow-[#135d66]/20'
                  : 'bg-[#14b8a6] text-[#041f21] border-[#14b8a6] shadow-md'
                : isDay
                ? 'bg-[#e6f3f2] hover:bg-[#dceedb] text-[#2e6d73] border-[#d2ece9]'
                : 'bg-[#0e3034] text-teal-200/80 border-[#184a50]'
            }`}
          >
            All ({zikrs.length})
          </button>

          <button
            onClick={() => setFilterMode('targets')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold transition active:scale-95 cursor-pointer whitespace-nowrap border ${
              filterMode === 'targets'
                ? isDay
                  ? 'bg-[#1c6469] text-white border-[#1c6469] shadow-md shadow-[#135d66]/20'
                  : 'bg-[#14b8a6] text-[#041f21] border-[#14b8a6] shadow-md'
                : isDay
                ? 'bg-[#e6f3f2] hover:bg-[#dceedb] text-[#2e6d73] border-[#d2ece9]'
                : 'bg-[#0e3034] text-teal-200/80 border-[#184a50]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>With Target</span>
          </button>

          <button
            onClick={() => setFilterMode('completed')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold transition active:scale-95 cursor-pointer whitespace-nowrap border ${
              filterMode === 'completed'
                ? isDay
                  ? 'bg-[#1c6469] text-white border-[#1c6469] shadow-md shadow-[#135d66]/20'
                  : 'bg-[#14b8a6] text-[#041f21] border-[#14b8a6] shadow-md'
                : isDay
                ? 'bg-[#e6f3f2] hover:bg-[#dceedb] text-[#2e6d73] border-[#d2ece9]'
                : 'bg-[#0e3034] text-teal-200/80 border-[#184a50]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed ({completedGoals})</span>
          </button>
        </div>
      </div>

      {/* Below: List/Grid of Individual Zikr Cards */}
      {filteredZikrs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredZikrs.map((zikr, index) => (
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
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              themeMode={themeMode}
            />
          ))}
        </div>
      ) : (
        <div
          className={`p-10 text-center rounded-[28px] border ${
            isDay
              ? 'bg-white border-[#dcebe8] shadow-sm'
              : 'bg-[#0a2528] border-[#164449]'
          }`}
        >
          <p className={`text-sm font-semibold ${isDay ? 'text-[#103e42]' : 'text-slate-300'}`}>
            No zikr counters found in this filter.
          </p>
          <button
            onClick={() => setFilterMode('all')}
            className="mt-3 px-4 py-2 rounded-xl bg-[#1c6469] text-white text-xs font-bold transition active:scale-95"
          >
            Show All Counters
          </button>
        </div>
      )}
    </div>
  );
};
