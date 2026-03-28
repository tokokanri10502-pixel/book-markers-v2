"use client";

import React, { useState, useMemo } from "react";
import {
  Camera,
  BookOpen,
  Library,
  Sparkles,
  ChevronRight,
  Plus,
  BarChart3,
  CheckCircle2,
  Clock,
  Bookmark,
  Search,
  X,
  ArrowUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Book, BookStatus } from "@/lib/types";

type SortKey = "newest" | "oldest" | "title" | "rating";

export default function BookListClient({ books }: { books: Book[] }) {
  const [filter, setFilter] = useState<BookStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return books
      .filter((b) => filter === "all" || b.status === filter)
      .filter(
        (b) =>
          !query ||
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sort === "title") return a.title.localeCompare(b.title, "ja");
        if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
        return 0;
      });
  }, [books, filter, search, sort]);

  return (
    <div className="flex flex-col pb-24 pt-8">
      {/* --- HEADER --- */}
      <header className="px-6 mb-8 relative overflow-hidden rounded-3xl mx-4 py-6">
        {/* Book silhouette background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
          viewBox="0 0 400 120"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 本1 (細め・高い) */}
          <rect x="20" y="18" width="22" height="90" rx="2" fill="#C9A84C" />
          <rect x="21" y="18" width="3" height="90" fill="#fff" fillOpacity="0.15" />
          {/* 本2 (太め) */}
          <rect x="46" y="30" width="30" height="78" rx="2" fill="#C9A84C" />
          <rect x="47" y="30" width="4" height="78" fill="#fff" fillOpacity="0.15" />
          {/* 本3 (中) */}
          <rect x="80" y="22" width="20" height="86" rx="2" fill="#C9A84C" />
          <rect x="81" y="22" width="3" height="86" fill="#fff" fillOpacity="0.15" />
          {/* 本4 (横倒し・台) */}
          <rect x="104" y="88" width="44" height="18" rx="2" fill="#C9A84C" />
          {/* 本5 (横倒しの上に立ってる) */}
          <rect x="110" y="38" width="18" height="50" rx="2" fill="#C9A84C" />
          <rect x="111" y="38" width="3" height="50" fill="#fff" fillOpacity="0.15" />
          <rect x="130" y="44" width="14" height="44" rx="2" fill="#C9A84C" />
          {/* 本6 */}
          <rect x="160" y="26" width="24" height="82" rx="2" fill="#C9A84C" />
          <rect x="161" y="26" width="4" height="82" fill="#fff" fillOpacity="0.15" />
          {/* 本7 (細め) */}
          <rect x="188" y="34" width="16" height="74" rx="2" fill="#C9A84C" />
          {/* 本8 (傾いてる感) */}
          <rect x="208" y="20" width="26" height="88" rx="2" fill="#C9A84C" />
          <rect x="209" y="20" width="4" height="88" fill="#fff" fillOpacity="0.15" />
          {/* 本9 */}
          <rect x="238" y="32" width="18" height="76" rx="2" fill="#C9A84C" />
          {/* 本10 */}
          <rect x="260" y="16" width="28" height="92" rx="2" fill="#C9A84C" />
          <rect x="261" y="16" width="5" height="92" fill="#fff" fillOpacity="0.15" />
          {/* 本11 */}
          <rect x="292" y="28" width="20" height="80" rx="2" fill="#C9A84C" />
          {/* 本12 */}
          <rect x="316" y="22" width="24" height="86" rx="2" fill="#C9A84C" />
          <rect x="317" y="22" width="4" height="86" fill="#fff" fillOpacity="0.15" />
          {/* 本13 */}
          <rect x="344" y="36" width="16" height="72" rx="2" fill="#C9A84C" />
          {/* 本14 */}
          <rect x="364" y="20" width="28" height="88" rx="2" fill="#C9A84C" />
          <rect x="365" y="20" width="5" height="88" fill="#fff" fillOpacity="0.15" />
          {/* 棚の底板 */}
          <rect x="0" y="106" width="400" height="6" rx="1" fill="#C9A84C" />
        </svg>

        <div className="relative z-10">
          <h2 className="text-slate-400 text-sm font-medium tracking-widest uppercase mb-1 drop-shadow-sm font-sans">
            Personal Library
          </h2>
          <h1 className="text-3xl font-serif font-bold text-slate-50 drop-shadow-md tracking-tight">
            BOOK <span className="text-gold-500">MEMORIES</span>
          </h1>
        </div>
      </header>

      {/* --- STATS SUMMARY --- */}
      <section className="px-6 grid grid-cols-4 gap-3 mb-10">
        <StatsCard
          icon={<Library size={18} />}
          count={books.length}
          label="合計"
          color="bg-slate-700/30"
        />
        <StatsCard
          icon={<BookOpen size={18} />}
          count={books.filter((b) => b.status === "reading").length}
          label="読書中"
          color="bg-emerald-500/10 text-emerald-400"
        />
        <StatsCard
          icon={<CheckCircle2 size={18} />}
          count={books.filter((b) => b.status === "done").length}
          label="読了"
          color="bg-gold-500/10 text-gold-500"
        />
        <StatsCard
          icon={<Clock size={18} />}
          count={books.filter((b) => b.status === "plan").length}
          label="積読"
          color="bg-slate-800/30"
        />
      </section>

      {/* --- AI CONCIERGE MESSAGE --- */}
      {books.length === 0 && (
        <section className="px-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium relative overflow-hidden group border-gold-500/20 shadow-gold-900/10"
          >
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-gold-500/10 rounded-full blur-3xl group-hover:bg-gold-500/20 transition-all duration-700"></div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl shadow-lg ring-4 ring-gold-500/10 animate-float">
                <Sparkles size={22} className="text-navy-900" />
              </div>
              <div>
                <p className="text-gold-400 text-xs font-bold font-sans uppercase tracking-widest mb-1.5 opacity-80">
                  Welcome to BOOK MEMORIES
                </p>
                <h3 className="text-slate-100 font-serif font-semibold text-lg leading-snug mb-2">
                  ようこそ、あなたの書斎へ。
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">
                  まずは右下のカメラから、お気に入りの一冊をスキャンして記録を始めてみましょう。
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* --- FILTER TABS --- */}
      <section className="px-6 mb-4">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          <FilterTab active={filter === "all"} onClick={() => setFilter("all")} label="すべて" />
          <FilterTab active={filter === "reading"} onClick={() => setFilter("reading")} label="読書中" />
          <FilterTab active={filter === "done"} onClick={() => setFilter("done")} label="読了済" />
          <FilterTab active={filter === "plan"} onClick={() => setFilter("plan")} label="積読" />
        </div>
      </section>

      {/* --- SEARCH & SORT --- */}
      <section className="px-6 mb-6 flex gap-2 items-center">
        <div className="relative flex-grow">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="タイトル・著者で検索..."
            className="w-full bg-navy-900/60 border border-slate-700/50 rounded-2xl pl-9 pr-9 py-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-gold-500/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="relative flex-shrink-0">
          <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-navy-900/60 border border-slate-700/50 rounded-2xl pl-8 pr-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-gold-500/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="newest">新着順</option>
            <option value="oldest">古い順</option>
            <option value="title">タイトル順</option>
            <option value="rating">評価順</option>
          </select>
        </div>
      </section>

      {/* --- BOOK LIST --- */}
      <section className="px-6 pb-20">
        <AnimatePresence mode="popLayout">
          {filteredBooks.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredBooks.map((book, idx) => (
                <Link key={book.id} href={`/book/${book.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="card-premium flex gap-4 items-center group active:scale-[0.98] transition-transform"
                  >
                    <div className="w-16 h-24 flex-shrink-0 bg-navy-800 rounded-xl overflow-hidden shadow-xl border border-slate-700/50 relative">
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {book.status === "reading" && (
                        <div className="absolute top-1 left-1 bg-emerald-500 w-2 h-2 rounded-full ring-2 ring-navy-900 shadow-lg shadow-emerald-500/40"></div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-[10px] text-slate-500 font-sans uppercase tracking-[0.2em] mb-1">
                        {book.status === "reading" ? "現在読書中" : book.status === "done" ? "読了" : "積読"}
                      </p>
                      <h4 className="text-slate-100 font-serif font-bold text-lg leading-tight truncate mb-1">
                        {book.title}
                      </h4>
                      <p className="text-slate-400 text-sm font-sans opacity-80 truncate">
                        {book.author}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-slate-600 group-hover:text-gold-500 transition-colors" />
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 flex flex-col items-center justify-center opacity-40 text-center"
            >
              <Bookmark size={48} className="mb-4 text-slate-600" />
              <p className="text-slate-500 font-serif italic font-medium">
                {search ? `「${search}」に一致する本が見つかりません` : "まだ記録がありません"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* --- FLOATING SCAN BUTTON --- */}
      <Link href="/scan" className="fixed bottom-24 right-5 z-40">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-2xl shadow-gold-500/40 border-4 border-navy-950/20 relative"
        >
          <Camera size={28} className="text-navy-950" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-navy-900 rounded-full flex items-center justify-center border-2 border-gold-500 group">
            <Plus size={12} className="text-gold-500 group-hover:rotate-90 transition-transform" />
          </div>
        </motion.div>
      </Link>

      {/* --- BOTTOM NAV --- */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-20 bg-navy-950/80 backdrop-blur-2xl border-t border-slate-800/80 px-6 flex items-center justify-around z-50">
        <NavBtn href="/" icon={<Library size={24} />} active label="ホーム" />
        <NavBtn href="/analysis" icon={<BarChart3 size={24} />} label="分析" />
      </nav>
    </div>
  );
}

function StatsCard({ icon, count, label, color }: { icon: React.ReactNode; count: number; label: string; color: string }) {
  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-2xl ${color} border border-slate-800/50 shadow-inner backdrop-blur-sm group hover:scale-105 transition-transform cursor-pointer`}>
      <div className="mb-1 opacity-60 group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-xl font-bold font-sans tracking-tight">{count}</span>
      <span className="text-[10px] uppercase opacity-40 tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

function FilterTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
        active
          ? "bg-gold-500/10 border-gold-500/50 text-gold-500 shadow-lg shadow-gold-900/10"
          : "bg-navy-900/40 border-slate-800 text-slate-500 hover:text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

function NavBtn({ href, icon, active, label }: { href: string; icon: React.ReactNode; active?: boolean; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1" style={{ touchAction: "manipulation" }}>
      <div className={`p-2.5 rounded-2xl transition-all ${active ? "bg-gold-500/15 text-gold-500 shadow-md shadow-gold-500/10 ring-1 ring-gold-500/30" : "text-slate-500"}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold font-sans uppercase tracking-[0.2em] transition-colors ${active ? "text-gold-500" : "text-slate-500"}`}>
        {label}
      </span>
    </Link>
  );
}
