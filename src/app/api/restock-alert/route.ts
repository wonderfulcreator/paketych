export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionCookie, getSessionUser } from "@/lib/auth";

// POST /api/restock-alert  { productId, sku }
// Подписка на уведомление когда товар появится в наличии
export async function POST(req: NextRequest) {
  try {
    const sessionId = getSessionCookie();
    if (!sessionId) return NextResponse.json({ ok: false }, { status: 401 });

    const user = await getSessionUser(sessionId);
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const { productId, sku } = await req.json();
    if (!productId) return NextResponse.json({ ok: false }, { status: 400 });

    await query(
      `INSERT INTO restock_alerts (user_id, product_id, sku)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [user.id, productId, sku ?? ""]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[restock-alert POST]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// GET /api/restock-alert — список подписок текущего пользователя
export async function GET() {
  try {
    const sessionId = getSessionCookie();
    if (!sessionId) return NextResponse.json({ ok: true, alerts: [] });

    const user = await getSessionUser(sessionId);
    if (!user) return NextResponse.json({ ok: true, alerts: [] });

    const rows = await query<{ product_id: string }>(
      `SELECT product_id FROM restock_alerts WHERE user_id = $1`,
      [user.id]
    );

    return NextResponse.json({ ok: true, alerts: rows.map(r => r.product_id) });
  } catch (err) {
    console.error("[restock-alert GET]", err);
    return NextResponse.json({ ok: false, alerts: [] }, { status: 500 });
  }
}
