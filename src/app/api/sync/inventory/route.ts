import { NextRequest } from "next/server";
import { verifyToken, unauthorized } from "@/lib/api-auth";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// POST /api/sync/inventory
// Вызывается из 1С для обновления остатков и цен
// Body: { items: [{ sku, isAvailable, basePrice, salePrice? }], syncedAt }

type SyncItem = {
  sku: string;
  isAvailable: boolean;
  basePrice: number;
  salePrice?: number | null;
};

type SyncBody = {
  items: SyncItem[];
  syncedAt?: string;
};

export async function POST(request: NextRequest) {
  if (!verifyToken(request)) return unauthorized();

  let body: SyncBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(body.items)) {
    return new Response(JSON.stringify({ error: "items must be an array" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  // Читаем текущий каталог
  const dataPath = join(process.cwd(), "src/data/products.json");
  const products = JSON.parse(readFileSync(dataPath, "utf-8"));

  let updated = 0;
  let notFound = 0;

  // Строим индекс по SKU для быстрого поиска
  const skuIndex: Record<string, number> = {};
  products.forEach((p: { sku: string }, i: number) => {
    skuIndex[p.sku.trim()] = i;
  });

  for (const item of body.items) {
    const sku = item.sku?.trim();
    if (!sku) continue;

    const idx = skuIndex[sku];
    if (idx === undefined) {
      notFound++;
      continue;
    }

    products[idx].isAvailable = item.isAvailable;
    if (typeof item.basePrice === "number" && item.basePrice > 0) {
      products[idx].basePrice = item.basePrice;
    }
    if (item.salePrice !== undefined) {
      products[idx].salePrice = item.salePrice ?? null;
      products[idx].isSale = item.salePrice != null && item.salePrice < item.basePrice;
    }
    updated++;
  }

  // Сохраняем обновлённый каталог
  writeFileSync(dataPath, JSON.stringify(products, null, 2));

  return new Response(
    JSON.stringify({
      ok: true,
      updated,
      notFound,
      errors: 0,
      syncedAt: body.syncedAt ?? new Date().toISOString(),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
