-- =============================================
-- book-markers-v2 復旧用SQL
-- 症状: コピーライターアプリ作成時にSupabaseでRLSを有効化したため、
--       booksテーブルがanonキーから読めなくなり「本が0件表示」になった。
-- 対処: booksテーブルにanon/authenticatedからの全操作を許可するポリシーを追加。
--       （このアプリは単一ユーザーのデモ運用で、フロントからanonキーで
--         直接アクセスする設計のため、これが本来の挙動）
-- 実行: Supabase ダッシュボード > SQL Editor にこの内容を貼って Run
-- =============================================

-- RLSは有効のまま、anon/authenticated に全操作を許可するポリシーを作成
drop policy if exists "books_allow_anon_all" on public.books;
create policy "books_allow_anon_all" on public.books
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 確認用: 件数が返ればデータは生きている
-- select count(*) from public.books;
