"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { formatPrice, discountPercent, cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useStore } from "@/providers/StoreProvider";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed, useRecentlyViewed } from "@/components/RecentlyViewed";

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, addToRequest } = useStore();
  const [active, setActive] = useState(0);
  const [boxes, setBoxes] = useState(1);
  const [added, setAdded] = useState(false);

  const fav = isFavorite(product.id);
  const { add: addViewed } = useRecentlyViewed();
  useEffect(() => { addViewed(product.id); }, [product.id, addViewed]);
  const images =
    product.images.length > 0
      ? product.images
      : ["/products/placeholders/wrap.svg"];

  function handleAdd() {
    if (!user) {
      router.push(`/login?redirect=/product/${product.slug}`);
      return;
    }
    addToRequest(product.id, boxes);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="container py-8">
      <nav className="mb-5 flex flex-wrap items-center gap-1 text-xs text-gray-500">
        <Link href="/" className="hover:text-orange-500">Главная</Link>
        <span>›</span>
        <Link href="/catalog" className="hover:text-orange-500">Каталог</Link>
        <span>›</span>
        <span className="text-gray-900">{product.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Галерея */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-200/70 bg-gray-50">
            <Image
              src={images[active]}
              alt={product.title}
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-contain p-6"
              priority
            />
            <div className="absolute left-3 top-3 flex flex-col gap-1">
              {product.isNew && (
                <span className="rounded-full bg-leaf px-2.5 py-1 text-xs font-bold text-white">Новинка</span>
              )}
              {product.isSale && product.salePrice && (
                <span className="rounded-full bg-flameDeep px-2.5 py-1 text-xs font-bold text-white">
                  −{discountPercent(product.basePrice, product.salePrice)}%
                </span>
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActive(i)}
                  className={cn(
                    "relative h-20 w-20 overflow-hidden rounded-2xl border bg-gray-50",
                    active === i ? "border-flame" : "border-gray-200"
                  )}
                >
                  <Image src={img} alt="" fill className="object-contain p-1.5" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Информация */}
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="chip">{product.collection}</span>
            {product.theme.map((t) => (
              <span key={t} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500">
                {t}
              </span>
            ))}
          </div>

          <h1 className="heading mt-4 text-3xl">{product.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            Артикул: <span className="font-semibold text-gray-900">{product.sku}</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            {product.isSale && product.salePrice ? (
              <>
                <span className="font-display text-3xl font-extrabold text-red-500">
                  от {formatPrice(product.salePrice)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.basePrice)}
                </span>
              </>
            ) : (
              <span className="font-display text-3xl font-extrabold text-gray-900">
                от {formatPrice(product.basePrice)}
              </span>
            )}
            <span className="text-sm text-gray-500">за коробку</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Точная цена формируется менеджером с учётом объёма заказа
          </p>

          {user && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 text-sm font-semibold text-leaf">
              <span className="inline-block h-2 w-2 rounded-full bg-leaf" />
              {product.isAvailable ? "Есть на складе" : "Под заказ"}
            </div>
          )}

          {/* Действие */}
          <div className="mt-6 rounded-2xl border border-gray-200/70 bg-white/70 p-4">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Коробок:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setBoxes((b) => Math.max(1, b - 1))}
                      className="h-9 w-9 rounded-full border border-gray-200 bg-paper text-lg font-bold text-red-500"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={boxes}
                      onChange={(e) =>
                        setBoxes(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="h-9 w-16 rounded-xl border border-gray-200 bg-paper text-center text-sm"
                    />
                    <button
                      onClick={() => setBoxes((b) => b + 1)}
                      className="h-9 w-9 rounded-full border border-gray-200 bg-paper text-lg font-bold text-red-500"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    = {boxes * product.pcsPerBox} шт.
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={handleAdd} className="btn-primary flex-1">
                    {added ? "Добавлено ✓" : "Добавить в заявку"}
                  </button>
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-full border-2",
                      fav ? "border-flame text-orange-500" : "border-gray-200 text-gray-500"
                    )}
                    aria-label="В избранное"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                    </svg>
                  </button>
                </div>
                {added && (
                  <Link href="/cart" className="brand-link mt-3 inline-flex text-sm">
                    Перейти к заявке →
                  </Link>
                )}
              </>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Чтобы оформить заявку и узнать оптовые условия, войдите или
                  зарегистрируйтесь.
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <Link
                    href={`/login?redirect=/product/${product.slug}`}
                    className="btn-primary"
                  >
                    Войти
                  </Link>
                  <Link href="/register" className="btn-ghost">
                    Регистрация
                  </Link>
                </div>
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="brand-link mt-3 text-sm"
                >
                  {fav ? "В избранном ✓" : "Добавить в избранное"}
                </button>
              </div>
            )}
          </div>

          {/* Характеристики */}
          <div className="mt-6">
            <h3 className="font-display text-lg font-bold text-gray-900">Характеристики</h3>
            <dl className="mt-3 divide-y divide-line/60 rounded-2xl border border-gray-200/70 bg-paper">
              {[
                ["Размер", product.dimensions],
                ["Материал", product.material],
                ["Граммаж", `${product.grammage} г/м²`],
                ["Тип ручки", product.handleType],
                ["В коробке", `${product.pcsPerBox} шт.`],
                ["Цвет", product.color],
                ["Артикул", product.sku],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between px-4 py-2.5 text-sm">
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="font-semibold text-gray-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="heading text-2xl">С этим смотрят</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
