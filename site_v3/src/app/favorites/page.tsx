"use client";

import { getAllProducts } from "@/lib/products";
import { useStore } from "@/providers/StoreProvider";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState, EmptyIcons } from "@/components/EmptyState";

const allProducts = getAllProducts();

export default function FavoritesPage() {
  const { favorites, ready } = useStore();
  if (!ready) return <div className="container py-12 text-gray-500">Загрузка…</div>;

  const items = allProducts.filter((p) => favorites.includes(p.id));

  return (
    <div className="container py-8">
      <h1 className="heading text-3xl">Избранное</h1>
      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={EmptyIcons.heart}
            title="Пока ничего не отложено"
            description="Нажмите на сердечко у понравившегося пакета"
            actionLabel="Смотреть каталог"
            actionHref="/catalog"
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((p, idx) => (
            <ProductCard key={p.id} product={p} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
