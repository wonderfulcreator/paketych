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
    <div className="space-y-6">
      {orderedSizes.map(size => {
        const items = bySize.get(size)!;
        return (
          <div key={size}>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-gray-900 px-2.5 py-1 text-xs font-bold text-white">{size}</span>
              <span className="text-xs text-gray-400">{items.length} товаров</span>
            </div>
            <div className="rounded-2xl bg-gray-50 px-3 pb-0 pt-6">
              <div className="flex items-end gap-5 overflow-x-auto pb-3 pl-2 pr-2">
                {items.map(p => (
                  <Link key={p.id} href={`/product/${p.slug}`}
                    className="group flex shrink-0 flex-col items-center transition hover:-translate-y-1.5">
                    <div className="relative h-28 w-20 sm:h-32 sm:w-24">
                      <Image
                        src={p.images[0] || "/products/placeholders/wrap.svg"}
                        alt={p.title}
                        fill
                        sizes="120px"
                        className="object-contain drop-shadow-md transition group-hover:drop-shadow-lg"
                      />
                      {isGlossyMaterial(p.material) && (
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 transition group-hover:opacity-100" />
                      )}
                    </div>
                    <span className="mt-1.5 max-w-[88px] truncate text-center text-[10.5px] text-gray-400">
                      {p.collection}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mx-1 h-1.5 rounded-full bg-gray-200" />
              <div className="mx-1 h-2 rounded-b-md bg-gray-100" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
