import { getBook } from "@/lib/books";
import { createClient } from "@/lib/supabase-server";
import BookDetailClient from "@/components/BookDetailClient";
import Link from "next/link";

export default async function BookDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const book = user ? await getBook(params.id, user.id) : null;

  if (!book) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center gap-4">
        <p className="text-slate-400 font-serif italic text-lg">書籍が見つかりませんでした</p>
        <Link href="/" className="text-gold-500 font-bold underline">ホームに戻る</Link>
      </div>
    );
  }

  return <BookDetailClient book={book} />;
}
