/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ZikrItem, HistorySession, AppSettings, DuaItem, NavModule, ThemeMode } from './types';
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
import { BookmarkCheck, Sparkles } from 'lucide-react';

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
        const parsed = JSON.parse(saved);
        if (!parsed.themeMode) {
          parsed.themeMode = 'day';
        }
        return parsed;
      }
    } catch {}
    return {
      soundEnabled: true,
      vibrationEnabled: true,
      screenAwake: false,
      theme: 'emerald',
      themeMode: 'day', // Default to Day mode matching the user's uploaded screenshot
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

  // Save settings and sync body classes
  useEffect(() => {
    try {
      localStorage.setItem('noor_zikr_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
    const isDay = settings.themeMode === 'day';
    document.body.classList.toggle('theme-day', isDay);
    document.body.classList.toggle('theme-night', !isDay);
  }, [settings]);

  // Screen Awake Lock management
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && settings.screenAwake) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch {
          // Ignored
        }
      } else if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch {}
      }
    };
    requestWakeLock();
  }, [settings.screenAwake]);

  // Master Total Count
  const masterTotal = useMemo(() => {
    return zikrs.reduce((acc, curr) => acc + (curr.count || 0), 0);
  }, [zikrs]);

  // Completed Goals Count
  const completedGoals = useMemo(() => {
    return zikrs.filter((z) => z.target && z.target > 0 && z.count >= z.target).length;
  }, [zikrs]);

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Toggle Day and Night Mode
  const handleToggleThemeMode = () => {
    const newMode: ThemeMode = settings.themeMode === 'day' ? 'night' : 'day';
    setSettings((prev) => ({ ...prev, themeMode: newMode }));
    if (settings.soundEnabled) soundHaptics.playTap();
    showToast(newMode === 'day' ? 'Switched to Day Mode ☀️' : 'Switched to Night Mode 🌙');
  };

  // Sound toggle
  const handleToggleSound = () => {
    const nextVal = !settings.soundEnabled;
    setSettings((prev) => ({ ...prev, soundEnabled: nextVal }));
    showToast(nextVal ? 'Sound effects enabled' : 'Muted audio');
  };

  // Increment Zikr
  const handleIncrement = (id: string) => {
    const targetZikr = zikrs.find((item) => item.id === id);
    if (!targetZikr) return;

    const newCount = targetZikr.count + 1;
    const isGoalJustReached = targetZikr.target && newCount === targetZikr.target;

    setZikrs((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, count: newCount, updatedAt: Date.now() } : item
      )
    );

    if (settings.vibrationEnabled) {
      if (isGoalJustReached) {
        soundHaptics.triggerVibration('target');
      } else {
        soundHaptics.triggerVibration('tap');
      }
    }

    if (settings.soundEnabled) {
      if (isGoalJustReached) {
        soundHaptics.playMilestone();
      } else {
        soundHaptics.playTap();
      }
    }

    if (isGoalJustReached) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#1c6469', '#247b82', '#f59e0b', '#10b981'],
      });
      showToast(`Mabrook! Goal completed for ${targetZikr.name}!`);
    }
  };

  // Decrement Zikr
  const handleDecrement = (id: string) => {
    const targetZikr = zikrs.find((item) => item.id === id);
    if (!targetZikr || targetZikr.count <= 0) return;

    setZikrs((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, count: Math.max(0, item.count - 1), updatedAt: Date.now() }
          : item
      )
    );
    if (settings.vibrationEnabled) soundHaptics.vibrate(30);
    if (settings.soundEnabled) soundHaptics.playTap();
  };

  // Move Zikr up/down
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
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

  // Confirmation modal dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isDanger: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    isDanger: false,
    onConfirm: () => {},
  });

  // Reset single Zikr
  const handleConfirmResetIndividual = (zikr: ZikrItem) => {
    setConfirmDialog({
      isOpen: true,
      title: `Reset ${zikr.name}?`,
      message: `Are you sure you want to reset the count of "${zikr.name}" from ${zikr.count} back to 0?`,
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

  // Restore Default Zikrs
  const handleRestoreDefaults = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Restore Default Counters',
      message: 'This will reset your counters list back to the authentic traditional Sunnah invocations.',
      confirmLabel: 'Restore Defaults',
      isDanger: false,
      onConfirm: () => {
        setZikrs(DEFAULT_ZIKRS);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Restored default zikrs');
      },
    });
  };

  // Add Dua to Counters
  const handleAddDuaToCounters = (dua: DuaItem) => {
    const existing = zikrs.find(
      (z) => z.name.toLowerCase() === dua.title.toLowerCase() || z.arabic === dua.arabic
    );
    if (existing) {
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

  // 7 module items metadata
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

  const isDay = settings.themeMode === 'day';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 pb-20 md:pb-8 selection:bg-teal-500 selection:text-white ${
        isDay ? 'bg-[#edf5f4] text-[#133e42]' : 'bg-[#061a1c] text-[#f0fdfa]'
      }`}
    >
      {/* Top Header */}
      <Header
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        themeMode={settings.themeMode}
        onToggleThemeMode={handleToggleThemeMode}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
        onOpenStandaloneModal={() => setIsStandaloneModalOpen(true)}
      />

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border ${
            isDay
              ? 'bg-[#1c6469] text-white border-teal-300 shadow-[#135d66]/30'
              : 'bg-[#0a2f33] text-teal-200 border-teal-500/60 shadow-black/80'
          }`}
        >
          <BookmarkCheck className="w-4 h-4 text-teal-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Top Islamic Greeting & Module Switcher Card (Matches the clean white card / category tabs in screenshot) */}
        <div
          className={`rounded-[26px] p-3.5 sm:p-4.5 border transition-colors shadow-md ${
            isDay
              ? 'bg-white border-[#dcebe8] shadow-[#135d66]/5'
              : 'bg-[#0a2528] border-[#164449] shadow-black/40'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-2.5 mb-2.5 border-b flex-wrap gap-2 text-xs ${
              isDay ? 'border-[#e8f3f1]' : 'border-[#143c41]'
            }`}
          >
            <div
              className={`flex items-center gap-2 font-bold ${
                isDay ? 'text-[#165a60]' : 'text-teal-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-arabic text-sm">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
            </div>
            <div className={`text-[11px] font-medium ${isDay ? 'text-[#5f8488]' : 'text-teal-200/70'}`}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>

          {/* Module Selector Category Bar (Exact category pills from screenshot: "Bone", "Brain expert", etc.) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {moduleTabs.map((tab) => {
              const isActive = activeModule === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveModule(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 border ${
                    isActive
                      ? isDay
                        ? 'bg-[#1c6469] text-white border-[#1c6469] shadow-md shadow-[#135d66]/20'
                        : 'bg-[#14b8a6] text-[#041f21] border-[#14b8a6] shadow-md'
                      : isDay
                      ? 'bg-[#e6f3f2] hover:bg-[#d8ece9] text-[#2d6a70] border-[#d2ece9]'
                      : 'bg-[#0f3438] hover:bg-[#133f44] text-teal-200/80 border-[#1a4e54]'
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? isDay
                            ? 'bg-white/20 text-white'
                            : 'bg-black/20 text-[#041f21]'
                          : isDay
                          ? 'bg-white text-[#1c6469] border border-[#cbe4e1]'
                          : 'bg-[#0a2528] text-teal-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. ZIKIR COUNTER VIEW (HOME PAGE) */}
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
            themeMode={settings.themeMode}
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
      <footer
        className={`mt-auto border-t py-6 px-4 text-center transition-colors ${
          isDay
            ? 'bg-[#e2edea] border-[#cbe0dc] text-[#34595d]'
            : 'bg-[#061a1c] border-[#12393d] text-teal-200/70'
        }`}
      >
        <div className="max-w-4xl mx-auto space-y-2">
          <div
            className={`font-arabic text-lg sm:text-xl font-bold ${
              isDay ? 'text-[#165a60]' : 'text-teal-300'
            }`}
          >
            أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
          </div>
          <p className={`text-xs italic ${isDay ? 'text-[#507579]' : 'text-slate-400'}`}>
            "Verily, in the remembrance of Allah do hearts find rest." — Surah Ar-Ra'd (13:28)
          </p>
          <div className="text-[11px] pt-1 flex items-center justify-center gap-2 flex-wrap opacity-80">
            <span>ZikrMate PWA</span>
            <span>•</span>
            <span>100% Offline &amp; Privacy-First</span>
            <span>•</span>
            <button
              onClick={() => setIsStandaloneModalOpen(true)}
              className={`hover:underline font-bold cursor-pointer ${
                isDay ? 'text-[#1c6469]' : 'text-teal-300'
              }`}
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
        themeMode={settings.themeMode}
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
