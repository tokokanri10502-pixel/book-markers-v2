import { Book, BookStatus } from './types';
import { dbSelect, dbInsert, dbUpdate, dbDelete, dbCount } from './supabase';

export async function getBooks(userId: string): Promise<Book[]> {
  return dbSelect<Book>('books', {
    user_id: `eq.${userId}`,
    order: 'created_at.desc',
  });
}

export async function getBook(id: string, userId: string): Promise<Book | null> {
  const rows = await dbSelect<Book>('books', {
    id: `eq.${id}`,
    user_id: `eq.${userId}`,
  });
  return rows[0] ?? null;
}

export async function insertBook(
  userId: string,
  bookData: {
    title: string;
    author: string;
    publisher?: string;
    genre?: string;
    isbn?: string;
    description?: string;
    cover_url: string;
    status: BookStatus;
  }
): Promise<Book> {
  return dbInsert<Book>('books', {
    ...bookData,
    user_id: userId,
    updated_at: new Date().toISOString(),
  });
}

export async function updateBook(
  id: string,
  userId: string,
  updates: { status?: BookStatus; review?: string; rating?: number }
): Promise<void> {
  return dbUpdate(
    'books',
    { ...updates, updated_at: new Date().toISOString() },
    { id, user_id: userId }
  );
}

export async function deleteBook(id: string, userId: string): Promise<void> {
  return dbDelete('books', { id, user_id: userId });
}

export async function getBooksCount(userId: string): Promise<number> {
  return dbCount('books', { user_id: userId });
}
