"use client";

import { RefreshCcw } from "lucide-react";

// 通信エラー時の表示。空の本棚（データ消失に見える）や
// 「見つかりません」（削除に見える）とは必ず区別して使う。
export default function LoadError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-8 text-center">
      <p className="text-slate-300 font-serif font-bold text-lg">読み込みに失敗しました</p>
      <p className="text-slate-500 text-sm leading-relaxed">
        通信環境をご確認のうえ、再読み込みしてください。
        <br />
        本のデータは消えていません。
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn-primary px-6 py-3 flex items-center gap-2"
      >
        <RefreshCcw size={16} /> 再読み込み
      </button>
    </div>
  );
}
