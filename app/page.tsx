import { getBooks } from "@/lib/books";
import BookListClient from "@/components/BookListClient";

export const dynamic = "force-dynamic"; // キャッシュを使わず毎回最新データを取得

export default async function Dashboard() {
  const books = await getBooks();
  return <BookListClient books={books} />;
}
