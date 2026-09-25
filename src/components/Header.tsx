import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  FileText,
  Smartphone,
  Code,
  BookOpen,
  BookMarked,
  Clock,
  Heart,
  Award,
  Sun,
  Moon,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { NavModule, ThemeMode } from '../types';

interface HeaderProps {
  activeModule: NavModule;
  onModuleChange: (mod: NavModule) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  themeMode: ThemeMode;
  onToggleThemeMode: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  onOpenStandaloneModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onModuleChange,
  soundEnabled,
  onToggleSound,
  themeMode,
  onToggleThemeMode,
  onExportPdf,
  isExportingPdf,
  onOpenStandaloneModal,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const navItems: Array<{
    id: NavModule;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'zikir_counter', label: 'Zikir Counter', icon: <span>📿</span> },
    { id: 'quran', label: 'Quran', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'kitab', label: 'Kitab', icon: <BookMarked className="w-3.5 h-3.5" /> },
    { id: 'hadith', label: 'Hadith', icon: <span>📜</span> },
    { id: 'salat_time', label: 'Salat Time', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'dua', label: 'Dua', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'aamal_tracker', label: 'Aamal Tracker', icon: <Award className="w-3.5 h-3.5" /> },
  ];

  const isDay = themeMode === 'day';

  return (
    <header
      className={`sticky top-0 z-40 px-3 py-2.5 sm:px-6 transition-colors duration-300 shadow-lg ${
        isDay
          ? 'bg-gradient-to-r from-[#144d52] via-[#1a5e64] to-[#257277] text-white border-b border-[#2d7d83]/40 shadow-[#135d66]/15'
          : 'bg-gradient-to-r from-[#092b2e] via-[#0d363a] to-[#12454a] text-white border-b border-[#184e54] shadow-black/30'
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Identity */}
        <div
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
          onClick={() => onModuleChange('zikir_counter')}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md border border-white/25">
            <span className="text-lg sm:text-xl">📿</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white drop-shadow-sm">
                ZikrMate
              </h1>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/20 text-teal-100 font-bold border border-white/30">
                PWA
              </span>
            </div>
            <p className="text-[10px] text-teal-100/90 font-medium hidden sm:block">
              Islamic Companion &amp; Counter
            </p>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1 bg-black/15 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#165a60] font-bold shadow-md shadow-black/10'
                    : 'text-teal-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Utility Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Day / Night Mode Toggle */}
          <button
            onClick={onToggleThemeMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border text-xs font-bold transition active:scale-95 cursor-pointer backdrop-blur-md shadow-sm ${
              isDay
                ? 'bg-white/20 hover:bg-white/30 text-amber-300 border-white/30'
                : 'bg-teal-950/80 hover:bg-teal-900 text-teal-200 border-teal-700/60'
            }`}
            title={isDay ? 'Switch to Night Mode (Dark)' : 'Switch to Day Mode (Light)'}
            aria-label="Toggle Day and Night mode"
          >
            {isDay ? (
              <>
                <Sun className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span className="hidden sm:inline text-white text-[11px]">Day</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 fill-teal-200 text-teal-200" />
                <span className="hidden sm:inline text-teal-200 text-[11px]">Night</span>
              </>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-2xl border border-white/20 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition active:scale-95 cursor-pointer backdrop-blur-md"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Audio Feedback'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-75" />}
          </button>

          {/* Export PDF Button */}
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold transition active:scale-95 cursor-pointer backdrop-blur-md disabled:opacity-50"
            title="Export PDF Report"
          >
            <FileText className="w-4 h-4 text-teal-200" />
            <span className="hidden lg:inline">{isExportingPdf ? 'Exporting...' : 'PDF'}</span>
          </button>

          {/* APK & HTML Export Info */}
          <button
            onClick={onOpenStandaloneModal}
            className="p-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold transition active:scale-95 cursor-pointer backdrop-blur-md hidden sm:flex"
            title="APK Build Guide"
          >
            <Code className="w-4 h-4 text-teal-200" />
          </button>

          {/* PWA Install Button */}
          {(isInstallable || isIOS) && !isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white text-[#165a60] font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              title="Install App"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12454a] border border-teal-500/50 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-white">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-teal-300" />
              <span>Install ZikrMate on iOS</span>
            </h3>
            <p className="text-xs text-teal-100 leading-relaxed">
              1. Tap the <strong className="text-white">Share</strong> button at the bottom of Safari.<br />
              2. Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.<br />
              3. Tap <strong className="text-white">"Add"</strong> in the top-right corner.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-white text-[#165a60] text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
