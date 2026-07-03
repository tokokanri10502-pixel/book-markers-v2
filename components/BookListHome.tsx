"use client";

import BooksGate from "@/components/BooksGate";
import BookListClient from "@/components/BookListClient";

export default function BookListHome() {
  return <BooksGate>{(books) => <BookListClient books={books} />}</BooksGate>;
}
