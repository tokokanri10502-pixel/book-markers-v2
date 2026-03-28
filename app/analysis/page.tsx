import { getBooks } from "@/lib/books";
import { createClient } from "@/lib/supabase-server";
import AnalysisClient from "@/components/AnalysisClient";

export const dynamic = "force-dynamic";

export default async function AnalysisPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  const books = user ? await getBooks(user.id) : [];
  return <AnalysisClient books={books} />;
}
