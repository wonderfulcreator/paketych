export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionCookie, getSessionUser } from "@/lib/auth";

// GET /api/documents — все документы по заказам компании текущего пользователя
export async function GET() {
  try {
    const sessionId = getSessionCookie();
    if (!sessionId) return NextResponse.json({ ok: false }, { status: 401 });

    const user = await getSessionUser(sessionId);
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    // Документы по всем заказам всех пользователей компании (не только своим)
    const documents = await query<{
      id: number; type: string; title: string; file_url: string; created_at: string;
      order_id: string; order_created_at: string;
    }>(
      `SELECT d.id, d.type, d.title, d.file_url, d.created_at,
              o.order_id, o.created_at AS order_created_at
       FROM order_documents d
       JOIN orders o ON o.id = d.order_id
       JOIN users u ON u.id = o.user_id
       WHERE u.company_id = $1
       ORDER BY d.created_at DESC`,
      [user.company_id]
    );

    // Плюс — КП доступны для каждого заказа автоматически (генерируются on-the-fly)
    const orders = await query<{ order_id: string; created_at: string; total_final: string }>(
      `SELECT o.order_id, o.created_at, o.total_final
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE u.company_id = $1
       ORDER BY o.created_at DESC`,
      [user.company_id]
    );

    return NextResponse.json({ ok: true, documents, orders });
  } catch (err) {
    console.error("[documents GET]", err);
    return NextResponse.json({ ok: false, documents: [], orders: [] }, { status: 500 });
  }
}
