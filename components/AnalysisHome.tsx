"use client";

import BooksGate from "@/components/BooksGate";
import AnalysisClient from "@/components/AnalysisClient";

export default function AnalysisHome() {
  return <BooksGate>{(books) => <AnalysisClient books={books} />}</BooksGate>;
}
