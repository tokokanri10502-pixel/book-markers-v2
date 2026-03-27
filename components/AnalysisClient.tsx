"use client";

import React from "react";
import {
  BarChart3,
  Sparkles,
  PieChart as PieChartIcon,
  BookOpen,
  TrendingUp,
  ChevronRight,
  Lightbulb,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
} from "recharts";
import { Book } from "@/lib/types";

const GENRE_COLORS = ["#c9a84c", "#4e83cc", "#4fcc91", "#cc4e77", "#9b4ecc", "#64748b"];

type GenreEntry = { name: string; value: number; color: string };
type MonthEntry = { name: string; books: number };

function buildGenreData(books: Book[]): GenreEntry[] {
  const map: Record<string, number> = {};
  books.forEach((b) => {
    const key = b.genre || "その他";
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).map(([name, value], i) => ({
    name,
    value,
    color: GENRE_COLORS[i % GENRE_COLORS.length],
  }));
}

function buildMonthlyData(books: Book[]): MonthEntry[] {
  const now = new Date();
  const months: MonthEntry[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ name: `${d.getMonth() + 1}月`, books: 0 });
  }
  books.forEach((b) => {
    const d = new Date(b.created_at);
    for (let i = 0; i < 6; i++) {
      const ref = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      if (d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()) {
        months[i].books += 1;
        break;
      }
    }
  });
  return months;
}

export default function AnalysisClient({ books }: { books: Book[] }) {
  const genreData = buildGenreData(books);
  const monthlyData = buildMonthlyData(books);
  const doneCount = books.filter((b) => b.status === "done").length;
  const readingCount = books.filter((b) => b.status === "reading").length;

  return (
    <div className="flex flex-col pt-8">
      {/* --- HEADER --- */}
      <header className="px-6 mb-8 flex items-center justify-between">
        <Link href="/" className="p-2 bg-navy-900 border border-slate-700/50 rounded-2xl transition-colors" style={{ touchAction: "manipulation" }}>
          <ArrowLeft size={20} className="text-slate-400" />
        </Link>
        <h1 className="text-xl font-serif font-bold text-slate-100 italic">読書分析</h1>
        <div className="w-10"></div>
      </header>

      {/* --- AI CONCIERGE REPORT --- */}
      <section className="px-6 mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-premium relative overflow-hidden group shadow-gold-900/10 border-gold-500/20"
        >
          <div className="absolute top-4 right-4 text-gold-500 animate-pulse">
            <Sparkles size={24} />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1 px-3 bg-gold-500/10 rounded-full border border-gold-500/30">
              <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest">
                {books.length > 0 ? "Library Stats" : "Growth Phase"}
              </span>
            </div>
          </div>
          {books.length > 0 ? (
            <>
              <h3 className="text-2xl font-serif font-black text-slate-100 leading-tight mb-4 pr-10">
                合計 {books.length} 冊を記録中。<br />
                <span className="text-gold-500">{doneCount} 冊</span>を読了しました。
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 font-sans">
                現在 {readingCount} 冊を読書中。引き続き記録を続けると、AIがより詳細な読書傾向を分析します。
              </p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-serif font-black text-slate-100 leading-tight mb-4 pr-10">
                「データが蓄積されると、<br />AIがあなたの読書を分析します。」
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 font-sans">
                本を数冊登録すると、ここにあなたの読書傾向や、次なる一冊へのヒントが表示されます。
                まずは一冊、スキャンから始めてみましょう。
              </p>
            </>
          )}
          <Link
            href="/scan"
            className="p-4 bg-navy-950/40 rounded-2xl border border-slate-700/50 flex items-center justify-between hover:bg-navy-950 transition-colors group cursor-pointer active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gold-500/10 rounded-xl text-gold-500 shadow-lg shadow-gold-500/5 ring-1 ring-gold-500/20">
                <Lightbulb size={20} />
              </div>
              <div>
                <h4 className="text-slate-200 font-bold text-sm">次の一冊をスキャン</h4>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">新しい世界を広げましょう</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-600 group-hover:text-gold-500 transition-colors" />
          </Link>
        </motion.div>
      </section>

      {/* --- CHARTS --- */}
      {genreData.length > 0 && (
        <section className="px-6 mb-10 overflow-hidden">
          <h2 className="text-slate-300 font-serif font-bold text-lg mb-6 flex items-center gap-3">
            <PieChartIcon size={20} className="text-gold-500" />
            ジャンル構成
          </h2>
          <div className="card-premium p-6 flex flex-col items-center">
            <div className="w-full h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genreData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                    {genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid rgba(100, 116, 139, 0.5)", color: "#f1f5f9" }} itemStyle={{ color: "#f1f5f9" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-100 drop-shadow-lg">{books.length}</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] font-sans">冊</span>
              </div>
            </div>
            <div className="w-full mt-6 grid grid-cols-2 gap-4">
              {genreData.map((g, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full opacity-60 shadow-lg shadow-black/20" style={{ backgroundColor: g.color }}></div>
                  <span className="text-xs text-slate-400 font-sans tracking-wide">{g.name}</span>
                  <span className="text-xs text-slate-500 font-bold ml-auto">{g.value}冊</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- MONTHLY TREND --- */}
      <section className="px-6 mb-20">
        <h2 className="text-slate-300 font-serif font-bold text-lg mb-6 flex items-center gap-3">
          <TrendingUp size={20} className="text-gold-500" />
          月次の推移（直近6ヶ月）
        </h2>
        <div className="card-premium p-6">
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} dy={10} />
                <Tooltip cursor={{ fill: "rgba(201,168,76, 0.05)" }} contentStyle={{ backgroundColor: "#0f172a", borderRadius: "16px", border: "1px solid rgba(100, 116, 139, 0.5)", color: "#f1f5f9" }} />
                <Bar dataKey="books" fill="#c9a84c" radius={[10, 10, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex items-center justify-between p-4 bg-gold-500/5 rounded-2xl border border-gold-500/10 ring-1 ring-gold-500/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold-500 rounded-xl">
                <Zap size={18} className="text-navy-950" />
              </div>
              <div className="text-slate-200 font-bold text-sm">今月の登録数</div>
            </div>
            <span className="text-gold-500 font-serif font-bold text-lg italic">
              {monthlyData[monthlyData.length - 1]?.books ?? 0}冊
            </span>
          </div>
        </div>
      </section>


      {/* --- BOTTOM NAV --- */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-20 bg-navy-950/80 backdrop-blur-2xl border-t border-slate-800/80 px-6 flex items-center justify-around z-50">
        <NavBtn href="/" icon={<BookOpen size={24} />} label="本棚" />
        <NavBtn href="/analysis" icon={<BarChart3 size={24} />} active label="分析" />
      </nav>
    </div>
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
