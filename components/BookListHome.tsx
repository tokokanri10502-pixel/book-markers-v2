"use client";

import BookListClient from "@/components/BookListClient";
import HomeLoading from "@/app/loading";
import LoadError from "@/components/LoadError";
import { useBooks } from "@/components/useBooks";

export default function BookListHome() {
  const { books, failed } = useBooks();
  if (books === null && failed) return <LoadError />;
  if (books === null) return <HomeLoading />;
  return <BookListClient books={books} />;
}
