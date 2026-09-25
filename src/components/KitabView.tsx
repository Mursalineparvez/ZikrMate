import React, { useState } from 'react';
import { ISLAMIC_KITABS, KitabItem, KitabChapter } from '../utils/kitabData';
import { BookMarked, Search, ArrowLeft, Check, Copy, ChevronRight, Sparkles, BookOpen, Layers } from 'lucide-react';

export const KitabView: React.FC = () => {
  const [selectedKitab, setSelectedKitab] = useState<KitabItem | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<KitabChapter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter kitabs
  const filteredKitabs = ISLAMIC_KITABS.filter(
    (k) =>
      k.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyChapter = (chapter: KitabChapter) => {
    const text = `${chapter.title}\n\n${chapter.content}\n\nKey Takeaways:\n${chapter.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n\n[From ${selectedKitab?.title}]`;
    navigator.clipboard.writeText(text);
    setCopiedId(chapter.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Kitab Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/80 border border-emerald-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <BookMarked className="w-3.5 h-3.5" />
            <span>المكتبة الإسلامية • Classical Islamic Books</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Islamic Kitab Library
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Read and reflect upon classical Islamic works including Hisnul Muslim, Forty Hadith Nawawi, and essential manuals of belief and jurisprudence.
          </p>
        </div>
      </div>

      {/* View: Reading Chapter within a Kitab */}
      {selectedKitab && selectedChapter ? (
        <div className="space-y-5">
          {/* Navigation bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <button
              onClick={() => setSelectedChapter(null)}
              className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Chapters</span>
            </button>

            <span className="text-xs text-slate-400 font-medium">
              {selectedKitab.title}
            </span>

            <button
              onClick={() => handleCopyChapter(selectedChapter)}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 transition active:scale-95 cursor-pointer"
            >
              {copiedId === selectedChapter.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          {/* Chapter Content Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Chapter {selectedChapter.chapterNumber}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                {selectedChapter.title}
              </h3>
              {selectedChapter.arabicTitle && (
                <div className="font-arabic text-emerald-300 text-xl font-bold mt-2">
                  {selectedChapter.arabicTitle}
                </div>
              )}
            </div>

            {/* Chapter Body */}
            <div className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans whitespace-pre-line">
              {selectedChapter.content}
            </div>

            {/* Spiritual Key Takeaways */}
            {selectedChapter.keyTakeaways.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Spiritual Takeaways &amp; Action Items</span>
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                  {selectedChapter.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : selectedKitab ? (
        /* View: Chapters List for Selected Kitab */
        <div className="space-y-5">
          <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <button
              onClick={() => setSelectedKitab(null)}
              className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </button>

            <div className="text-right">
              <h3 className="text-sm font-bold text-white">{selectedKitab.title}</h3>
              <p className="text-[11px] text-slate-400">{selectedKitab.author}</p>
            </div>
          </div>

          <div className="space-y-3">
            {selectedKitab.chapters.map((chapter) => (
              <div
                key={chapter.id}
                onClick={() => setSelectedChapter(chapter)}
                className="group p-4 sm:p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 transition-all duration-200 cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center font-bold text-xs text-emerald-400 group-hover:scale-105 transition">
                    {chapter.chapterNumber}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition">
                      {chapter.title}
                    </h4>
                    {chapter.arabicTitle && (
                      <span className="font-arabic text-emerald-400 text-sm font-semibold">
                        {chapter.arabicTitle}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* View: All Kitabs Grid */
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books by title, author, or category..."
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredKitabs.map((kitab) => (
              <div
                key={kitab.id}
                onClick={() => setSelectedKitab(kitab)}
                className="group p-5 rounded-3xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:shadow-emerald-950/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-2xl p-2 rounded-2xl bg-slate-800/80 border border-slate-700">
                      {kitab.icon}
                    </span>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 font-semibold border border-emerald-800/50">
                      {kitab.category}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition">
                    {kitab.title}
                  </h3>
                  <p className="text-xs text-emerald-400/80 font-medium mt-0.5">
                    {kitab.author}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {kitab.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span>{kitab.chapters.length} Chapters Available</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                    Read Book <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
