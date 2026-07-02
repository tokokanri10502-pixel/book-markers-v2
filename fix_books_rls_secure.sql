-- =============================================
-- book-markers-v2 RLSポリシー強化版（推奨）
-- 目的: 「ログイン済みなら全員の本が読める」状態を
--       「自分の本(user_id = 自分の認証ID)だけ読み書きできる」に変更。
--       コピーライター受講者など他ユーザーから蔵書を隠す。
-- 前提: アプリは user_id に Supabase Auth の user.id を入れている。
--       user_id 列は text 型なので auth.uid()(uuid) を text にキャストして比較。
-- 実行: Supabase ダッシュボード > SQL Editor に貼って Run
--       （先に入れた books_allow_anon_all は drop して置き換える）
-- =============================================

-- 復旧用の「全員許可」ポリシーを撤去
drop policy if exists "books_allow_anon_all" on public.books;

-- 自分の本だけ全操作可（owner限定）
drop policy if exists "books_owner_only" on public.books;
create policy "books_owner_only" on public.books
  for all
  to authenticated
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

-- 確認用: ログインした状態のアプリからは自分の本だけ見える。
-- 直接 anon キーで叩くと 0 件（＝他人に漏れない）になるのが正常。
