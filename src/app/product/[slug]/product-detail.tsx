"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { formatPrice, discountPercent, cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useStore } from "@/providers/StoreProvider";
import { ProductCard } from "@/components/ProductCard";

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
      <nav className="mb-5 flex flex-wrap items-center gap-1 text-xs text-inkSoft">
        <Link href="/" className="hover:text-flame">Главная</Link>
        <span>›</span>
        <Link href="/catalog" className="hover:text-flame">Каталог</Link>
        <span>›</span>
        <span className="text-ink">{product.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Галерея */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-brand border border-line/70 bg-creamSoft">
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
                    "relative h-20 w-20 overflow-hidden rounded-2xl border bg-creamSoft",
                    active === i ? "border-flame" : "border-line"
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
            <span className="paper-chip">{product.collection}</span>
            {product.theme.map((t) => (
              <span key={t} className="rounded-full border border-line bg-cream px-3 py-1 text-xs text-inkSoft">
                {t}
              </span>
            ))}
          </div>

          <h1 className="brand-heading mt-4 text-3xl">{product.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-inkSoft">
            Артикул: <span className="font-semibold text-ink">{product.sku}</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            {product.isSale && product.salePrice ? (
              <>
                <span className="font-display text-3xl font-extrabold text-flameDeep">
                  от {formatPrice(product.salePrice)}
                </span>
                <span className="text-lg text-inkSoft line-through">
                  {formatPrice(product.basePrice)}
                </span>
              </>
            ) : (
              <span className="font-display text-3xl font-extrabold text-ink">
                от {formatPrice(product.basePrice)}
              </span>
            )}
            <span className="text-sm text-inkSoft">за коробку</span>
          </div>
          <p className="mt-1 text-xs text-inkSoft">
            Точная цена формируется менеджером с учётом объёма заказа
          </p>

          {user && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-creamSoft px-3 py-1.5 text-sm font-semibold text-leaf">
              <span className="inline-block h-2 w-2 rounded-full bg-leaf" />
              {product.isAvailable ? "Есть на складе" : "Под заказ"}
            </div>
          )}

          {/* Действие */}
          <div className="mt-6 rounded-brand border border-line/70 bg-cream/70 p-4">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-inkSoft">Коробок:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setBoxes((b) => Math.max(1, b - 1))}
                      className="h-9 w-9 rounded-full border border-line bg-paper text-lg font-bold text-flameDeep"
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
                      className="h-9 w-16 rounded-xl border border-line bg-paper text-center text-sm"
                    />
                    <button
                      onClick={() => setBoxes((b) => b + 1)}
                      className="h-9 w-9 rounded-full border border-line bg-paper text-lg font-bold text-flameDeep"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-inkSoft">
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
                      fav ? "border-flame text-flame" : "border-line text-inkSoft"
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
                <p className="text-sm text-inkSoft">
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
            <h3 className="font-display text-lg font-bold text-ink">Характеристики</h3>
            <dl className="mt-3 divide-y divide-line/60 rounded-brand border border-line/70 bg-paper">
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
                  <dt className="text-inkSoft">{k}</dt>
                  <dd className="font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* С этим смотрят */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="brand-heading text-2xl">С этим смотрят</h2>
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
