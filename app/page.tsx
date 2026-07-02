import BookListHome from "@/components/BookListHome";

// データ取得はクライアント側（useBooks: キャッシュ即表示→裏で最新化）に移したため、
// このページは静的に配信され、DB応答を待たずに即座に描画が始まる。
export default function Dashboard() {
  return <BookListHome />;
}
