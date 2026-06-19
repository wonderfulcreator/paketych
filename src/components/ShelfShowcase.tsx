"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { isGlossyMaterial } from "@/components/GlossyShine";

const SIZE_ORDER = ["S", "M", "L", "XL", "XXL"];

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
    <div className="space-y-10">
      {orderedSizes.map(size => {
        const items = bySize.get(size)!;
        return (
          <div key={size}>
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-gray-900 px-2.5 py-1 text-xs font-bold text-white">{size}</span>
              <span className="text-xs text-gray-400">{items.length} товаров</span>
            </div>

            <div className="relative">
              <div className="flex items-end gap-7 overflow-x-auto px-1 pb-7 pt-4">
                {items.map(p => (
                  <Link key={p.id} href={`/product/${p.slug}`}
                    className="group relative flex shrink-0 flex-col items-center transition-transform duration-200 hover:-translate-y-2">
                    <div className="relative h-28 w-20 sm:h-32 sm:w-24">
                      <Image
                        src={p.images[0] || "/products/placeholders/wrap.svg"}
                        alt={p.title}
                        fill
                        sizes="120px"
                        className="object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.12)] transition-all duration-200 group-hover:drop-shadow-[0_14px_16px_rgba(0,0,0,0.16)]"
                      />
                      {isGlossyMaterial(p.material) && (
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/25 opacity-0 transition group-hover:opacity-100" />
                      )}
                    </div>
                    <div className="-mt-1 h-2 w-14 rounded-[50%] bg-black/10 blur-[3px] transition-all duration-200 group-hover:w-10 group-hover:bg-black/15 sm:w-16 sm:group-hover:w-12" />
                    <span className="mt-2 max-w-[88px] truncate text-center text-[10.5px] text-gray-400">
                      {p.collection}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mx-1 h-3 rounded-sm bg-gradient-to-b from-[#C8946A] to-[#A9744E] shadow-[0_3px_6px_rgba(0,0,0,0.18)]" />
              <div className="mx-1 h-1.5 rounded-b-sm bg-[#8B5E3C]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
