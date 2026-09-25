import React from 'react';
import { NavModule, ThemeMode } from '../types';
import {
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
  themeMode?: ThemeMode;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeModule,
  onModuleChange,
  onOpenAddModal,
  themeMode = 'day',
}) => {
  const isDay = themeMode === 'day';

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
          className={`fixed bottom-20 sm:bottom-6 right-5 sm:right-8 z-40 w-14 h-14 rounded-2xl active:scale-95 text-white shadow-2xl flex items-center justify-center transition-transform cursor-pointer border ${
            isDay
              ? 'bg-[#1c6469] hover:bg-[#154f53] border-teal-400/40 shadow-[#135d66]/30'
              : 'bg-[#14b8a6] hover:bg-[#0d9488] text-[#041f21] border-teal-200/50 shadow-black/60'
          }`}
          aria-label="Add New Zikr"
          title="Add New Custom Zikr"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      )}

      {/* Sticky Bottom Navigation Bar on Mobile / Tablet */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-30 px-2 py-1.5 md:hidden backdrop-blur-xl transition-colors duration-300 border-t ${
          isDay
            ? 'bg-white/95 border-[#d6e8e5] shadow-2xl shadow-[#135d66]/15'
            : 'bg-[#071f22]/95 border-[#154247] shadow-2xl shadow-black/80'
        }`}
      >
        <div className="flex items-center justify-between overflow-x-auto gap-1 scrollbar-none py-1">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={`flex flex-col items-center justify-center min-w-[58px] py-1 px-1.5 rounded-xl transition-all active:scale-95 cursor-pointer shrink-0 ${
                  isActive
                    ? isDay
                      ? 'text-white font-bold bg-[#1c6469] shadow-md shadow-[#135d66]/20'
                      : 'text-[#041f21] font-bold bg-[#14b8a6] shadow-md'
                    : isDay
                    ? 'text-[#507579] hover:text-[#1c6469]'
                    : 'text-teal-200/70 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                  {item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
