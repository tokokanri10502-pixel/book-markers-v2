"use client";

import BookListClient from "@/components/BookListClient";
import HomeLoading from "@/app/loading";
import { useBooks } from "@/components/useBooks";

export default function BookListHome() {
  const books = useBooks();
  if (books === null) return <HomeLoading />;
  return <BookListClient books={books} />;
}
