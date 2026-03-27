"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const handleCallback = async () => {
      // URLのクエリパラメータを取得
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const token_hash = params.get("token_hash");
      const type = params.get("type");

      try {
        if (code) {
          // PKCEフロー（マジックリンク）
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (token_hash && type) {
          // メール確認フロー
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });
          if (error) throw error;
        } else {
          // ハッシュフラグメントで届く場合はSupabaseが自動処理
          // セッション確立を少し待つ
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error("セッションが取得できませんでした");
        }

        // 成功したらトップページへ
        window.location.href = "/";
      } catch (err: any) {
        console.error("Auth error:", err.message);
        window.location.href = "/login?error=auth";
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-4">
      <div className="text-5xl animate-pulse">📚</div>
      <p className="text-slate-400 text-sm">ログイン処理中...</p>
    </div>
  );
}
