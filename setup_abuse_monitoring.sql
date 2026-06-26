-- =============================================
-- book-markers-v2 悪用モニタリング用テーブル
-- 目的: Gemini課金につながるスキャン利用を記録・可視化し、
--       使いすぎ検知と緊急停止スイッチを実現する。
-- 既存の books テーブルには一切触れない（新規テーブルの追加のみ）。
-- 実行: Supabase ダッシュボード > SQL Editor に貼って Run
-- =============================================

-- ① スキャン記録テーブル（1スキャン＝1行。コストの可視化用）
create table if not exists public.scan_logs (
  id         uuid default gen_random_uuid() primary key,
  user_id    text not null,
  email      text,
  created_at timestamptz default now()
);
create index if not exists scan_logs_user_created_idx
  on public.scan_logs (user_id, created_at desc);

alter table public.scan_logs enable row level security;

-- 自分の分だけ記録・閲覧できる（他人のログは見えない）
drop policy if exists scan_logs_insert_own on public.scan_logs;
create policy scan_logs_insert_own on public.scan_logs
  for insert to authenticated
  with check (user_id = auth.uid()::text);

drop policy if exists scan_logs_select_own on public.scan_logs;
create policy scan_logs_select_own on public.scan_logs
  for select to authenticated
  using (user_id = auth.uid()::text);

-- ② 緊急停止スイッチ（本アプリ専用の設定テーブル・1行のみ）
create table if not exists public.book_app_settings (
  id           int primary key default 1,
  scan_enabled boolean not null default true,
  constraint single_row check (id = 1)
);
insert into public.book_app_settings (id, scan_enabled)
  values (1, true)
  on conflict (id) do nothing;

alter table public.book_app_settings enable row level security;

-- 読み取りは許可（アプリが停止フラグを確認するため）。書き込みポリシーは作らない
-- ＝フロントからは変更できず、停止/再開はこのダッシュボード(SQL/Table Editor)からのみ。
drop policy if exists book_app_settings_read on public.book_app_settings;
create policy book_app_settings_read on public.book_app_settings
  for select to authenticated, anon
  using (true);

-- =============================================
-- 【緊急停止のしかた】スキャンを今すぐ全停止したいとき:
--   update public.book_app_settings set scan_enabled = false where id = 1;
-- 【再開】:
--   update public.book_app_settings set scan_enabled = true  where id = 1;
-- =============================================
