/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { ZikrItem } from './types';
import { DEFAULT_ZIKRS } from './utils/constants';
import { soundHaptics } from './utils/audioHaptics';
import { generateZikrPdfReport } from './utils/exportPdf';
import { Header } from './components/Header';
import { MasterCounter } from './components/MasterCounter';
import { ZikrCard } from './components/ZikrCard';
import { ZikrModal } from './components/ZikrModal';
import { ConfirmModal } from './components/ConfirmModal';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { Plus, RotateCcw, Sparkles } from 'lucide-react';

export default function App() {
  // 1. LocalStorage state persistence
  const [zikrs, setZikrs] = useState<ZikrItem[]>(() => {
    try {
      const saved = localStorage.getItem('noor_zikr_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_ZIKRS;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('noor_sound_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Modals state
  const [isZikrModalOpen, setIsZikrModalOpen] = useState(false);
  const [zikrToEdit, setZikrToEdit] = useState<ZikrItem | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isStandaloneModalOpen, setIsStandaloneModalOpen] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('noor_zikr_items', JSON.stringify(zikrs));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }, [zikrs]);

  useEffect(() => {
    try {
      localStorage.setItem('noor_sound_enabled', String(soundEnabled));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }, [soundEnabled]);

  // Register service worker if available
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // 2. Calculated Master Values
  const masterTotal = useMemo(() => {
    return zikrs.reduce((acc, item) => acc + (Number(item.count) || 0), 0);
  }, [zikrs]);

  const completedGoals = useMemo(() => {
    return zikrs.filter((item) => item.count >= item.target).length;
  }, [zikrs]);

  // 3. Counter Interactions
  const handleIncrement = (id: string) => {
    setZikrs((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextCount = item.count + 1;

          // Sound & Haptics
          if (soundEnabled) {
            soundHaptics.playBeadClick();
          }
          soundHaptics.triggerVibration('tap');

          // Check if target goal reached
          if (nextCount === item.target) {
            if (soundEnabled) {
              soundHaptics.playTargetChime();
            }
            soundHaptics.triggerVibration('target');

            // Festive celebratory confetti burst
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#10b981', '#f59e0b', '#34d399', '#fef08a'],
            });
          }

          return { ...item, count: nextCount };
        }
        return item;
      })
    );
  };

  const handleDecrement = (id: string) => {
    setZikrs((prev) =>
      prev.map((item) => {
        if (item.id === id && item.count > 0) {
          soundHaptics.triggerVibration('decrement');
          return { ...item, count: item.count - 1 };
        }
        return item;
      })
    );
  };

  const handleConfirmResetIndividual = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `Reset "${name}"?`,
      message: `Are you sure you want to reset the count for ${name} back to 0?`,
      confirmLabel: 'Reset to 0',
      isDanger: true,
      onConfirm: () => {
        setZikrs((prev) =>
          prev.map((item) => (item.id === id ? { ...item, count: 0 } : item))
        );
        soundHaptics.triggerVibration('reset');
      },
    });
  };

  const handleConfirmDelete = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete "${name}"?`,
      message: `This will permanently remove this Zikr counter and its stored count history.`,
      confirmLabel: 'Delete Zikr',
      isDanger: true,
      onConfirm: () => {
        setZikrs((prev) => prev.filter((item) => item.id !== id));
        soundHaptics.triggerVibration('reset');
      },
    });
  };

  const handleGlobalReset = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Global Reset All Counters?',
      message:
        'This will reset every individual Zikr counter back to 0. This action cannot be reversed.',
      confirmLabel: 'Reset All Counters',
      isDanger: true,
      onConfirm: () => {
        setZikrs((prev) => prev.map((item) => ({ ...item, count: 0 })));
        soundHaptics.triggerVibration('reset');
      },
    });
  };

  const handleSaveZikr = (
    data: Omit<ZikrItem, 'id' | 'createdAt' | 'count'>,
    id?: string
  ) => {
    if (id) {
      // Edit existing
      setZikrs((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item))
      );
    } else {
      // Add new
      const newItem: ZikrItem = {
        id: 'zikr_' + Date.now(),
        ...data,
        count: 0,
        createdAt: Date.now(),
      };
      setZikrs((prev) => [...prev, newItem]);
    }
  };

  const handleRestoreDefaults = () => {
    setZikrs(DEFAULT_ZIKRS);
  };

  // PDF Export execution
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await generateZikrPdfReport(zikrs, masterTotal);
    } catch (err) {
      console.error(err);
      alert('Could not export PDF. Please check your browser permissions.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="islamic-pattern min-h-screen text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header & Navigation */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          setSoundEnabled((prev) => !prev);
          if (!soundEnabled) soundHaptics.playBeadClick();
        }}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
        onOpenAddModal={() => {
          setZikrToEdit(null);
          setIsZikrModalOpen(true);
        }}
        onOpenStandaloneModal={() => setIsStandaloneModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 space-y-6">
        
        {/* Central Master Counter Section */}
        <MasterCounter
          totalCount={masterTotal}
          totalZikrs={zikrs.length}
          completedGoals={completedGoals}
          onGlobalReset={handleGlobalReset}
        />

        {/* Counters Header & Action Row */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-200">
              Individual Tasbeeh Counters
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 font-bold border border-emerald-800/60">
              {zikrs.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setZikrToEdit(null);
                setIsZikrModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-800/40 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom</span>
            </button>
          </div>
        </div>

        {/* Individual Zikr Cards Grid */}
        {zikrs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {zikrs.map((zikr) => (
              <ZikrCard
                key={zikr.id}
                zikr={zikr}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onReset={handleConfirmResetIndividual}
                onDelete={handleConfirmDelete}
                onEdit={(item) => {
                  setZikrToEdit(item);
                  setIsZikrModalOpen(true);
                }}
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
                onClick={handleRestoreDefaults}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition active:scale-95"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span>Restore Defaults</span>
              </button>
              <button
                onClick={() => {
                  setZikrToEdit(null);
                  setIsZikrModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Zikr</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Serene Footer with Quranic ayah */}
      <footer className="mt-auto border-t border-slate-900/90 bg-slate-950/80 backdrop-blur-md py-6 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="font-arabic text-lg sm:text-xl text-emerald-400 font-bold">
            أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
          </div>
          <p className="text-xs italic text-slate-400">
            "Verily, in the remembrance of Allah do hearts find rest." — Surah Ar-Ra'd (13:28)
          </p>
          <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-center gap-2">
            <span>Noor Tasbeeh PWA</span>
            <span>•</span>
            <span>100% Offline &amp; Privacy-First</span>
            <span>•</span>
            <button
              onClick={() => setIsStandaloneModalOpen(true)}
              className="text-emerald-400 hover:underline font-medium"
            >
              Export Standalone APK Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Add / Edit Zikr Modal */}
      <ZikrModal
        isOpen={isZikrModalOpen}
        zikrToEdit={zikrToEdit}
        onSave={handleSaveZikr}
        onClose={() => {
          setIsZikrModalOpen(false);
          setZikrToEdit(null);
        }}
      />

      {/* Confirmation Prompt Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        isDanger={confirmDialog.isDanger}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Standalone HTML & APK Guide Modal */}
      <StandaloneExportModal
        isOpen={isStandaloneModalOpen}
        onClose={() => setIsStandaloneModalOpen(false)}
      />
    </div>
  );
}
