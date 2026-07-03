"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Book } from "@/lib/types";
import {
  getLastUserId,
  setLastUserId,
  readBooksCache,
  writeBooksCache,
} from "@/lib/booksCache";

// キャッシュ即表示 → 裏で最新取得して差し替え（stale-while-revalidate）。
// Supabase無料プランのDB応答(0.5〜1.7秒)を待たずに前回の本棚を先に見せる。
// 返り値 null = キャッシュなしで取得中（スケルトン表示用）。
export function useBooks(): Book[] | null {
  const [books, setBooks] = useState<Book[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    // 1. セッション確認を待たずに前回ユーザーのキャッシュを即表示。
    //    トークン期限切れ時（翌朝の起動など）は getSession() が更新通信で
    //    数百ms待たされるため、その完了を待たないことが体感速度に効く。
    const lastUserId = getLastUserId();
    const cachedForLastUser = lastUserId ? readBooksCache(lastUserId) : null;
    if (cachedForLastUser) setBooks(cachedForLastUser);

    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        // 通常は middleware が /login へ送るが、Service Worker がキャッシュした
        // ページを未ログイン状態で開いた場合のフォールバック
        window.location.replace("/login");
        return;
      }
      if (cancelled) return;

      let hasCache = cachedForLastUser !== null;
      if (user.id !== lastUserId) {
        // 端末共有で別アカウントに切り替わった場合: その人のキャッシュに差し替え
        const own = readBooksCache(user.id);
        setBooks(own);
        hasCache = own !== null;
      }
      setLastUserId(user.id);

      // 2. 裏で最新を取得して差し替え＋キャッシュ更新
      const { data } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (data) {
        setBooks(data as Book[]);
        writeBooksCache(user.id, data as Book[]);
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
