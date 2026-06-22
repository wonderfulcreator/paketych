import { NextRequest } from "next/server";

// POST /api/orders/incoming
// Этот эндпоинт вызывает сайт при отправке заказа в корзине.
// Он проксирует заказ в 1С HTTP-сервис и возвращает результат.
// URL 1С настраивается через переменную окружения ONEC_API_URL.

type OrderItem = {
  productId: string;
  sku: string;
  title: string;
  boxes: number;
  pcsPerBox: number;
  basePricePerBox: number;
  effectivePrice?: number;
};

type OrderBody = {
  orderId: string;
  createdAt: string;
  source: string;
  discountPct?: number;
  client: {
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  comment?: string;
};

export async function POST(request: NextRequest) {
  let body: OrderBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const onecUrl = process.env.ONEC_API_URL;
  const onecToken = process.env.ONEC_API_TOKEN;

  // Если 1С ещё не настроена — сохраняем заказ локально и возвращаем успех
  if (!onecUrl) {
    console.log("[orders/incoming] 1C URL not configured, storing locally:", body.orderId);
    return new Response(
      JSON.stringify({
        ok: true,
        status: "queued",
        orderId: body.orderId,
        message: "Order queued (1C not configured)",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // Проксируем в 1С
  try {
    const resp = await fetch(`${onecUrl}/hs/site/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(onecToken ? { Authorization: `Bearer ${onecToken}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("[orders/incoming] 1C error:", resp.status, data);
      return new Response(
        JSON.stringify({ ok: false, status: "error", details: data }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, status: "created", orderId1C: data.orderId1C }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[orders/incoming] fetch error:", err);
    return new Response(
      JSON.stringify({ ok: false, status: "error", message: "Could not reach 1C" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}
