"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { isGlossyMaterial } from "@/components/GlossyShine";
import { formatPrice } from "@/lib/utils";

const SIZE_ORDER = ["S", "M", "L", "XL", "XXL"];
const SIZE_FULL_LABEL: Record<string, string> = {
  S: "Размер S", M: "Размер M", L: "Размер L", XL: "Размер XL", XXL: "Размер XXL",
};

export function ShelfShowcase({ products }: { products: Product[] }) {
  const bySize = new Map<string, Product[]>();
  for (const p of products) {
    if (!bySize.has(p.size)) bySize.set(p.size, []);
    bySize.get(p.size)!.push(p);
  }

  const orderedSizes = SIZE_ORDER.filter(s => bySize.has(s));

  if (orderedSizes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12">
      {orderedSizes.map(size => {
        const items = bySize.get(size)!;
        return (
          <div key={size}>
            <div className="mb-4 flex items-baseline gap-2.5">
              <h2 className="font-display text-lg font-extrabold text-gray-900">{SIZE_FULL_LABEL[size] ?? size}</h2>
              <span className="text-sm text-gray-400">{items.length} товаров</span>
            </div>

            <div className="rounded-2xl bg-gradient-to-b from-[#FBF4EC] to-[#F3E6D6] p-4 sm:p-5">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {items.map(p => (
                  <Link key={p.id} href={`/product/${p.slug}`}
                    className="group flex w-[148px] shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:w-[168px]">
                    <div className="relative h-[148px] bg-gray-50 sm:h-[168px]">
                      <Image
                        src={p.images[0] || "/products/placeholders/wrap.svg"}
                        alt={p.title}
                        fill
                        sizes="170px"
                        className="object-contain p-3 transition-transform duration-200 group-hover:scale-105"
                      />
                      {isGlossyMaterial(p.material) && (
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/25 opacity-0 transition group-hover:opacity-100" />
                      )}
                      {p.isHit && (
                        <span className="absolute left-2 top-2 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-bold text-white">Хит</span>
                      )}
                    </div>
                    <div className="border-t border-gray-100 p-2.5">
                      <p className="truncate text-xs font-semibold text-gray-900">{p.collection}</p>
                      <p className="mt-0.5 text-xs font-bold text-orange-600">от {formatPrice(p.basePrice)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
