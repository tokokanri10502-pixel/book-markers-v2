import { NextRequest, NextResponse } from "next/server";
import { deleteBook, updateBook } from "@/lib/books";
import { createClient } from "@/lib/supabase-server";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await deleteBook(params.id, user.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Delete error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    await updateBook(params.id, user.id, body);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Update error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
