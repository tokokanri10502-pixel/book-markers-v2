"use client";

import { ReactNode } from "react";
import { Book } from "@/lib/types";
import HomeLoading from "@/app/loading";
import LoadError from "@/components/LoadError";
import { useBooks } from "@/components/useBooks";

// 一覧データの取得状態を一元管理するゲート。
// ローディング／エラー時の表示方針はここだけで決まる（ホーム・分析で共通）。
export default function BooksGate({ children }: { children: (books: Book[]) => ReactNode }) {
  const { books, failed } = useBooks();
  if (books === null && failed) return <LoadError />;
  if (books === null) return <HomeLoading />;
  return <>{children(books)}</>;
}
