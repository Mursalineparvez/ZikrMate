/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ZikrItem, HistorySession, AppSettings } from './types';
import { DEFAULT_ZIKRS } from './utils/constants';
import { soundHaptics } from './utils/audioHaptics';
import { generateZikrPdfReport } from './utils/exportPdf';
import { Header } from './components/Header';
import { CircularCenterCounter } from './components/CircularCenterCounter';
import { ZikrCard } from './components/ZikrCard';
import { ZikrModal } from './components/ZikrModal';
import { ConfirmModal } from './components/ConfirmModal';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { Plus, RotateCcw, BookmarkCheck } from 'lucide-react';

export default function App() {
  // 1. LocalStorage state persistence for Zikr Items
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

  // History session archives (independent from live total)
  const [historySessions, setHistorySessions] = useState<HistorySession[]>(() => {
    try {
      const saved = localStorage.getItem('noor_zikr_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // App settings state
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('noor_zikr_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      soundEnabled: true,
      vibrationEnabled: true,
      screenAwake: false,
      theme: 'emerald',
    };
  });

  // Active navigation tab: 'home' | 'history' | 'settings'
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Modals state
  const [isZikrModalOpen, setIsZikrModalOpen] = useState(false);
  const [zikrToEdit, setZikrToEdit] = useState<ZikrItem | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isStandaloneModalOpen, setIsStandaloneModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Wake lock sentinel ref
  const wakeLockRef = useRef<any>(null);

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

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Save Zikrs to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('noor_zikr_items', JSON.stringify(zikrs));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }, [zikrs]);

  // Save History to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('noor_zikr_history', JSON.stringify(historySessions));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }, [historySessions]);

  // Save Settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('noor_zikr_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }, [settings]);

  // Handle Screen Wake Lock API
  useEffect(() => {
    const handleWakeLock = async () => {
      if (settings.screenAwake && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch {
          // Wake lock rejected or battery saver on
        }
      } else if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch {}
      }
    };
    handleWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [settings.screenAwake]);

  // Register service worker if available
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // 2. Calculated Master Values: SUM(all individual Zikir.count)
  const masterTotal = useMemo(() => {
    return zikrs.reduce((acc, item) => acc + (Number(item.count) || 0), 0);
  }, [zikrs]);

  const completedGoals = useMemo(() => {
    return zikrs.filter((item) => item.target && item.count >= item.target).length;
  }, [zikrs]);

  // 3. Counter Interactions
  const handleIncrement = (id: string) => {
    setZikrs((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextCount = item.count + 1;

          // Sound & Haptics
          if (settings.soundEnabled) {
            soundHaptics.playBeadClick();
          }
          if (settings.vibrationEnabled) {
            soundHaptics.triggerVibration('tap');
          }

          // Check if target goal reached
          if (item.target && nextCount === item.target) {
            if (settings.soundEnabled) {
              soundHaptics.playTargetChime();
            }
            if (settings.vibrationEnabled) {
              soundHaptics.triggerVibration('target');
            }

            // Celebratory confetti burst
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#10b981', '#f59e0b', '#34d399', '#fef08a'],
            });
          }

          return { ...item, count: nextCount, updatedAt: Date.now() };
        }
        return item;
      })
    );
  };

  const handleDecrement = (id: string) => {
    setZikrs((prev) =>
      prev.map((item) => {
        if (item.id === id && item.count > 0) {
          if (settings.vibrationEnabled) {
            soundHaptics.triggerVibration('decrement');
          }
          return { ...item, count: item.count - 1, updatedAt: Date.now() };
        }
        return item;
      })
    );
  };

  // Reordering handlers
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setZikrs((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= zikrs.length - 1) return;
    setZikrs((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Reset Individual Counter
  const handleConfirmResetIndividual = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `Reset "${name}"?`,
      message: `Are you sure you want to reset the count for ${name} back to 0?`,
      confirmLabel: 'Reset to 0',
      isDanger: true,
      onConfirm: () => {
        setZikrs((prev) =>
          prev.map((item) => (item.id === id ? { ...item, count: 0, updatedAt: Date.now() } : item))
        );
        if (settings.vibrationEnabled) {
          soundHaptics.triggerVibration('reset');
        }
      },
    });
  };

  // Delete Individual Zikr
  const handleConfirmDelete = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete "${name}"?`,
      message: `This will permanently remove this Zikr counter and its stored count history.`,
      confirmLabel: 'Delete Zikr',
      isDanger: true,
      onConfirm: () => {
        setZikrs((prev) => prev.filter((item) => item.id !== id));
        if (settings.vibrationEnabled) {
          soundHaptics.triggerVibration('reset');
        }
      },
    });
  };

  // Global Reset
  const handleGlobalReset = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Global Reset All Counters?',
      message:
        'This will reset every individual Zikr counter back to 0. This action cannot be reversed.',
      confirmLabel: 'Reset All to 0',
      isDanger: true,
      onConfirm: () => {
        setZikrs((prev) => prev.map((item) => ({ ...item, count: 0, updatedAt: Date.now() })));
        if (settings.vibrationEnabled) {
          soundHaptics.triggerVibration('reset');
        }
        showToast('All counters reset to 0');
      },
    });
  };

  // Save current count session into history archive
  const handleSaveSession = () => {
    const now = new Date();
    const newSession: HistorySession = {
      id: 'session_' + Date.now(),
      timestamp: Date.now(),
      dateStr: now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      totalCount: masterTotal,
      breakdown: zikrs.map((z) => ({
        name: z.name,
        count: z.count,
        target: z.target,
        arabic: z.arabic,
      })),
    };

    setHistorySessions((prev) => [newSession, ...prev]);
    showToast(`Session saved (${masterTotal.toLocaleString()} total count)`);
    if (settings.soundEnabled) soundHaptics.playTargetChime();
  };

  const handleClearHistory = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear Session History?',
      message: 'This will remove all saved history log records. Your active live counters will not be changed.',
      confirmLabel: 'Clear All Logs',
      isDanger: true,
      onConfirm: () => {
        setHistorySessions([]);
        showToast('Session history cleared');
      },
    });
  };

  const handleSaveZikr = (
    data: Omit<ZikrItem, 'id' | 'createdAt' | 'count' | 'updatedAt'>,
    id?: string
  ) => {
    if (id) {
      // Edit existing
      setZikrs((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data, updatedAt: Date.now() } : item))
      );
      showToast('Zikr updated');
    } else {
      // Add new
      const newItem: ZikrItem = {
        id: 'zikr_' + Date.now(),
        ...data,
        count: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setZikrs((prev) => [...prev, newItem]);
      showToast(`Added "${newItem.name}"`);
    }
  };

  const handleRestoreDefaults = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Restore Default Azkar?',
      message: 'This will restore the 4 standard prophetic Azkar counters.',
      confirmLabel: 'Restore',
      isDanger: false,
      onConfirm: () => {
        setZikrs(DEFAULT_ZIKRS);
        showToast('Restored default Azkar');
      },
    });
  };

  // PDF Export execution
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await generateZikrPdfReport(zikrs, masterTotal);
      showToast('PDF Report downloaded');
    } catch (err) {
      console.error(err);
      alert('Could not export PDF. Please check your browser permissions.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // JSON Backup export
  const handleExportBackupJson = () => {
    const backupData = {
      app: 'Noor Tasbeeh',
      exportDate: new Date().toISOString(),
      zikrs,
      historySessions,
      settings,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `noor-tasbeeh-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded');
  };

  // JSON Backup restore
  const handleImportBackupJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed && Array.isArray(parsed.zikrs)) {
          setZikrs(parsed.zikrs);
          if (Array.isArray(parsed.historySessions)) {
            setHistorySessions(parsed.historySessions);
          }
          if (parsed.settings) {
            setSettings(parsed.settings);
          }
          showToast('Data restored successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch {
        alert('Failed to read JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Dynamic Theme Palette Class
  const getThemeClass = () => {
    switch (settings.theme) {
      case 'midnight':
        return 'bg-black text-slate-100';
      case 'teal':
        return 'bg-[#021d1d] text-slate-100';
      case 'gold':
        return 'bg-[#1a1202] text-amber-50';
      case 'emerald':
      default:
        return 'islamic-pattern text-slate-100';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white pb-24 sm:pb-8 transition-colors duration-300 ${getThemeClass()}`}>
      
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        historyCount={historySessions.length}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => {
          setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
          if (!settings.soundEnabled) soundHaptics.playBeadClick();
        }}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
        onOpenAddModal={() => {
          setZikrToEdit(null);
          setIsZikrModalOpen(true);
        }}
        onOpenStandaloneModal={() => setIsStandaloneModalOpen(true)}
      />

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <BookmarkCheck className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 space-y-6">
        
        {/* VIEW 1: Home / Counters Tab */}
        {activeTab === 'home' && (
          <>
            {/* Center: Large Circular Total Counter (Section 2 Layout) */}
            <CircularCenterCounter
              totalCount={masterTotal}
              totalZikrs={zikrs.length}
              completedGoals={completedGoals}
              onGlobalReset={handleGlobalReset}
              onSaveSession={handleSaveSession}
            />

            {/* List / Grid Header */}
            <div className="flex items-center justify-between px-1 pt-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-200">
                  Individual Zikr Counters
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
                  className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-800/40 transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Zikr</span>
                </button>
              </div>
            </div>

            {/* Below: List/Grid of Individual Zikr Cards (Single column mobile, wider grid laptop) */}
            {zikrs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {zikrs.map((zikr, index) => (
                  <ZikrCard
                    key={zikr.id}
                    zikr={zikr}
                    index={index}
                    totalCards={zikrs.length}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                    onReset={handleConfirmResetIndividual}
                    onDelete={handleConfirmDelete}
                    onEdit={(item) => {
                      setZikrToEdit(item);
                      setIsZikrModalOpen(true);
                    }}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
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
          </>
        )}

        {/* VIEW 2: History / Session Summary Tab */}
        {activeTab === 'history' && (
          <HistoryView
            sessions={historySessions}
            onClearHistory={handleClearHistory}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
          />
        )}

        {/* VIEW 3: Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
            onGlobalReset={handleGlobalReset}
            onRestoreDefaults={handleRestoreDefaults}
            onExportPdf={handleExportPdf}
            onExportBackupJson={handleExportBackupJson}
            onImportBackupJson={handleImportBackupJson}
          />
        )}

      </main>

      {/* Serene Islamic Footer */}
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

      {/* Bottom Sticky Navigation for Mobile & Thumb Floating Add Button */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => {
          setZikrToEdit(null);
          setIsZikrModalOpen(true);
        }}
        historyCount={historySessions.length}
      />

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
