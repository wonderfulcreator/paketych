"use client";

import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import { useStore } from "@/providers/StoreProvider";
import { ProductCard } from "@/components/ProductCard";

const allProducts = getAllProducts();

export default function FavoritesPage() {
  const { favorites, ready } = useStore();
  if (!ready) return <div className="container py-12 text-inkSoft">Загрузка…</div>;

  const items = allProducts.filter((p) => favorites.includes(p.id));

  return (
    <div className="container py-8">
      <h1 className="brand-heading text-3xl">Избранное</h1>
      {items.length === 0 ? (
        <div className="paper-card-soft mt-6 p-10 text-center text-inkSoft">
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
