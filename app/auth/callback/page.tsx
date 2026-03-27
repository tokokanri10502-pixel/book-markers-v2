"use client";

import { useEffect } from "react";

export default function AuthCallbackPage() {
  useEffect(() => {
    // セッション確立後にトップへ
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-4">
      <div className="text-5xl animate-pulse">📚</div>
      <p className="text-slate-400 text-sm">ログイン処理中...</p>
    </div>
  );
}
