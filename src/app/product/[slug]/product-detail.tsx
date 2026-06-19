"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { formatPrice, discountPercent, cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useStore } from "@/providers/StoreProvider";
import { useToast } from "@/providers/ToastProvider";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed, useRecentlyViewed } from "@/components/RecentlyViewed";
import { Lightbox } from "@/components/Lightbox";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { SizeComparison } from "@/components/SizeComparison";
import { EcoBadge, isEcoProduct } from "@/components/EcoBadge";
import { GlossyShine, isGlossyMaterial } from "@/components/GlossyShine";

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, addToRequest, request, setBoxes } = useStore();
  const { showToast } = useToast();
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [added, setAdded] = useState(false);
  const [restockSubscribed, setRestockSubscribed] = useState(false);
  const { add: addViewed } = useRecentlyViewed();

  useEffect(() => {
    if (!user) return;
    fetch("/api/restock-alert", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data.ok && data.alerts?.includes(product.id)) setRestockSubscribed(true);
      })
      .catch(() => {});
  }, [user, product.id]);

  async function subscribeRestock() {
    if (!user) { router.push(`/login?redirect=/product/${product.slug}`); return; }
    try {
      await fetch("/api/restock-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product.id, sku: product.sku }),
      });
      setRestockSubscribed(true);
      showToast("Сообщим о поступлении на email", "");
    } catch {}
  }

  const fav = isFavorite(product.id);
  const existing = request.find(r => r.productId === product.id);
  const boxes = existing?.boxes ?? 1;
  const images = product.images.length > 0 ? product.images : ["/products/placeholders/wrap.svg"];

  useEffect(() => { addViewed(product.id); }, [product.id, addViewed]);

  function handleAdd() {
    if (!user) { router.push(`/login?redirect=/product/${product.slug}`); return; }
    if (!existing) addToRequest(product.id, boxes);
    else setBoxes(product.id, boxes);
    setAdded(true);
    showToast(product.title, images[0]);
    setTimeout(() => setAdded(false), 2500);
  }

  function prevPhoto() { setActive(i => (i - 1 + images.length) % images.length); }
  function nextPhoto() { setActive(i => (i + 1) % images.length); }

  return (
    <div className="container py-8">
      <ScrollProgressBar />
      {lightbox && (
        <Lightbox
          images={images} current={active}
          onClose={() => setLightbox(false)}
          onPrev={prevPhoto} onNext={nextPhoto}
          alt={product.title}
        />
      )}

      {/* Хлебные крошки */}
      <nav className="mb-5 flex flex-wrap items-center gap-1 text-xs text-gray-400">
        <Link href="/" className="hover:text-orange-500">Главная</Link>
        <span>›</span>
        <Link href="/catalog" className="hover:text-orange-500">Каталог</Link>
        <span>›</span>
        <span className="text-gray-900">{product.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Галерея */}
        <div>
          {/* Главное фото — кликабельно */}
          <div
            className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-gray-100 bg-gray-50"
            onClick={() => setLightbox(true)}
          >
            {isGlossyMaterial(product.material) ? (
              <GlossyShine className="absolute inset-0">
                <Image
                  src={images[active]} alt={product.title} fill
                  sizes="(max-width:1024px) 100vw, 50vw"
                  className="object-contain p-6 transition duration-500 group-hover:scale-105"
                  priority
                />
              </GlossyShine>
            ) : (
              <Image
                src={images[active]} alt={product.title} fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-contain p-6 transition duration-500 group-hover:scale-105"
                priority
              />
            )}
            {/* Иконка лупы */}
            <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-400 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>
              </svg>
            </div>
            {/* Бейджи */}
            <div className="absolute left-3 top-3 flex flex-col gap-1">
              {product.isNew && <span className="rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold text-white">Новинка</span>}
              {product.isSale && product.salePrice && (
                <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                  −{discountPercent(product.basePrice, product.salePrice)}%
                </span>
              )}
            </div>
          </div>

          {/* Миниатюры */}
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button key={img} onClick={() => setActive(i)}
                  className={cn("relative h-20 w-20 overflow-hidden rounded-xl border-2 bg-gray-50 transition",
                    active === i ? "border-orange-500" : "border-transparent hover:border-gray-200")}>
                  <Image src={img} alt="" fill className="object-contain p-1.5" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Информация */}
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-600">
              {product.collection}
            </span>
            {product.theme.map(t => (
              <span key={t} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500">{t}</span>
            ))}
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold text-gray-900">{product.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
            Артикул: <span className="font-semibold text-gray-700">{product.sku}</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            {product.isSale && product.salePrice ? (
              <>
                <span className="font-display text-3xl font-extrabold text-red-500">
                  от {formatPrice(product.salePrice)}
                </span>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.basePrice)}</span>
              </>
            ) : (
              <span className="font-display text-3xl font-extrabold text-gray-900">
                от {formatPrice(product.basePrice)}
              </span>
            )}
            <span className="text-sm text-gray-400">за коробку</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">Точная цена формируется менеджером с учётом объёма заказа</p>

          {user && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
                product.isAvailable ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400")}>
                <span className={cn("h-2 w-2 rounded-full", product.isAvailable ? "bg-green-500" : "bg-gray-300")} />
                {product.isAvailable ? "Есть на складе" : "Под заказ"}
              </div>
              {!product.isAvailable && (
                <button onClick={subscribeRestock} disabled={restockSubscribed}
                  className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition",
                    restockSubscribed
                      ? "bg-orange-50 text-orange-600 cursor-default"
                      : "border border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500")}>
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 5a2 2 0 1 1 4 0c3.07.6 5 3.18 5 6.32V14l1.5 2.5h-17L5 14v-2.68C5 8.18 6.93 5.6 10 5Z"/>
                    <path d="M9 19a3 3 0 0 0 6 0"/>
                  </svg>
                  {restockSubscribed ? "Сообщим о поступлении ✓" : "Сообщить о поступлении"}
                </button>
              )}
              {isEcoProduct(product.material) && <EcoBadge />}
            </div>
          )}

          {/* Действие */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Коробок:</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => existing && setBoxes(product.id, Math.max(1, boxes - 1))}
                      className="h-9 w-9 rounded-full border border-gray-200 bg-white text-lg font-bold text-orange-600 transition hover:border-orange-300">−</button>
                    <input type="number" min={1} value={boxes}
                      onChange={e => existing && setBoxes(product.id, Math.max(1, parseInt(e.target.value) || 1))}
                      className="h-9 w-16 rounded-xl border border-gray-200 bg-white text-center text-sm outline-none focus:border-orange-400" />
                    <button onClick={() => existing && setBoxes(product.id, boxes + 1)}
                      className="h-9 w-9 rounded-full border border-gray-200 bg-white text-lg font-bold text-orange-600 transition hover:border-orange-300">+</button>
                  </div>
                  <span className="text-xs text-gray-400">= {boxes * product.pcsPerBox} шт.</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={handleAdd}
                    className="flex-1 rounded-xl bg-orange-500 py-3 font-bold text-white transition hover:bg-orange-600 active:scale-95">
                    {added ? "Добавлено ✓" : "В корзину"}
                  </button>
                  <button onClick={() => toggleFavorite(product.id)}
                    className={cn("flex h-12 w-12 items-center justify-center rounded-xl border-2 transition",
                      fav ? "border-orange-400 text-orange-500" : "border-gray-200 text-gray-400 hover:border-orange-300")}
                    aria-label="В избранное">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
                    </svg>
                  </button>
                </div>
                {added && (
                  <Link href="/cart" className="mt-3 inline-flex text-sm font-semibold text-orange-500 hover:underline underline-offset-4">
                    Перейти в корзину →
                  </Link>
                )}
              </>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-500">Войдите чтобы добавить товар в корзину и оформить заказ.</p>
                <div className="mt-3 flex justify-center gap-2">
                  <Link href={`/login?redirect=/product/${product.slug}`}
                    className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600">
                    Войти
                  </Link>
                  <Link href="/register"
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50">
                    Регистрация
                  </Link>
                </div>
                <button onClick={() => toggleFavorite(product.id)}
                  className="mt-3 text-sm font-semibold text-orange-500 hover:underline underline-offset-4">
                  {fav ? "В избранном ✓" : "Добавить в избранное"}
                </button>
              </div>
            )}
          </div>

          {/* Характеристики */}
          <div className="mt-6">
            <h3 className="font-display text-lg font-bold text-gray-900">Характеристики</h3>
            <dl className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
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
                  <dt className="text-gray-400">{k}</dt>
                  <dd className="font-semibold text-gray-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-4">
            <SizeComparison dimensions={product.dimensions} />
          </div>
        </div>
      </div>

      {/* С этим смотрят */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-extrabold text-gray-900">С этим смотрят</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}
