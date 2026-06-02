"use client";

import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import { useStore } from "@/providers/StoreProvider";
import { ProductCard } from "@/components/ProductCard";

const allProducts = getAllProducts();

export default function FavoritesPage() {
  const { favorites, ready } = useStore();
  if (!ready) return <div className="container py-12 text-gray-500">Загрузка…</div>;

  const items = allProducts.filter((p) => favorites.includes(p.id));

  return (
    <div className="container py-8">
      <h1 className="heading text-3xl">Избранное</h1>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 mt-6 p-10 text-center text-gray-500">
          В избранном пока пусто.{" "}
          <Link href="/catalog" className="brand-link">Выбрать товары</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
