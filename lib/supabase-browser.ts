import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// セッションユーザーを返す。未ログインなら /login へ遷移して null を返す。
// オフライン時はトークン更新の失敗でセッションが取れないだけの場合があるため、
// 遷移せずその場に留まる（キャッシュ表示を維持する）。
export async function requireSessionUser(supabase: SupabaseClient): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user && (typeof navigator === "undefined" || navigator.onLine !== false)) {
    window.location.replace("/login");
  }
  return user;
}
