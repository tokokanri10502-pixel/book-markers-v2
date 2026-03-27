"use client";

import { createClient } from "@/lib/supabase-browser";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSendOtp = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      setError("メールの送信に失敗しました。再度お試しください。");
    } else {
      setStep("otp");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    setLoading(false);
    if (error) {
      setError("コードが正しくありません。再度お試しください。");
    } else {
      window.location.href = "/";
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
        {step === "email" ? (
          <>
            <p className="text-slate-400 text-sm text-center">
              メールアドレスに確認コードを送ります
            </p>
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              className="w-full bg-navy-900 border border-slate-700 rounded-2xl py-4 px-5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-gold-500/50 text-center"
            />
            <button
              onClick={handleSendOtp}
              disabled={loading || !email}
              className="w-full bg-gold-500 text-navy-950 font-bold py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-50"
            >
              {loading ? "送信中..." : "コードを送信"}
            </button>
          </>
        ) : (
          <>
            <p className="text-slate-400 text-sm text-center">
              <span className="text-gold-400">{email}</span> に送られた<br />
              6桁のコードを入力してください
            </p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              className="w-full bg-navy-900 border border-slate-700 rounded-2xl py-4 px-5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-gold-500/50 text-center text-2xl tracking-[0.5em]"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full bg-gold-500 text-navy-950 font-bold py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-50"
            >
              {loading ? "確認中..." : "ログイン"}
            </button>
            <button
              onClick={() => { setStep("email"); setOtp(""); setError(""); }}
              className="text-slate-500 text-sm text-center"
            >
              メールアドレスを変更する
            </button>
          </>
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
