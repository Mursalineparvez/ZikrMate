import React, { useState } from 'react';
import { Volume2, VolumeX, FileText, Plus, Smartphone, Code, Home, Clock, Settings } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ActiveTab } from './BottomNav';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  historyCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  onOpenAddModal: () => void;
  onOpenStandaloneModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  historyCount,
  soundEnabled,
  onToggleSound,
  onExportPdf,
  isExportingPdf,
  onOpenAddModal,
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

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-emerald-900/40 px-4 py-2.5 sm:px-6 shadow-md shadow-emerald-950/30">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('home')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950 flex items-center justify-center shadow-lg shadow-emerald-900/50 border border-emerald-400/40">
            <span className="text-xl">📿</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Noor Tasbeeh
              </h1>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/50">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/80 font-medium hidden xs:block">
              Digital Zikir &amp; Counter Companion
            </p>
          </div>
        </div>

        {/* Center Nav tabs for Desktop & Laptop */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => onTabChange('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'home'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Counters</span>
          </button>

          <button
            onClick={() => onTabChange('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[10px]">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Audio toggle button */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute bead clicks' : 'Enable wooden bead sound'}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-emerald-600/50 text-slate-300 hover:text-emerald-300 transition active:scale-95"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Standalone HTML Export / Code modal button */}
          <button
            onClick={onOpenStandaloneModal}
            title="Single-File HTML & APK Guide"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition active:scale-95"
          >
            <Code className="w-3.5 h-3.5 text-teal-400" />
            <span>Standalone HTML</span>
          </button>

          {/* PDF Report Export Button */}
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            title="Generate and Download PDF Report"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-200 text-xs sm:text-sm font-semibold transition active:scale-95 disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span className="hidden lg:inline">
              {isExportingPdf ? 'Exporting...' : 'Export PDF'}
            </span>
            <span className="lg:hidden">PDF</span>
          </button>

          {/* PWA Install Button */}
          {!isInstalled && (isInstallable || isIOS) && (
            <button
              onClick={handleInstallClick}
              title="Install app to your home screen"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-900/70 hover:bg-teal-800 border border-teal-500/50 text-teal-200 text-xs sm:text-sm font-semibold transition active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-teal-300" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* Add New Zikr Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/50 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Zikr</span>
          </button>
        </div>
      </div>

      {/* iOS Install Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-700/50 p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-950 flex items-center justify-center border border-emerald-600/40 text-2xl">
              📲
            </div>
            <h3 className="text-base font-bold text-white mb-2">Install on iPhone / iPad</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4 text-left bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              1. Tap the <strong className="text-emerald-400">Share</strong> icon at the bottom of Safari browser toolbar.<br />
              2. Scroll down and tap <strong className="text-emerald-400">"Add to Home Screen"</strong>.<br />
              3. Tap <strong className="text-emerald-400">Add</strong> in the top-right corner.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
