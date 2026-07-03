"use client";

import AnalysisClient from "@/components/AnalysisClient";
import HomeLoading from "@/app/loading";
import LoadError from "@/components/LoadError";
import { useBooks } from "@/components/useBooks";

export default function AnalysisHome() {
  const { books, failed } = useBooks();
  if (books === null && failed) return <LoadError />;
  if (books === null) return <HomeLoading />;
  return <AnalysisClient books={books} />;
}
