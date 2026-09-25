import React, { useState } from 'react';
import { Volume2, VolumeX, FileText, Smartphone, Code, BookOpen, BookMarked, Clock, Heart, Award } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { NavModule } from '../types';

interface HeaderProps {
  activeModule: NavModule;
  onModuleChange: (mod: NavModule) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  onOpenStandaloneModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onModuleChange,
  soundEnabled,
  onToggleSound,
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

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-emerald-900/40 px-3 py-2 sm:px-6 shadow-lg shadow-emerald-950/20">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        
        {/* Brand identity */}
        <div
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
          onClick={() => onModuleChange('zikir_counter')}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950 flex items-center justify-center shadow-lg shadow-emerald-900/50 border border-emerald-400/40">
            <span className="text-lg sm:text-xl">📿</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                ZikrMate
              </h1>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/50">
                PWA
              </span>
            </div>
            <p className="text-[10px] text-emerald-400/80 font-medium hidden sm:block">
              Islamic Companion &amp; Counter
            </p>
          </div>
        </div>

        {/* Desktop Nav Items (visible on md screens and up) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Utility actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border text-xs font-semibold transition active:scale-95 cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={soundEnabled ? 'Mute Sounds' : 'Enable Audio Feedback'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Export PDF Button */}
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-50"
            title="Export PDF Report"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">{isExportingPdf ? 'Exporting...' : 'PDF'}</span>
          </button>

          {/* APK & HTML export info */}
          <button
            onClick={onOpenStandaloneModal}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition active:scale-95 cursor-pointer hidden sm:flex"
            title="APK Build Guide"
          >
            <Code className="w-4 h-4 text-teal-400" />
          </button>

          {/* PWA Install Button */}
          {(isInstallable || isIOS) && !isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-md shadow-emerald-950"
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
          <div className="bg-slate-900 border border-emerald-700/50 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <span>Install ZikrMate on iOS</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              1. Tap the <strong className="text-white">Share</strong> button at the bottom of Safari.<br />
              2. Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.<br />
              3. Tap <strong className="text-white">"Add"</strong> in the top-right corner.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
