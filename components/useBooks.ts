"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Book } from "@/lib/types";
import {
  getLastUserId,
  setLastUserId,
  readBooksCache,
  writeBooksCache,
  clearBooksCache,
} from "@/lib/booksCache";

// キャッシュ即表示 → 裏で最新取得して差し替え（stale-while-revalidate）。
// Supabase無料プランのDB応答(0.5〜1.7秒)を待たずに前回の本棚を先に見せる。
// books null = 取得中（スケルトン表示用）。failed = キャッシュなしで取得失敗（エラー表示用）。
export function useBooks(): { books: Book[] | null; failed: boolean } {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // 1. セッション確認を待たずに前回ユーザーのキャッシュを即表示。
    //    トークン期限切れ時（翌朝の起動など）は getSession() が更新通信で
    //    数百ms待たされるため、その完了を待たないことが体感速度に効く。
    //    アカウント切替時の他人データ表示は、ログイン成功時の prepareCacheForUser
    //    （他ユーザーのキャッシュ全削除）で防いでいる。
    const lastUserId = getLastUserId();
    const cachedForLastUser = lastUserId ? readBooksCache(lastUserId) : null;
    if (cachedForLastUser) setBooks(cachedForLastUser);

    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        // オフラインではトークン更新が失敗してセッションが取れないだけの場合があるので、
        // キャッシュ表示を維持して留まる（ログイン画面はオフラインでは使えない）
        if (typeof navigator !== "undefined" && navigator.onLine === false) return;
        // 通常は middleware が /login へ送るが、Service Worker がキャッシュした
        // ページを未ログイン状態で開いた場合のフォールバック
        window.location.replace("/login");
        return;
      }
      if (cancelled) return;

      let hasCache = cachedForLastUser !== null;
      if (user.id !== lastUserId) {
        // アカウントが切り替わっていた: 前のユーザーのキャッシュは破棄し、自分のものに差し替え
        if (lastUserId) clearBooksCache(lastUserId);
        const own = readBooksCache(user.id);
        setBooks(own);
        hasCache = own !== null;
        setLastUserId(user.id);
      }

      // 2. 裏で最新を取得して差し替え＋キャッシュ更新
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (data && !error) {
        setBooks(data as Book[]);
        writeBooksCache(user.id, data as Book[]);
      } else if (!hasCache) {
        // 取得失敗かつキャッシュなし: 空の本棚（データ消失に見える）ではなくエラー表示にする
        setFailed(true);
      }
      // 取得失敗でもキャッシュ表示中ならそのまま維持（次回開いたときに再試行される）
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { books, failed };
}
