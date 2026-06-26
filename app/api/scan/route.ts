import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// base64 文字列の上限: 約 2MB（圧縮後）
const MAX_BASE64_LENGTH = 3 * 1024 * 1024;

// 使いすぎ警告のしきい値（直近24時間/1ユーザー）。環境変数で変更可、既定30回。
const SCAN_ALERT_THRESHOLD = Number(process.env.SCAN_ALERT_THRESHOLD || 30);

// アラートメール送信（Resend）。未設定なら何もしない＝スキャン本体には影響なし。
async function sendAlertEmail(subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL;
  if (!key || !to) return; // 未設定時はスキップ（フェイルセーフ）
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "BOOK MEMORIES Alert <onboarding@resend.dev>",
        to: [to],
        subject,
        text,
      }),
    });
  } catch (e) {
    console.error("Alert email failed:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    // 認証チェック
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const userEmail = session.user.email ?? "unknown";

    // 緊急停止スイッチの確認（テーブル未作成/エラー時は既定で「許可」＝既存挙動を壊さない）
    try {
      const { data: settings } = await supabase
        .from("book_app_settings")
        .select("scan_enabled")
        .eq("id", 1)
        .single();
      if (settings && settings.scan_enabled === false) {
        return NextResponse.json(
          { error: "スキャン機能は現在一時停止中です。しばらくお待ちください。" },
          { status: 503 }
        );
      }
    } catch {
      /* 設定テーブルが無い/読めない場合はスキャンを継続 */
    }

    const { image } = await req.json(); // base64 data URL

    if (!image) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }

    // 画像サイズ制限
    if (image.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        { error: "Image too large" },
        { status: 413 }
      );
    }

    // Extract base64 part and mimeType from data URL
    const [header, base64Data] = image.split(",");
    if (!base64Data) {
      return NextResponse.json(
        { error: "Invalid image data format" },
        { status: 400 }
      );
    }

    const mimeTypeMatch = header.match(/data:([^;]+);/);
    const mimeType = (mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg") as
      | "image/jpeg"
      | "image/png"
      | "image/webp"
      | "image/heic";

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        // @ts-ignore — thinkingConfig は型定義に未反映だが有効なオプション
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const prompt = `この画像は本の表紙です。画像に写っている文字を注意深く読み取り、以下のJSON形式で情報を抽出してください。

必ず以下のJSON形式のみで応答してください:
{
  "title": "本のタイトル（表紙に書かれている通りに）",
  "author": "著者名（表紙に書かれている通りに）",
  "publisher": "出版社名（読み取れた場合）",
  "genre": "ジャンルの推測（小説、ビジネス、技術書、漫画、自己啓発など）",
  "summary": "この本の簡単な説明（50文字程度）"
}

注意:
- 表紙に書かれている文字をそのまま正確に読み取ってください
- 読み取れない項目は空文字列 "" にしてください
- 日本語の本は日本語で、英語の本は英語で回答してください`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse JSON — responseMimeType should give clean JSON,
    // but add fallback cleanup just in case
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const jsonStr = text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      data = JSON.parse(jsonStr);
    }

    // Fetch cover image URL from Google Books API
    let coverUrl = ""; // base64は保存しない
    if (data.title) {
      try {
        const query = [
          data.title ? `intitle:${data.title}` : "",
          data.author ? `inauthor:${data.author}` : "",
        ]
          .filter(Boolean)
          .join("+");

        const booksRes = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1&langRestrict=ja`
        );
        const booksData = await booksRes.json();

        if (booksData.items && booksData.items[0]) {
          const item = booksData.items[0].volumeInfo;
          data.description = item.description || data.summary;
          coverUrl =
            item.imageLinks?.thumbnail?.replace("http:", "https:") || coverUrl;
          data.isbn = item.industryIdentifiers?.[0]?.identifier || "";
        }
      } catch (e) {
        console.error("Google Books API error:", e);
      }
    }

    // --- スキャン記録 & 使いすぎ/新規利用の通知（best-effort。失敗してもスキャン結果は返す） ---
    try {
      await supabase.from("scan_logs").insert({ user_id: userId, email: userEmail });

      // 全期間の合計（初回スキャン検知用）
      const { count: totalCount } = await supabase
        .from("scan_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      // 直近24時間の回数（使いすぎ検知用）
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: dayCount } = await supabase
        .from("scan_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", since);

      if (totalCount === 1) {
        // すでに本を登録済み＝既存利用者は除外し、本当に新しい人だけ通知
        const { count: bookCount } = await supabase
          .from("books")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId);
        if (!bookCount) {
          await sendAlertEmail(
            "🆕 BOOK MEMORIES: 新しい利用者",
            `新しい利用者が初めてスキャンを使いました。\n\nメール: ${userEmail}\nユーザーID: ${userId}`
          );
        }
      }

      // しきい値をちょうど超えた瞬間に1通だけ（以降その日は再送しない）
      if (dayCount === SCAN_ALERT_THRESHOLD) {
        await sendAlertEmail(
          "⚠️ BOOK MEMORIES: 使いすぎ警告",
          `直近24時間で ${SCAN_ALERT_THRESHOLD} 回スキャンした利用者がいます。\n\n` +
            `メール: ${userEmail}\nユーザーID: ${userId}\n\n` +
            `心当たりが無ければ、SupabaseダッシュボードでこのユーザーをBANするか、\n` +
            `book_app_settings の scan_enabled を false にしてスキャンを全停止できます。`
        );
      }
    } catch (e) {
      console.error("scan logging/alert error:", e);
    }

    return NextResponse.json({ ...data, cover_url: coverUrl });
  } catch (error: any) {
    console.error("Gemini Scan Error:", error?.message || error);
    return NextResponse.json(
      { error: "スキャンに失敗しました" },
      { status: 500 }
    );
  }
}
