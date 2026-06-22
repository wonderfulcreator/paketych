export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionCookie, getSessionUser } from "@/lib/auth";

// GET /api/favorites
export async function GET() {
  try {
    const sessionId = getSessionCookie();
    if (!sessionId) return NextResponse.json({ ok: true, favorites: [] });

    const user = await getSessionUser(sessionId);
    if (!user) return NextResponse.json({ ok: true, favorites: [] });

    const rows = await query<{ product_id: string }>(
      `SELECT product_id FROM favorites WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );

    return NextResponse.json({
      ok: true,
      favorites: rows.map((r) => r.product_id),
    });
  } catch (err) {
    console.error("[favorites GET]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// POST /api/favorites  { productId }
export async function POST(req: NextRequest) {
  try {
    const sessionId = getSessionCookie();
    if (!sessionId) return NextResponse.json({ ok: false }, { status: 401 });

    const user = await getSessionUser(sessionId);
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ ok: false }, { status: 400 });

    await query(
      `INSERT INTO favorites (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [user.id, productId]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[favorites POST]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// DELETE /api/favorites  { productId }
export async function DELETE(req: NextRequest) {
  try {
    const sessionId = getSessionCookie();
    if (!sessionId) return NextResponse.json({ ok: false }, { status: 401 });

    const user = await getSessionUser(sessionId);
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ ok: false }, { status: 400 });

    await query(
      `DELETE FROM favorites WHERE user_id = $1 AND product_id = $2`,
      [user.id, productId]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[favorites DELETE]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
