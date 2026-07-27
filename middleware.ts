import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getSession() はクッキーからセッションを読み取り（ネットワーク通信なし）、
  // トークン期限切れ時のみ自動更新する。getUser() は毎回サーバー検証で約0.5秒かかるため、
  // リダイレクト判定にはクッキー読み取りで十分（各データアクセスは Supabase 側で
  // JWT検証＋RLS により保護されるため、ここでの判定をクッキー基準にしても安全）。
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  // 未ログインなら /login へリダイレクト
  if (!user && !request.nextUrl.pathname.startsWith("/login") && !request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ログイン済みなら /login へのアクセスを / へリダイレクト
  if (user && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Service Worker関連(sw.js/workbox-*/swe-worker-*)は認証の対象外にする。
    // これを認証リダイレクトするとSWの更新取得が失敗し、端末に新コードが降りてこない。
    "/((?!_next/static|_next/image|favicon|icon|apple-touch|manifest|sw\\.js|workbox-|swe-worker|.*\\.png|.*\\.svg|.*\\.ico|.*\\.js\\.map).*)",
  ],
};
