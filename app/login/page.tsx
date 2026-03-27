"use client";

import { createClient } from "@/lib/supabase-browser";
import { useState, useRef } from "react";

type Step = "email" | "code" | "success";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const supabase = createClient();

  // ① メール送信
  const handleSendEmail = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      setError(`送信失敗: ${error.message}`);
    } else {
      setStep("code");
    }
  };

  // ② コード入力
  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
    // 8桁揃ったら自動送信
    if (newCode.every((d) => d !== "") && newCode.join("").length === 8) {
      handleVerify(newCode.join(""));
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ペースト対応
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
    if (!pasted) return;
    const newCode = [...code];
    pasted.split("").forEach((digit, i) => { newCode[i] = digit; });
    setCode(newCode);
    const nextIndex = Math.min(pasted.length, 7);
    inputRefs.current[nextIndex]?.focus();
    if (pasted.length === 8) {
      handleVerify(pasted);
    }
  };

  // ③ コード検証
  const handleVerify = async (token: string) => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    setLoading(false);
    if (error) {
      setError("コードが正しくありません。再度お試しください。");
      setCode(["", "", "", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      setStep("success");
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
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

      <div className="w-full flex flex-col gap-4">

        {/* STEP 1: メールアドレス入力 */}
        {step === "email" && (
          <>
            <p className="text-slate-400 text-sm text-center">
              メールアドレスに8桁のコードを送ります
            </p>
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
              className="w-full bg-navy-900 border border-slate-700 rounded-2xl py-4 px-5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-gold-500/50 text-center"
            />
            <button
              onClick={handleSendEmail}
              disabled={loading || !email}
              className="w-full bg-gold-500 text-navy-950 font-bold py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-50"
            >
              {loading ? "送信中..." : "コードを送信"}
            </button>
          </>
        )}

        {/* STEP 2: コード入力 */}
        {step === "code" && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <p className="text-slate-100 font-bold text-lg">メールを確認してください</p>
              <p className="text-slate-400 text-sm mt-1">
                <span className="text-gold-400">{email}</span> に<br />
                8桁のコードを送りました
              </p>
            </div>

            {/* 8桁入力 */}
            <div className="flex gap-1.5">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  onPaste={handlePaste}
                  className="w-9 h-12 bg-navy-900 border border-slate-700 rounded-xl text-slate-100 text-lg font-bold text-center focus:outline-none focus:border-gold-500 focus:bg-navy-800"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {loading && (
              <p className="text-slate-400 text-sm">確認中...</p>
            )}

            <button
              onClick={() => { setStep("email"); setCode(["","","","","","","",""]); setError(""); }}
              className="text-slate-500 text-sm"
            >
              メールアドレスを変更する
            </button>
          </div>
        )}

        {/* STEP 3: 成功 */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-5xl">✅</div>
            <p className="text-slate-100 font-bold">ログイン成功！</p>
            <p className="text-slate-400 text-sm">移動中...</p>
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
