"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, requireSessionUser } from "@/lib/supabase-browser";
import BookDetailLoading from "@/app/book/[id]/loading";
import { Book } from "@/lib/types";
import {
  getLastUserId,
  readBooksCache,
  upsertBookInCache,
  removeBookFromCache,
} from "@/lib/booksCache";
import BookDetailClient from "@/components/BookDetailClient";
import LoadError from "@/components/LoadError";

type State =
  | { phase: "loading" }
  | { phase: "ready"; book: Book; userId: string }
  | { phase: "notfound" }
  | { phase: "error" };

export default function BookDetailHome({ id }: { id: string }) {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    let cancelled = false;

    // 1. ホーム一覧のキャッシュに居ればDB応答を待たずに即表示
    const lastUserId = getLastUserId();
    const cached = lastUserId
      ? readBooksCache(lastUserId)?.find((b) => b.id === id)
      : undefined;
    if (cached && lastUserId) {
      setState({ phase: "ready", book: cached, userId: lastUserId });
    }

    // 2. キャッシュ表示の有無にかかわらず、必ず裏で最新を確認する。
    //    別端末での編集・削除やアカウント切替をここで補正する
    //    （編集中の入力は BookDetailClient 側が項目ごとに保護する）。
    (async () => {
      const supabase = createClient();
      const user = await requireSessionUser(supabase);
      if (!user || cancelled) return;

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        // 通信エラー: キャッシュ表示があれば維持、なければ「見つかりません」とは区別してエラー表示
        setState((prev) => (prev.phase === "ready" ? prev : { phase: "error" }));
        return;
      }
      if (data) {
        upsertBookInCache(user.id, data as Book);
        setState({ phase: "ready", book: data as Book, userId: user.id });
      } else {
        // 本当に存在しない（削除済み、または自分の本ではない）。自分のキャッシュからも取り除く
        removeBookFromCache(user.id, id);
        setState({ phase: "notfound" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.phase === "loading") {
    // ルート遷移時の app/book/[id]/loading.tsx と同じスケルトンを使い、二重定義とチラつきを防ぐ
    return <BookDetailLoading />;
  }

  if (state.phase === "error") {
    return <LoadError />;
  }

  if (state.phase === "notfound") {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center gap-4">
        <p className="text-slate-400 font-serif italic text-lg">書籍が見つかりませんでした</p>
        <Link href="/" className="text-gold-500 font-bold underline">ホームに戻る</Link>
      </div>
    );
  }

  return <BookDetailClient book={state.book} userId={state.userId} />;
}
