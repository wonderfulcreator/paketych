export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionCookie, getSessionUser } from "@/lib/auth";
import { sendOrderNotification } from "@/lib/email";

// GET /api/orders — список заказов текущего пользователя
export async function GET() {
  try {
    const sessionId = getSessionCookie();
    if (!sessionId) return NextResponse.json({ ok: false }, { status: 401 });

    const user = await getSessionUser(sessionId);
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const orders = await query<{
      id: number;
      order_id: string;
      status: string;
      comment: string;
      discount_pct: number;
      total_base: number;
      total_final: number;
      created_at: string;
    }>(
      `SELECT id, order_id, status, comment, discount_pct, total_base, total_final, created_at
       FROM orders WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user.id]
    );

    // Подгружаем позиции для каждого заказа
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await query(
          `SELECT product_id, sku, title, boxes, pcs_per_box, base_price, effective_price
           FROM order_items WHERE order_id = $1`,
          [order.id]
        );
        return { ...order, items };
      })
    );

    return NextResponse.json({ ok: true, orders: ordersWithItems });
  } catch (err) {
    console.error("[orders GET]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// POST /api/orders — создать заказ
export async function POST(req: NextRequest) {
  try {
    const sessionId = getSessionCookie();
    if (!sessionId) return NextResponse.json({ ok: false }, { status: 401 });

    const user = await getSessionUser(sessionId);
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const body = await req.json();
    const { orderId, comment, discountPct, items, totalBase, totalFinal } = body;

    if (!orderId || !items?.length) {
      return NextResponse.json(
        { ok: false, error: "Некорректные данные заказа" },
        { status: 400 }
      );
    }

    // Создаём заказ
    const orderRows = await query<{ id: number }>(
      `INSERT INTO orders (order_id, user_id, comment, discount_pct, total_base, total_final)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [orderId, user.id, comment ?? "", discountPct ?? 0, totalBase ?? 0, totalFinal ?? 0]
    );

    const dbOrderId = orderRows[0].id;

    // Создаём позиции заказа
    for (const item of items) {
      await query(
        `INSERT INTO order_items
           (order_id, product_id, sku, title, boxes, pcs_per_box, base_price, effective_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          dbOrderId,
          item.productId,
          item.sku,
          item.title,
          item.boxes,
          item.pcsPerBox ?? 200,
          item.basePrice,
          item.effectivePrice ?? item.basePrice,
        ]
      );
    }

    // Отправляем в 1С если настроен
    const onecUrl = process.env.ONEC_API_URL;
    if (onecUrl) {
      try {
        await fetch(`${onecUrl}/hs/site/v1/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(process.env.ONEC_API_TOKEN
              ? { Authorization: `Bearer ${process.env.ONEC_API_TOKEN}` }
              : {}),
          },
          body: JSON.stringify({
            orderId,
            createdAt: new Date().toISOString(),
            source: "website",
            discountPct,
            client: {
              name: user.name,
              company: user.company,
              email: user.email,
              phone: user.phone,
            },
            items,
            comment,
          }),
        });
      } catch (e) {
        console.warn("[orders] 1C send failed:", e);
        // Не прерываем — заказ сохранён в БД
      }
    }

    // Отправляем email-уведомление менеджеру
    await sendOrderNotification({
      orderId,
      client: { name: user.name, company: user.company, email: user.email, phone: user.phone },
      items: items.map((item: { title: string; sku: string; boxes: number; pcsPerBox?: number; basePrice: number; effectivePrice?: number }) => ({
        title: item.title,
        sku: item.sku,
        boxes: item.boxes,
        pcsPerBox: item.pcsPerBox ?? 200,
        basePrice: item.basePrice,
        effectivePrice: item.effectivePrice ?? item.basePrice,
      })),
      comment,
      discountPct: discountPct ?? 0,
      totalBase: totalBase ?? 0,
      totalFinal: totalFinal ?? 0,
    });

    return NextResponse.json({ ok: true, orderId });
  } catch (err) {
    console.error("[orders POST]", err);
    return NextResponse.json({ ok: false, error: "Ошибка сервера" }, { status: 500 });
  }
}
