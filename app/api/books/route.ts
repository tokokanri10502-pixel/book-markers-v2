import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { data, error } = await supabase
      .from("books")
      .insert({
        title: body.title,
        author: body.author,
        publisher: body.publisher,
        genre: body.genre,
        isbn: body.isbn,
        description: body.description,
        cover_url: body.cover_url || "",
        status: body.status,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Books POST error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
