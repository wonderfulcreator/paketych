"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { getAllProducts } from "@/lib/products";
import { useStore } from "@/providers/StoreProvider";

const allProducts = getAllProducts();

function SharedCartInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { addToRequest } = useStore();
  const [imported, setImported] = useState(false);

  const itemsParam = sp.get("items") || "";
  const parsed = itemsParam.split(",").filter(Boolean).map(pair => {
    const [productId, boxesStr] = pair.split(":");
    const product = allProducts.find(p => p.id === productId);
    return product ? { product, boxes: parseInt(boxesStr) || 1 } : null;
  }).filter(Boolean) as { product: typeof allProducts[number]; boxes: number }[];

  function importToCart() {
    for (const { product, boxes } of parsed) {
      addToRequest(product.id, boxes);
    }
    setImported(true);
    setTimeout(() => router.push("/cart"), 1200);
  }

  if (parsed.length === 0) {
    return (
      <div className="container py-16 text-center text-gray-400">
        Ссылка повреждена или корзина пуста.
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="font-display text-2xl font-extrabold text-gray-900">Вам поделились корзиной</h1>
      <p className="mt-2 text-sm text-gray-500">{parsed.length} позиций — добавить их в вашу корзину?</p>

      <div className="mt-6 space-y-2">
        {parsed.map(({ product, boxes }) => (
          <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-50">
              <Image src={product.images[0] || "/products/placeholders/wrap.svg"} alt={product.title} fill className="object-contain p-1" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="line-clamp-1 text-sm font-semibold text-gray-900">{product.title}</div>
              <div className="text-xs text-gray-400">{boxes} кор.</div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={importToCart}
        className="mt-6 w-full rounded-xl bg-orange-500 py-3 font-bold text-white transition hover:bg-orange-600">
        {imported ? "Добавлено ✓" : "Добавить в мою корзину"}
      </button>
    </div>
  );
}

export default function SharedCartPage() {
  return (
    <Suspense fallback={<div className="container py-16 text-gray-400">Загрузка…</div>}>
      <SharedCartInner />
    </Suspense>
  );
}
