"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/lib/types";
import { cn, formatPrice, discountPercent } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useStore } from "@/providers/StoreProvider";
import { useCompare } from "@/providers/CompareProvider";
import { useToast } from "@/providers/ToastProvider";

/* ── анимация «полёта» в корзину ─────────────────────────────────── */
function FlyParticle({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      className="pointer-events-none fixed z-[200] flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm text-white shadow-lg"
      initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      animate={{ opacity: 0, scale: 0.4, x: "calc(100vw - 140px)", y: "-80vh" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={onDone}
    >
      🛍
    </motion.div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, addToRequest, request, setBoxes, removeFromRequest } = useStore();
  const { isComparing, toggleCompare } = useCompare();
  const { showToast } = useToast();
  const [flying, setFlying] = useState(false);
  const fav = isFavorite(product.id);

  const existing = request.find(r => r.productId === product.id);
  const count = existing?.boxes ?? 0;
  const inRequest = count > 0;

  const img = product.images[0] || "/products/placeholders/wrap.svg";

  function handleAdd() {
    if (!user) { router.push(`/login?redirect=/product/${product.slug}`); return; }
    if (!inRequest) {
      setFlying(true);
      addToRequest(product.id, 1);
      showToast(product.title, img);
    }
  }

  function increment() {
    if (!user) return;
    setBoxes(product.id, count + 1);
  }

  function decrement() {
    if (count <= 1) removeFromRequest(product.id);
    else setBoxes(product.id, count - 1);
  }

  return (
    <>
      {flying && <FlyParticle onDone={() => setFlying(false)} />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift"
      >
        {/* Фото */}
        <Link href={`/product/${product.slug}`}
          className="relative block overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
          <Image src={img} alt={product.title} fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
          />

          {/* Бейджи */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.isNew && (
              <span className="rounded-full bg-green-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">Новинка</span>
            )}
            {product.isSale && product.salePrice && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                −{discountPercent(product.basePrice, product.salePrice)}%
              </span>
            )}
            {product.isHit && !product.isNew && (
              <span className="rounded-full bg-orange-400 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">Хит</span>
            )}
          </div>

          {/* Избранное */}
          <button onClick={e => { e.preventDefault(); toggleFavorite(product.id); }}
            className={cn(
              "absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white/95 shadow-sm backdrop-blur transition",
              fav ? "border-orange-400 text-orange-500" : "border-gray-200 text-gray-400 hover:text-orange-400"
            )}
            aria-label="В избранное">
            <svg className="h-4 w-4" viewBox="0 0 24 24"
              fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
            </svg>
          </button>

          {/* Сравнение */}
          <button onClick={e => { e.preventDefault(); toggleCompare(product.id); }}
            className={cn(
              "absolute right-2 top-12 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white/95 shadow-sm backdrop-blur transition",
              isComparing(product.id) ? "border-orange-400 text-orange-500" : "border-gray-200 text-gray-400 hover:text-orange-400"
            )}
            aria-label="Сравнить">
            <svg className="h-4 w-4" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18M7 16l4-6 4 4 4-8"/>
            </svg>
          </button>
        </Link>

        {/* Инфо */}
        <div className="flex flex-1 flex-col p-3">
          <Link href={`/product/${product.slug}`}
            className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition hover:text-orange-500">
            {product.title}
          </Link>
          <div className="mt-0.5 text-xs text-gray-400">{product.sku}</div>

          <div className="mt-2 flex items-baseline gap-1.5">
            {product.isSale && product.salePrice ? (
              <>
                <span className="text-base font-extrabold text-red-500">от {formatPrice(product.salePrice)}</span>
                <span className="text-xs text-gray-400 line-through">{formatPrice(product.basePrice)}</span>
              </>
            ) : (
              <span className="text-base font-extrabold text-gray-900">от {formatPrice(product.basePrice)}</span>
            )}
          </div>
          <div className="text-[11px] text-gray-400">за коробку · {product.pcsPerBox} шт.</div>

          {user && (
            <div className={cn("mt-1 text-[11px] font-semibold",
              product.isAvailable ? "text-green-600" : "text-gray-400")}>
              {product.isAvailable ? "● Есть на складе" : "○ Под заказ"}
            </div>
          )}

          {/* Кнопка / счётчик */}
          <div className="mt-auto pt-3">
            <AnimatePresence mode="wait">
              {inRequest ? (
                /* Счётчик коробок */
                <motion.div key="counter"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  className="flex items-center justify-between rounded-xl border-2 border-orange-500 bg-orange-50 overflow-hidden"
                >
                  <button onClick={decrement}
                    className="flex h-9 w-9 items-center justify-center text-orange-600 text-lg font-bold transition hover:bg-orange-100">
                    −
                  </button>
                  <div className="flex flex-1 flex-col items-center">
                    <motion.span key={count}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-sm font-extrabold text-orange-600">
                      {count} кор.
                    </motion.span>
                    <span className="text-[10px] text-orange-400">{count * product.pcsPerBox} шт.</span>
                  </div>
                  <button onClick={increment}
                    className="flex h-9 w-9 items-center justify-center text-orange-600 text-lg font-bold transition hover:bg-orange-100">
                    +
                  </button>
                </motion.div>
              ) : (
                /* Кнопка добавления — появляется снизу при hover */
                <motion.button key="add"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  onClick={handleAdd}
                  className="w-full rounded-xl bg-orange-500 py-2 text-xs font-bold text-white transition hover:bg-orange-600 active:scale-95"
                >
                  В корзину
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
}
