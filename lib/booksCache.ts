import { Book } from "./types";

// 本一覧のlocalStorageキャッシュ（stale-while-revalidate用）。
// ホーム・分析・詳細・スキャンの全画面がこのキャッシュを共有し、
// 追加・更新・削除時はここを直接書き換えることでフルリロード不要にする。
// 全操作フェイルセーフ: ストレージが使えなくても例外を出さず null / no-op になる。

const LAST_USER_KEY = "bm2-last-user";
const cacheKey = (userId: string) => `bm2-books-${userId}`;

export function getLastUserId(): string | null {
  try {
    return localStorage.getItem(LAST_USER_KEY);
  } catch {
    return null;
  }
}

export function setLastUserId(userId: string): void {
  try {
    localStorage.setItem(LAST_USER_KEY, userId);
  } catch {}
}

export function readBooksCache(userId: string): Book[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Book[]) : null;
  } catch {
    return null;
  }
}

export function writeBooksCache(userId: string, books: Book[]): void {
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(books));
  } catch {}
}

// 1冊をキャッシュへ反映（既存なら置き換え、新規なら追加して新着順を維持）
export function upsertBookInCache(userId: string, book: Book): void {
  const books = readBooksCache(userId);
  if (!books) return;
  const next = [book, ...books.filter((b) => b.id !== book.id)].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  writeBooksCache(userId, next);
}

export function patchBookInCache(userId: string, id: string, updates: Partial<Book>): void {
  const books = readBooksCache(userId);
  if (!books) return;
  writeBooksCache(
    userId,
    books.map((b) => (b.id === id ? { ...b, ...updates } : b))
  );
}

export function removeBookFromCache(userId: string, id: string): void {
  const books = readBooksCache(userId);
  if (!books) return;
  writeBooksCache(
    userId,
    books.filter((b) => b.id !== id)
  );
}
