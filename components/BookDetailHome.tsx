"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { Book } from "@/lib/types";
import { getLastUserId, readBooksCache, upsertBookInCache } from "@/lib/booksCache";
import BookDetailClient from "@/components/BookDetailClient";

type State =
  | { phase: "loading" }
  | { phase: "ready"; book: Book; userId: string }
  | { phase: "notfound" };

export default function BookDetailHome({ id }: { id: string }) {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    let cancelled = false;

    // ホーム一覧のキャッシュに居ればDB応答を待たずに即表示。
    // キャッシュはホーム表示のたびに最新化されているので鮮度は数秒〜数分。
    // 編集中に裏で差し替えると入力が消えるため、キャッシュがあれば再取得しない。
    const lastUserId = getLastUserId();
    const cached = lastUserId
      ? readBooksCache(lastUserId)?.find((b) => b.id === id)
      : undefined;
    if (cached && lastUserId) {
      setState({ phase: "ready", book: cached, userId: lastUserId });
      return;
    }

    // キャッシュにない場合（ディープリンク・初回など）のみDBから取得
    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        window.location.replace("/login");
        return;
      }
      const { data } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (cancelled) return;
      if (data) {
        upsertBookInCache(user.id, data as Book);
        setState({ phase: "ready", book: data as Book, userId: user.id });
      } else {
        setState({ phase: "notfound" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.phase === "loading") {
    return (
      <div className="flex flex-col min-h-screen items-center pt-24 animate-pulse">
        <div className="w-48 h-72 bg-navy-800/60 rounded-[32px] border-4 border-slate-800/50 mb-8" />
        <div className="w-48 h-6 bg-slate-800 rounded-full mb-3" />
        <div className="w-28 h-4 bg-slate-800/60 rounded-full" />
      </div>
    );
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
