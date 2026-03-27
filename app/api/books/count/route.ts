import { NextResponse } from "next/server";
import { getBooksCount } from "@/lib/books";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ count: 0 });

    const count = await getBooksCount(user.id);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
