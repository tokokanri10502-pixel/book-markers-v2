import { NextRequest, NextResponse } from "next/server";
import { insertBook } from "@/lib/books";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = await insertBook(user.id, {
      title: body.title,
      author: body.author,
      publisher: body.publisher,
      genre: body.genre,
      isbn: body.isbn,
      description: body.description,
      cover_url: body.cover_url || "",
      status: body.status,
    });
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Books POST error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
