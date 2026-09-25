import React from 'react';
import { Home, Clock, Settings, Plus } from 'lucide-react';

export type ActiveTab = 'home' | 'history' | 'settings';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  historyCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  historyCount,
}) => {
  return (
    <>
      {/* Floating Add-Zikir Button (Positioned comfortably for thumb tap above bottom bar on mobile, or bottom-right on desktop) */}
      <button
        onClick={onOpenAddModal}
        className="fixed bottom-20 sm:bottom-6 right-5 sm:right-8 z-40 w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white shadow-2xl shadow-emerald-950 flex items-center justify-center border border-emerald-300/40 transition-transform cursor-pointer"
        aria-label="Add New Zikr"
        title="Add New Custom Zikr"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Bottom Sticky Navigation Bar for Mobile and Tablets */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-lg border-t border-emerald-900/40 px-4 py-2 sm:hidden">
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          {/* Home Tab */}
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center py-1 px-4 rounded-xl transition ${
              activeTab === 'home'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-wide">Counters</span>
          </button>

          {/* History Tab */}
          <button
            onClick={() => onTabChange('history')}
            className={`flex flex-col items-center py-1 px-4 rounded-xl transition relative ${
              activeTab === 'history'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-wide">History</span>
            {historyCount > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => onTabChange('settings')}
            className={`flex flex-col items-center py-1 px-4 rounded-xl transition ${
              activeTab === 'settings'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-wide">Settings</span>
          </button>
        </div>
      </nav>
    </>
  );
};
