import React, { useState } from 'react';
import { Volume2, VolumeX, Download, FileText, Plus, Smartphone, Code, Eye } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  onOpenAddModal: () => void;
  onOpenStandaloneModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
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

  const handleDirectDownloadStandaloneHtml = () => {
    // Direct download trigger for the standalone HTML file
    const link = document.createElement('a');
    link.href = '/zikr-tasbeeh-standalone.html';
    link.download = 'zikr-tasbeeh-pwa.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-emerald-900/40 px-4 py-3 sm:px-6 shadow-md shadow-emerald-950/30">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
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
              Serene Digital Zikr Companion
            </p>
          </div>
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
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
            )}
          </button>

          {/* Standalone HTML Export / Code modal button */}
          <button
            onClick={onOpenStandaloneModal}
            title="Get Standalone Single-File HTML"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition active:scale-95"
          >
            <Code className="w-4 h-4 text-teal-400" />
            <span>Single-File HTML</span>
          </button>

          {/* PDF Report Export Button (Deliverable 4) */}
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            title="Generate and Download PDF Report"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-200 text-xs sm:text-sm font-semibold transition active:scale-95 disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">
              {isExportingPdf ? 'Exporting...' : 'Export PDF Report'}
            </span>
            <span className="md:hidden">PDF</span>
          </button>

          {/* PWA Install Button */}
          {!isInstalled && (isInstallable || isIOS) && (
            <button
              onClick={handleInstallClick}
              title="Install app to your home screen"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-900/70 hover:bg-teal-800 border border-teal-500/50 text-teal-200 text-xs sm:text-sm font-semibold transition active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-teal-300" />
              <span className="hidden sm:inline">Install App</span>
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
