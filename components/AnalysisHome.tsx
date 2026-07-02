"use client";

import AnalysisClient from "@/components/AnalysisClient";
import HomeLoading from "@/app/loading";
import { useBooks } from "@/components/useBooks";

export default function AnalysisHome() {
  const books = useBooks();
  if (books === null) return <HomeLoading />;
  return <AnalysisClient books={books} />;
}
