"use client";

import { useEffect, useState } from "react";
import { getAllProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

const allProducts = getAllProducts();
const KEY = "pp_recently_viewed";
const MAX = 8;

export function useRecentlyViewed() {
  function add(id: string) {
    try {
      const prev: string[] = JSON.parse(localStorage.getItem(KEY) || "[]");
      const next = [id, ...prev.filter(x => x !== id)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }
  function get(): string[] {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  }
  return { add, get };
}

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem(KEY) || "[]");
      setIds(stored.filter(id => id !== excludeId).slice(0, 4));
    } catch {}
  }, [excludeId]);

  const products = ids.map(id => allProducts.find(p => p.id === id)).filter(Boolean) as typeof allProducts;
  if (!products.length) return null;

  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-extrabold text-gray-900">Вы смотрели</h2>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
