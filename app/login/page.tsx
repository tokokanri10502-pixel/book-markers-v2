"use client";

import { createClient } from "@/lib/supabase-browser";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setError(`送信失敗: ${error.message}`);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-8 gap-8">
      {/* タイトル */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-slate-400 text-xs tracking-[0.3em] uppercase">Personal Library</p>
        <h1 className="text-4xl font-bold tracking-wider font-serif">
          <span className="text-slate-100">BOOK </span>
          <span className="text-gold-400">MEMORIES</span>
        </h1>
        <p className="text-slate-500 text-sm mt-2 text-center">
          読書の記録を、もっと気軽に。
        </p>
      </div>

      <div className="text-7xl select-none">📚</div>

      {/* フォーム */}
      <div className="w-full flex flex-col gap-4">
        {!sent ? (
          <>
            <p className="text-slate-400 text-sm text-center">
              メールアドレスにログインリンクを送ります
            </p>
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="w-full bg-navy-900 border border-slate-700 rounded-2xl py-4 px-5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-gold-500/50 text-center"
            />
            <button
              onClick={handleSend}
              disabled={loading || !email}
              className="w-full bg-gold-500 text-navy-950 font-bold py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-50"
            >
              {loading ? "送信中..." : "ログインリンクを送信"}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="text-5xl">📬</div>
            <p className="text-slate-100 font-bold text-lg">メールを確認してください</p>
            <p className="text-slate-400 text-sm">
              <span className="text-gold-400">{email}</span> に<br />
              ログインリンクを送りました。<br />
              メール内の「Confirm your mail」をタップしてください。
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="text-slate-500 text-sm mt-2"
            >
              別のメールアドレスで試す
            </button>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </div>

      <p className="text-slate-600 text-xs text-center">
        ログインすることで、あなた専用の<br />読書ライブラリが作成されます。
      </p>
    </div>
  );
}
