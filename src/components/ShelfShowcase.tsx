"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const SIZE_ORDER = ["S", "M", "L", "XL", "XXL"];
const SIZE_FULL_LABEL: Record<string, string> = {
  S: "Размер S", M: "Размер M", L: "Размер L", XL: "Размер XL", XXL: "Размер XXL",
};

const GRID_STEP = 26;

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

            <div
              className="relative overflow-hidden rounded-2xl border border-gray-300"
              style={{
                backgroundImage: `
                  linear-gradient(180deg, #E7E9EC 0%, #D7D9DD 100%),
                  repeating-linear-gradient(0deg, rgba(140,144,150,0.45) 0px, rgba(140,144,150,0.45) 1.5px, transparent 1.5px, transparent ${GRID_STEP}px),
                  repeating-linear-gradient(90deg, rgba(140,144,150,0.45) 0px, rgba(140,144,150,0.45) 1.5px, transparent 1.5px, transparent ${GRID_STEP}px)
                `,
                backgroundBlendMode: "normal, multiply, multiply",
              }}
            >
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_2px_6px_rgba(0,0,0,0.12),inset_0_-2px_6px_rgba(0,0,0,0.08)]" />

              <div className="relative flex items-start gap-7 overflow-x-auto px-6 pb-6 pt-8">
                {items.map(p => (
                  <Link key={p.id} href={`/product/${p.slug}`}
                    className="group flex shrink-0 flex-col items-center transition-transform duration-150 hover:translate-y-1">
                    <div className="relative flex h-5 w-3 flex-col items-center">
                      <div className="absolute -top-2 h-3 w-3 rounded-t-full border-2 border-b-0 border-gray-400" />
                      <div className="mt-1 h-4 w-[3px] rounded-b bg-gray-400" />
                    </div>

                    <div className="relative -mt-0.5 h-28 w-20 rounded-md bg-white shadow-md sm:h-32 sm:w-24">
                      <Image
                        src={p.images[0] || "/products/placeholders/wrap.svg"}
                        alt={p.title}
                        fill
                        sizes="120px"
                        className="object-contain p-2"
                      />
                    </div>

                    <div className="mt-2 max-w-[96px] text-center">
                      <p className="truncate text-[11px] font-semibold text-gray-800">{p.collection}</p>
                      <p className="text-[11px] font-bold text-orange-600">от {formatPrice(p.basePrice)}</p>
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
