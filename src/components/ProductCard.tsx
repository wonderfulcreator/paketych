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
    if (!user) {
      router.push(`/login?redirect=/product/${product.slug}`);
      return;
    }
    addToRequest(product.id, 1);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-brand border border-line/70 bg-paper shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-creamSoft"
      >
        <Image
          src={img}
          alt={product.title}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-contain p-3 transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="rounded-full bg-leaf px-2 py-0.5 text-[11px] font-bold text-white">
              Новинка
            </span>
          )}
          {product.isSale && product.salePrice && (
            <span className="rounded-full bg-flameDeep px-2 py-0.5 text-[11px] font-bold text-white">
              −{discountPercent(product.basePrice, product.salePrice)}%
            </span>
          )}
          {product.isHit && !product.isNew && (
            <span className="rounded-full bg-sun px-2 py-0.5 text-[11px] font-bold text-flameDeep">
              Хит
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
          className={cn(
            "absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-paper/90 backdrop-blur transition",
            fav
              ? "border-flame text-flame"
              : "border-line text-inkSoft hover:text-flame"
          )}
          aria-label="В избранное"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill={fav ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
          </svg>
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug text-ink hover:text-flame"
        >
          {product.title}
        </Link>
        <div className="mt-1 text-xs text-inkSoft">{product.sku}</div>

        <div className="mt-2 flex items-baseline gap-2">
          {product.isSale && product.salePrice ? (
            <>
              <span className="text-base font-extrabold text-flameDeep">
                от {formatPrice(product.salePrice)}
              </span>
              <span className="text-xs text-inkSoft line-through">
                {formatPrice(product.basePrice)}
              </span>
            </>
          ) : (
            <span className="text-base font-extrabold text-ink">
              от {formatPrice(product.basePrice)}
            </span>
          )}
        </div>
        <div className="text-[11px] text-inkSoft">за коробку · {product.pcsPerBox} шт.</div>

        {user && (
          <div className="mt-1 text-[11px] font-semibold text-leaf">
            {product.isAvailable ? "Есть на складе" : "Под заказ"}
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-3">
          <button onClick={handleRequest} className="btn-primary flex-1 !px-3 !py-2 !text-xs">
            В заявку
          </button>
        </div>
      </div>
    </div>
  );
}
