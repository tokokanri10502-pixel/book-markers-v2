import { getBooks } from "@/lib/books";
import { createClient } from "@/lib/supabase-server";
import BookListClient from "@/components/BookListClient";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const books = user ? await getBooks(user.id) : [];
  return <BookListClient books={books} />;
}
