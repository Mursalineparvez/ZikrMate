import React from 'react';
import { HistorySession } from '../types';
import { Clock, Trash2, Calendar, FileText, BookmarkCheck, ChevronRight } from 'lucide-react';

interface HistoryViewProps {
  sessions: HistorySession[];
  onClearHistory: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  onClose?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onClearHistory,
  onExportPdf,
  isExportingPdf,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-emerald-900/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/40 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Session Logs &amp; Records</span>
          </div>
          <h2 className="text-xl font-bold text-white">Tasbeeh History Summary</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Past saved sessions are archived here and never interfere with your live real-time counters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-900/70 hover:bg-emerald-800 border border-emerald-600/50 text-emerald-200 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
          </button>

          {sessions.length > 0 && (
            <button
              onClick={onClearHistory}
              title="Clear all archived sessions"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-semibold transition active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* History Log List */}
      {sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session, idx) => (
            <div
              key={session.id}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg transition hover:border-emerald-700/40"
            >
              {/* Session Header */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-700/40 flex items-center justify-center text-emerald-300">
                    <BookmarkCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">Session #{sessions.length - idx}</span>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{session.dateStr}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold uppercase text-slate-400">Total Count</span>
                  <div className="text-2xl font-black text-amber-300 font-sans">
                    {session.totalCount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {session.breakdown.map((item, bIdx) => (
                  <div
                    key={bIdx}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70"
                  >
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {item.name}
                    </div>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">
                      {item.count.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-950/80 flex items-center justify-center text-emerald-400 text-xl border border-emerald-800/50">
            📜
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Saved Sessions Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Tap "Save Session to History" on the center counter anytime to snapshot your count milestones!
          </p>
        </div>
      )}
    </div>
  );
};
