"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Star,
  Calendar,
  BookOpen,
  Trash2,
  Check,
  Edit3,
  Tag,
  Clock,
  CheckCircle2,
  Bookmark,
  Loader2,
  Share2,
  Copy,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Book, BookStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function BookDetailClient({ book: initialBook }: { book: Book }) {
  const router = useRouter();
  const [book, setBook] = useState(initialBook);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<BookStatus>(initialBook.status);
  const [rating, setRating] = useState(initialBook.rating || 0);
  const [review, setReview] = useState(initialBook.review || "");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/books/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rating: rating || null, review }),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      setBook({ ...book, status, rating, review });
      alert("保存しました。");
    } catch (error) {
      console.error("Save error:", error);
      alert("保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`「${book.title}」を削除しますか？`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除に失敗しました");
      // フルリロードでキャッシュを確実に破棄してホームへ
      window.location.href = "/";
    } catch (error) {
      console.error("Delete error:", error);
      alert("削除に失敗しました。");
      setIsDeleting(false);
    }
  };

  const buildShareText = () => {
    const stars = rating ? "⭐".repeat(rating) : "";
    const statusLabel = status === "done" ? "読了" : status === "reading" ? "読書中" : "積読";
    const lines = [
      `📚 ${book.title}`,
      `✍️ ${book.author}`,
      stars,
      `【${statusLabel}】`,
      review ? `\n${review}` : "",
      "\n#BookMemories #読書記録",
    ].filter(Boolean);
    return lines.join("\n");
  };

  const handleShare = async () => {
    const text = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // キャンセル時は何もしない
      }
    } else {
      // Web Share API 非対応の場合はクリップボードにコピー
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col pb-20 pt-8 bg-navy-950">
      {/* --- HEADER --- */}
      <header className="px-6 mb-8 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 bg-navy-900 border border-slate-700/50 rounded-2xl transition-colors"
          style={{ touchAction: "manipulation" }}
        >
          <ArrowLeft size={20} className="text-slate-400" />
        </button>
        <span className="text-slate-100 font-serif font-bold text-lg italic">
          書籍詳細
        </span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-slate-600 hover:text-red-400 transition-colors disabled:opacity-40"
        >
          {isDeleting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Trash2 size={20} />
          )}
        </button>
      </header>

      {/* --- COVER & MAIN INFO --- */}
      <section className="px-6 mb-12 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-48 h-72 bg-navy-800 rounded-[32px] overflow-hidden shadow-2xl shadow-gold-900/10 border-4 border-slate-800/80 mb-8 flex-shrink-0 relative group"
        >
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute top-4 right-4 p-2 bg-gold-500 rounded-2xl shadow-lg ring-4 ring-navy-950">
            {status === "done" ? (
              <CheckCircle2 size={16} className="text-navy-950" />
            ) : (
              <Clock size={16} className="text-navy-950" />
            )}
          </div>
        </motion.div>

        <div className="text-center w-full max-w-[300px]">
          <h1 className="text-3xl font-serif font-black text-slate-100 leading-tight mb-2 underline decoration-gold-500/20 decoration-4 underline-offset-4">
            {book.title}
          </h1>
          <p className="text-slate-400 font-sans font-medium mb-4 opacity-80">
            {book.author}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {book.genre && <Badge icon={<Tag size={12} />} label={book.genre} />}
            <Badge icon={<Calendar size={12} />} label={formatDate(book.created_at)} />
          </div>
        </div>
      </section>

      {/* --- STATUS SELECTOR --- */}
      <section className="px-6 mb-12">
        <div className="grid grid-cols-3 gap-3">
          <StatusToggle active={status === "reading"} onClick={() => setStatus("reading")} label="読書中" icon={<BookOpen size={18} />} color="emerald" />
          <StatusToggle active={status === "done"} onClick={() => setStatus("done")} label="読了" icon={<CheckCircle2 size={18} />} color="gold" />
          <StatusToggle active={status === "plan"} onClick={() => setStatus("plan")} label="積読" icon={<Bookmark size={18} />} color="slate" />
        </div>
      </section>

      {/* --- REVIEW AREA --- */}
      <section className="px-6 mb-12">
        <div className="card-premium space-y-6">
          <div>
            <label className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-4 block">
              5段階評価
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className={`p-1 transition-transform active:scale-90 ${s <= rating ? "text-gold-500 scale-110" : "text-slate-700"}`}>
                  <Star size={28} fill={s <= rating ? "currentColor" : "none"} strokeWidth={2} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] block">
                感想・メモ
              </label>
              <Edit3 size={14} className="text-slate-600" />
            </div>
            <textarea
              className="w-full bg-navy-950/50 border border-slate-700/50 rounded-2xl p-4 text-slate-300 font-serif leading-relaxed h-32 focus:bg-navy-950 focus:border-gold-500/30 focus:outline-none transition-all placeholder:text-slate-700"
              placeholder="読後の感情や、大切だと思った一説を自由にメモしましょう…"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </div>

          <button onClick={handleSave} disabled={isSaving} className="btn-primary w-full py-4 text-lg disabled:opacity-60">
            {isSaving ? (
              <><Loader2 size={20} className="animate-spin" /> 保存中...</>
            ) : (
              <><Check size={20} /> 記録を保存する</>
            )}
          </button>

          <button
            onClick={handleShare}
            className="btn-secondary w-full py-4 text-base"
          >
            {copied ? (
              <><Copy size={18} className="text-gold-500" /> コピーしました</>
            ) : (
              <><Share2 size={18} /> この本をシェアする</>
            )}
          </button>
        </div>
      </section>

      {/* --- DESCRIPTION --- */}
      {book.description && (
        <section className="px-6 mb-20 overflow-hidden">
          <h2 className="text-slate-300 font-serif font-bold text-lg mb-6 drop-shadow-sm">
            この本について
          </h2>
          <div className="relative group">
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-gold-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-gold-400/20 transition-all"></div>
            <p className="text-slate-400 text-sm leading-relaxed font-serif italic text-justify opacity-90 relative z-10">
              {book.description}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-navy-900 border border-slate-700/50 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
      {icon}
      {label}
    </div>
  );
}

function StatusToggle({ active, onClick, label, icon, color }: {
  active: boolean; onClick: () => void; label: string; icon: React.ReactNode; color: "emerald" | "gold" | "slate";
}) {
  const colorClasses = {
    emerald: active ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-navy-900/40 border-slate-800 text-slate-500 hover:text-slate-400",
    gold: active ? "bg-gold-500/10 border-gold-500/50 text-gold-500 shadow-lg shadow-gold-500/10" : "bg-navy-900/40 border-slate-800 text-slate-500 hover:text-slate-400",
    slate: active ? "bg-slate-700/20 border-slate-700 text-slate-100" : "bg-navy-900/40 border-slate-800 text-slate-500 hover:text-slate-400",
  };

  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all active:scale-95 space-y-2 ${colorClasses[color]}`}>
      <div className={`transition-transform duration-500 ${active ? "scale-110" : "opacity-40"}`}>{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{label}</span>
      {active && (
        <motion.div
          layoutId="indicator"
          className={`w-1 h-1 rounded-full ${color === "emerald" ? "bg-emerald-400" : color === "gold" ? "bg-gold-500" : "bg-slate-100"}`}
        />
      )}
    </button>
  );
}
