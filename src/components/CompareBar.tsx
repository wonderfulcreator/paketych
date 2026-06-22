"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCompare, MAX_COMPARE } from "@/providers/CompareProvider";
import { getAllProducts } from "@/lib/products";

const allProducts = getAllProducts();

export function CompareBar() {
  const { compareIds, toggleCompare, clearCompare, ready } = useCompare();
  const pathname = usePathname();

  if (!ready || compareIds.length === 0 || pathname === "/compare") return null;

  const products = compareIds
    .map(id => allProducts.find(p => p.id === id))
    .filter(Boolean) as (typeof allProducts)[number][];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
          <div className="flex flex-1 items-center gap-2">
            {products.map(p => (
              <div key={p.id} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                <Image src={p.images[0] || "/products/placeholders/wrap.svg"} alt={p.title} fill className="object-contain p-1" />
                <button onClick={() => toggleCompare(p.id)}
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-700 text-[10px] text-white">
                  ×
                </button>
              </div>
            ))}
            {Array.from({ length: MAX_COMPARE - products.length }).map((_, i) => (
              <div key={i} className="h-12 w-12 shrink-0 rounded-xl border border-dashed border-gray-200" />
            ))}
            <span className="ml-1 hidden text-xs text-gray-400 sm:inline">
              {products.length}/{MAX_COMPARE} товаров
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button onClick={clearCompare}
              className="rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 transition hover:border-red-200 hover:text-red-500">
              Очистить
            </button>
            <Link href="/compare"
              className="rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-600">
              Сравнить
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
