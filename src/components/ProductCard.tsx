"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { cn, formatPrice, discountPercent } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useStore } from "@/providers/StoreProvider";

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, addToRequest } = useStore();
  const fav = isFavorite(product.id);
  const img = product.images[0] || "/products/placeholders/wrap.svg";

  function handleRequest() {
    if (!user) { router.push(`/login?redirect=/product/${product.slug}`); return; }
    addToRequest(product.id, 1);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/product/${product.slug}`}
        className="relative block overflow-hidden bg-gray-50" style={{ aspectRatio: "1/1" }}>
        <Image
          src={img} alt={product.title} fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-contain p-4 transition duration-500 group-hover:scale-110"
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
        {/* Кнопка избранного */}
        <button onClick={e => { e.preventDefault(); toggleFavorite(product.id); }}
          className={cn("absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white/95 shadow-sm backdrop-blur transition",
            fav ? "border-orange-400 text-orange-500" : "border-gray-200 text-gray-400 hover:text-orange-400")}
          aria-label="В избранное">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
          </svg>
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link href={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 hover:text-orange-500 transition">
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
          <div className={cn("mt-1 text-[11px] font-semibold", product.isAvailable ? "text-green-600" : "text-gray-400")}>
            {product.isAvailable ? "● Есть на складе" : "○ Под заказ"}
          </div>
        )}

        <button onClick={handleRequest}
          className="mt-auto mt-3 w-full rounded-xl bg-orange-500 py-2 text-xs font-bold text-white transition hover:bg-orange-600">
          В заявку
        </button>
      </div>
    </div>
  );
}
