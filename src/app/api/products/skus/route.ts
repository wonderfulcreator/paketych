import { NextRequest } from "next/server";
import { verifyToken, unauthorized } from "@/lib/api-auth";
import products from "@/data/products.json";

// GET /api/products/skus
// Возвращает список всех SKU сайта для сверки с 1С
// Вызывается один раз при первичной настройке интеграции

export async function GET(request: NextRequest) {
  if (!verifyToken(request)) return unauthorized();

  const skus = (products as { sku: string; title: string; isAvailable: boolean; basePrice: number }[]).map(
    (p) => ({
      sku: p.sku,
      title: p.title,
      isAvailable: p.isAvailable,
      basePrice: p.basePrice,
    })
  );

  return new Response(
    JSON.stringify({ ok: true, count: skus.length, skus }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
