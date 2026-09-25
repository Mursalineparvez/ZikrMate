import React from 'react';
import { NavModule } from '../types';
import {
  Sparkles,
  BookOpen,
  BookMarked,
  Clock,
  Heart,
  Award,
  Plus,
} from 'lucide-react';

interface BottomNavProps {
  activeModule: NavModule;
  onModuleChange: (mod: NavModule) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeModule,
  onModuleChange,
  onOpenAddModal,
}) => {
  const navItems: Array<{
    id: NavModule;
    label: string;
    arabic: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'zikir_counter',
      label: 'Zikir Counter',
      arabic: 'الذِّكْر',
      icon: <span className="text-base">📿</span>,
    },
    {
      id: 'quran',
      label: 'Quran',
      arabic: 'القرآن',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'kitab',
      label: 'Kitab',
      arabic: 'الكتب',
      icon: <BookMarked className="w-4 h-4" />,
    },
    {
      id: 'hadith',
      label: 'Hadith',
      arabic: 'الحديث',
      icon: <span className="text-base">📜</span>,
    },
    {
      id: 'salat_time',
      label: 'Salat Time',
      arabic: 'الصلاة',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'dua',
      label: 'Dua',
      arabic: 'الدعاء',
      icon: <Heart className="w-4 h-4" />,
    },
    {
      id: 'aamal_tracker',
      label: 'Aamal Tracker',
      arabic: 'الأعمال',
      icon: <Award className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Floating Add-Zikir Button (visible when on Zikir Counter) */}
      {activeModule === 'zikir_counter' && (
        <button
          onClick={onOpenAddModal}
          className="fixed bottom-20 sm:bottom-6 right-5 sm:right-8 z-40 w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white shadow-2xl shadow-emerald-950 flex items-center justify-center border border-emerald-300/40 transition-transform cursor-pointer"
          aria-label="Add New Zikr"
          title="Add New Custom Zikr"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      )}

      {/* Sticky Bottom Navigation Bar on Mobile / Tablet */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-xl border-t border-emerald-900/50 px-2 py-1.5 md:hidden shadow-2xl">
        <div className="flex items-center justify-between overflow-x-auto gap-1 scrollbar-none py-1">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={`flex flex-col items-center justify-center min-w-[58px] py-1 px-1.5 rounded-xl transition-all active:scale-95 cursor-pointer shrink-0 ${
                  isActive
                    ? 'text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-700/50 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="mb-0.5">{item.icon}</div>
                <span className="text-[9px] tracking-tight leading-none text-center whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
