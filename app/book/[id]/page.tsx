import BookDetailHome from "@/components/BookDetailHome";

// データ取得はクライアント側（キャッシュ即表示→なければDB取得）に移したため、
// タップからの表示にDB応答(0.5〜1.7秒)を待たなくなった。
export default function BookDetailPage({ params }: { params: { id: string } }) {
  return <BookDetailHome id={params.id} />;
}
