"use client";

import { useEffect, useState } from "react";
import { createClient, requireSessionUser } from "@/lib/supabase-browser";
import { Book } from "@/lib/types";
import {
  getLastUserId,
  setLastUserId,
  readBooksCache,
  readBooksCacheRaw,
  writeBooksCacheRaw,
  clearBooksCache,
} from "@/lib/booksCache";

// 一覧・分析で使う列だけ取得する。description（AI生成の紹介文・長文）は
// 一覧に不要なので除外し、転送量とlocalStorage消費を抑える。
// 詳細ページ（BookDetailHome）が全列を取得してキャッシュへ補完する。
const LIST_COLUMNS =
  "id,title,author,publisher,genre,isbn,cover_url,status,review,rating,user_id,created_at,updated_at";

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
      const user = await requireSessionUser(supabase);
      if (!user || cancelled) return;

      let hasCache = cachedForLastUser !== null;
      if (user.id !== lastUserId) {
        // アカウントが切り替わっていた: 前のユーザーのキャッシュは破棄し、自分のものに差し替え
        if (lastUserId) clearBooksCache(lastUserId);
        const own = readBooksCache(user.id);
        setBooks(own);
        hasCache = own !== null;
        setLastUserId(user.id);
      }

      // 2. 裏で最新を取得。表示中のキャッシュと同一なら再レンダリングも書き込みもしない
      //    （毎回の全リスト再描画によるカクつき防止）
      const { data, error } = await supabase
        .from("books")
        .select(LIST_COLUMNS)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (data && !error) {
        const fresh = data as unknown as Book[];
        const freshRaw = JSON.stringify(fresh);
        if (freshRaw !== readBooksCacheRaw(user.id) || !hasCache) {
          setBooks(fresh);
          writeBooksCacheRaw(user.id, freshRaw);
        }
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
