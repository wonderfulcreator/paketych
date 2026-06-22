"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const SIZE_ORDER = ["S", "M", "L", "XL", "XXL"];
const SIZE_FULL_LABEL: Record<string, string> = {
  S: "Размер S", M: "Размер M", L: "Размер L", XL: "Размер XL", XXL: "Размер XXL",
};

const GRID_STEP = 28;

// Настоящая SVG-сетка из пересекающихся прутьев с лёгким металлическим градиентом
// на каждом пруте и заметным узлом в точке пересечения — больше похоже на
// решётчатый стенд из магазина, чем плоский CSS-паттерн линий.
function WireMeshBackground({ id }: { id: string }) {
  return (
    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${id}-wireH`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4F5F7" />
          <stop offset="45%" stopColor="#9CA1A8" />
          <stop offset="55%" stopColor="#9CA1A8" />
          <stop offset="100%" stopColor="#6B7077" />
        </linearGradient>
        <linearGradient id={`${id}-wireV`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F4F5F7" />
          <stop offset="45%" stopColor="#9CA1A8" />
          <stop offset="55%" stopColor="#9CA1A8" />
          <stop offset="100%" stopColor="#6B7077" />
        </linearGradient>
        <radialGradient id={`${id}-knot`}>
          <stop offset="0%" stopColor="#B5BAC0" />
          <stop offset="100%" stopColor="#8B9097" />
        </radialGradient>
        <pattern id={id} width={GRID_STEP} height={GRID_STEP} patternUnits="userSpaceOnUse">
          <rect width={GRID_STEP} height={GRID_STEP} fill="#DCDFE3" />
          <line x1="0" y1={GRID_STEP / 2} x2={GRID_STEP} y2={GRID_STEP / 2} stroke={`url(#${id}-wireH)`} strokeWidth="2.2" />
          <line x1={GRID_STEP / 2} y1="0" x2={GRID_STEP / 2} y2={GRID_STEP} stroke={`url(#${id}-wireV)`} strokeWidth="2.2" />
          <circle cx={GRID_STEP / 2} cy={GRID_STEP / 2} r="2.3" fill={`url(#${id}-knot)`} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

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

            <div className="relative overflow-hidden rounded-2xl border border-gray-400">
              <WireMeshBackground id={`mesh-${size}`} />
              {/* Объёмная рамка стенда — металлический кант по периметру */}
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_3px_8px_rgba(0,0,0,0.22),inset_0_-3px_8px_rgba(0,0,0,0.15),inset_3px_0_6px_rgba(255,255,255,0.25)]" />

              <div className="relative flex items-start gap-7 overflow-x-auto px-6 pb-6 pt-8">
                {items.map(p => (
                  <Link key={p.id} href={`/product/${p.slug}`}
                    className="group flex shrink-0 flex-col items-center transition-transform duration-150 hover:translate-y-1">
                    {/* Металлический крючок — стержень с загнутым верхом и бликом */}
                    <div className="relative flex h-6 w-3 flex-col items-center">
                      <div className="absolute -top-2.5 h-3.5 w-3.5 rounded-t-full border-[2.5px] border-b-0 border-gray-300 shadow-sm" />
                      <div className="absolute -top-2.5 h-3.5 w-3.5 rounded-t-full border-t-[2.5px] border-white/40" style={{ borderLeftColor: "transparent", borderRightColor: "transparent" }} />
                      <div className="mt-1.5 h-4 w-[3px] rounded-b bg-gradient-to-b from-gray-300 to-gray-500" />
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

