/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ZikrItem, HistorySession, AppSettings, DuaItem, NavModule } from './types';
import { DEFAULT_ZIKRS } from './utils/constants';
import { soundHaptics } from './utils/audioHaptics';
import { generateZikrPdfReport } from './utils/exportPdf';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ZikirCounterView } from './components/ZikirCounterView';
import { QuranView } from './components/QuranView';
import { KitabView } from './components/KitabView';
import { HadithView } from './components/HadithView';
import { SalatTimeView } from './components/SalatTimeView';
import { DuaView } from './components/DuaView';
import { AamalTrackerView } from './components/AamalTrackerView';
import { ZikrModal } from './components/ZikrModal';
import { ConfirmModal } from './components/ConfirmModal';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { BookmarkCheck, BookOpen, BookMarked, Clock, Heart, Award, Sparkles } from 'lucide-react';

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

  // History session archives
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

  // Active module navigation: only the 7 requested modules!
  // 'zikir_counter' | 'quran' | 'kitab' | 'hadith' | 'salat_time' | 'dua' | 'aamal_tracker'
  const [activeModule, setActiveModule] = useState<NavModule>('zikir_counter');

  // Modals state
  const [isZikrModalOpen, setIsZikrModalOpen] = useState(false);
  const [zikrToEdit, setZikrToEdit] = useState<ZikrItem | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isStandaloneModalOpen, setIsStandaloneModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Wake lock sentinel ref
  const wakeLockRef = useRef<any>(null);

  // Save zikrs to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('noor_zikr_items', JSON.stringify(zikrs));
    } catch (e) {
      console.error('Failed to save zikrs to localStorage', e);
    }
  }, [zikrs]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('noor_zikr_history', JSON.stringify(historySessions));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [historySessions]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('noor_zikr_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Screen awake lock management
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && settings.screenAwake) {
        try {
          if ('wakeLock' in navigator) {
            wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          }
        } catch {}
      }
    };

    if (settings.screenAwake) {
      if ('wakeLock' in navigator) {
        (navigator as any).wakeLock
          .request('screen')
          .then((lock: any) => {
            wakeLockRef.current = lock;
          })
          .catch(() => {});
      }
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.screenAwake]);

  // Real-time calculation of Central Master Total
  const masterTotal = useMemo(() => {
    return zikrs.reduce((sum, item) => sum + item.count, 0);
  }, [zikrs]);

  // Count of completed targets
  const completedGoals = useMemo(() => {
    return zikrs.filter((z) => (z.target ? z.count >= z.target : false)).length;
  }, [zikrs]);

  // Confirmation modal state
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sound toggle helper
  const handleToggleSound = () => {
    setSettings((prev) => {
      const next = !prev.soundEnabled;
      if (next) soundHaptics.playTap();
      return { ...prev, soundEnabled: next };
    });
  };

  // Increment individual counter
  const handleIncrement = (id: string) => {
    setZikrs((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextCount = item.count + 1;
          const targetReached = item.target && nextCount === item.target;

          if (settings.vibrationEnabled) {
            soundHaptics.vibrate(targetReached ? [50, 100, 50, 100] : 40);
          }

          if (settings.soundEnabled) {
            if (targetReached) {
              soundHaptics.playMilestone();
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#10b981', '#14b8a6', '#f59e0b', '#38bdf8'],
              });
            } else {
              soundHaptics.playTap();
            }
          }

          return { ...item, count: nextCount, updatedAt: Date.now() };
        }
        return item;
      })
    );
  };

  // Decrement individual counter
  const handleDecrement = (id: string) => {
    setZikrs((prev) =>
      prev.map((item) => {
        if (item.id === id && item.count > 0) {
          if (settings.vibrationEnabled) soundHaptics.vibrate(30);
          if (settings.soundEnabled) soundHaptics.playTap();
          return { ...item, count: item.count - 1, updatedAt: Date.now() };
        }
        return item;
      })
    );
  };

  // Reset individual counter
  const handleConfirmResetIndividual = (zikr: ZikrItem) => {
    setConfirmDialog({
      isOpen: true,
      title: `Reset ${zikr.name}?`,
      message: `Are you sure you want to reset the count for "${zikr.name}" from ${zikr.count} back to 0?`,
      confirmLabel: 'Reset to 0',
      isDanger: false,
      onConfirm: () => {
        setZikrs((prev) =>
          prev.map((item) =>
            item.id === zikr.id ? { ...item, count: 0, updatedAt: Date.now() } : item
          )
        );
        if (settings.vibrationEnabled) soundHaptics.vibrate(60);
        if (settings.soundEnabled) soundHaptics.playReset();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast(`Reset ${zikr.name} to 0`);
      },
    });
  };

  // Delete Zikr
  const handleConfirmDelete = (zikr: ZikrItem) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${zikr.name}?`,
      message: `This will permanently remove "${zikr.name}" (Count: ${zikr.count}) from your counters.`,
      confirmLabel: 'Delete Forever',
      isDanger: true,
      onConfirm: () => {
        setZikrs((prev) => prev.filter((item) => item.id !== zikr.id));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast(`Deleted ${zikr.name}`);
      },
    });
  };

  // Global Reset
  const handleGlobalReset = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Global Counter Reset',
      message: `Are you sure you want to reset ALL ${zikrs.length} individual counters to 0? The current master total of ${masterTotal} will be cleared.`,
      confirmLabel: 'Yes, Reset All to 0',
      isDanger: true,
      onConfirm: () => {
        setZikrs((prev) => prev.map((item) => ({ ...item, count: 0, updatedAt: Date.now() })));
        if (settings.vibrationEnabled) soundHaptics.vibrate([70, 50, 70]);
        if (settings.soundEnabled) soundHaptics.playReset();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('All counters reset to 0');
      },
    });
  };

  // Save current counts to History archive
  const handleSaveSession = () => {
    if (masterTotal === 0) {
      showToast('Cannot save empty session (Total is 0)');
      return;
    }

    const newSession: HistorySession = {
      id: `session_${Date.now()}`,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
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
    if (settings.soundEnabled) soundHaptics.playMilestone();
    showToast(`Saved session: ${masterTotal} total counts archived!`);
  };

  // Save Add/Edit Zikr
  const handleSaveZikr = (
    data: Omit<ZikrItem, 'id' | 'createdAt' | 'count' | 'updatedAt'>,
    id?: string
  ) => {
    const now = Date.now();
    if (id) {
      setZikrs((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...data, updatedAt: now } : item
        )
      );
      showToast(`Updated "${data.name}"`);
    } else {
      const newZikr: ZikrItem = {
        ...data,
        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        count: 0,
        createdAt: now,
        updatedAt: now,
      };
      setZikrs((prev) => [...prev, newZikr]);
      showToast(`Added "${data.name}" to counters`);
    }
    setIsZikrModalOpen(false);
    setZikrToEdit(null);
  };

  // Reordering handlers
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setZikrs((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= zikrs.length - 1) return;
    setZikrs((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  // Restore Default Zikrs
  const handleRestoreDefaults = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Restore Default Prophetic Azkar?',
      message: 'This will restore SubhanAllah, Alhamdulillah, Allahu Akbar, and La ilaha illallah.',
      confirmLabel: 'Restore Defaults',
      isDanger: false,
      onConfirm: () => {
        setZikrs(DEFAULT_ZIKRS);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Restored standard default Azkar');
      },
    });
  };

  // Add a Dua directly to counters
  const handleAddDuaToCounters = (dua: DuaItem) => {
    const alreadyExists = zikrs.some((z) => z.name.toLowerCase() === dua.title.toLowerCase());
    if (alreadyExists) {
      showToast(`"${dua.title}" is already in your counters!`);
      setActiveModule('zikir_counter');
      return;
    }

    const now = Date.now();
    const newZikr: ZikrItem = {
      id: `dua_${dua.id}_${now}`,
      name: dua.title,
      arabic: dua.arabic,
      transliteration: dua.transliteration,
      meaning: dua.translation,
      count: 0,
      target: dua.suggestedCount || 33,
      createdAt: now,
      updatedAt: now,
    };

    setZikrs((prev) => [...prev, newZikr]);
    if (settings.soundEnabled) soundHaptics.playMilestone();
    showToast(`Added "${dua.title}" to counters!`);
    setActiveModule('zikir_counter');
  };

  // PDF Export
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    showToast('Generating official PDF report...');
    try {
      await generateZikrPdfReport(zikrs, masterTotal);
      showToast('PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to export PDF. Check console.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 7 module items metadata for the top hub
  const moduleTabs: Array<{
    id: NavModule;
    label: string;
    arabic: string;
    icon: string;
    badge?: string | number;
  }> = [
    { id: 'zikir_counter', label: 'Zikir Counter', arabic: 'الذِّكْر', icon: '📿', badge: masterTotal },
    { id: 'quran', label: 'Quran', arabic: 'القرآن', icon: '📖' },
    { id: 'kitab', label: 'Kitab', arabic: 'الكتب', icon: '📚' },
    { id: 'hadith', label: 'Hadith', arabic: 'الحديث', icon: '📜' },
    { id: 'salat_time', label: 'Salat Time', arabic: 'الصلاة', icon: '🕌' },
    { id: 'dua', label: 'Dua', arabic: 'الدعاء', icon: '🤲' },
    { id: 'aamal_tracker', label: 'Aamal Tracker', arabic: 'الأعمال', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-20 md:pb-8">
      {/* Top Header */}
      <Header
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
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
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        
        {/* Islamic Greeting & Top Module Quick Switcher */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-3 sm:p-4 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/60 flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-arabic text-sm">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>

          {/* Module Selector Bar (Only the 7 requested modules!) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {moduleTabs.map((tab) => {
              const isActive = activeModule === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveModule(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50 scale-102'
                      : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-emerald-900/90 text-emerald-200' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. ZIKIR COUNTER VIEW */}
        {activeModule === 'zikir_counter' && (
          <ZikirCounterView
            masterTotal={masterTotal}
            zikrs={zikrs}
            completedGoals={completedGoals}
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
            onGlobalReset={handleGlobalReset}
            onSaveSession={handleSaveSession}
            onOpenAddModal={() => {
              setZikrToEdit(null);
              setIsZikrModalOpen(true);
            }}
            onRestoreDefaults={handleRestoreDefaults}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
          />
        )}

        {/* 2. QURAN VIEW */}
        {activeModule === 'quran' && (
          <QuranView soundEnabled={settings.soundEnabled} />
        )}

        {/* 3. KITAB VIEW */}
        {activeModule === 'kitab' && (
          <KitabView />
        )}

        {/* 4. HADITH VIEW */}
        {activeModule === 'hadith' && (
          <HadithView soundEnabled={settings.soundEnabled} />
        )}

        {/* 5. SALAT TIME VIEW */}
        {activeModule === 'salat_time' && (
          <SalatTimeView soundEnabled={settings.soundEnabled} />
        )}

        {/* 6. DUA VIEW */}
        {activeModule === 'dua' && (
          <DuaView
            onAddDuaToCounters={handleAddDuaToCounters}
            activeCounters={zikrs}
            soundEnabled={settings.soundEnabled}
          />
        )}

        {/* 7. AAMAL TRACKER VIEW */}
        {activeModule === 'aamal_tracker' && (
          <AamalTrackerView soundEnabled={settings.soundEnabled} />
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
          <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-center gap-2 flex-wrap">
            <span>ZikrMate PWA</span>
            <span>•</span>
            <span>100% Offline &amp; Privacy-First</span>
            <span>•</span>
            <button
              onClick={() => setIsStandaloneModalOpen(true)}
              className="text-emerald-400 hover:underline font-medium cursor-pointer"
            >
              Export Standalone APK Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Bottom Sticky Navigation for Mobile & Thumb Floating Add Button */}
      <BottomNav
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        onOpenAddModal={() => {
          setZikrToEdit(null);
          setIsZikrModalOpen(true);
        }}
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
