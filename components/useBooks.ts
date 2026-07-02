"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Book } from "@/lib/types";

const cacheKey = (userId: string) => `bm2-books-${userId}`;

// キャッシュ即表示 → 裏で最新取得して差し替え（stale-while-revalidate）。
// Supabase無料プランのDB応答(0.5〜1.7秒)を待たずに前回の本棚を先に見せる。
// 返り値 null = キャッシュなしで取得中（スケルトン表示用）。
export function useBooks(): Book[] | null {
  const [books, setBooks] = useState<Book[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    (async () => {
      // getSession() はクッキー読み取りのみでネットワーク通信なし
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return; // 未ログインは middleware が /login へ送るためここには来ない

      let hasCache = false;
      try {
        const cached = localStorage.getItem(cacheKey(user.id));
        if (cached) {
          const parsed = JSON.parse(cached) as Book[];
          if (Array.isArray(parsed) && !cancelled) {
            setBooks(parsed);
            hasCache = true;
          }
        }
      } catch {
        // キャッシュ破損時は無視して通常取得にフォールバック
      }

      const { data } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (data) {
        setBooks(data as Book[]);
        try {
          localStorage.setItem(cacheKey(user.id), JSON.stringify(data));
        } catch {
          // ストレージ容量超過などは無視（表示は最新データで済んでいる）
        }
      } else if (!hasCache) {
        // 取得失敗かつキャッシュなし: スケルトンのまま固まらないよう空表示にする
        setBooks([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return books;
}
