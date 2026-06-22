"use client";

import Image from "next/image";
import Link from "next/link";
import { useCompare } from "@/providers/CompareProvider";
import { getAllProducts } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

const allProducts = getAllProducts();

const ROWS: { label: string; key: keyof (typeof allProducts)[number] | "price" }[] = [
  { label: "Цена за коробку", key: "price" },
  { label: "Размер",          key: "size" },
  { label: "Габариты",        key: "dimensions" },
  { label: "Материал",        key: "material" },
  { label: "Граммаж",         key: "grammage" },
  { label: "Тип ручки",       key: "handleType" },
  { label: "В коробке",       key: "pcsPerBox" },
  { label: "Цвет",            key: "color" },
  { label: "Артикул",         key: "sku" },
];

export default function ComparePage() {
  const { compareIds, toggleCompare, clearCompare, ready } = useCompare();

  if (!ready) return <div className="container py-12 text-gray-400">Загрузка…</div>;

  const products = compareIds
    .map(id => allProducts.find(p => p.id === id))
    .filter(Boolean) as (typeof allProducts)[number][];

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold text-gray-900">Сравнение товаров</h1>
        {products.length > 0 && (
          <button onClick={clearCompare}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 transition hover:border-red-200 hover:text-red-500">
            Очистить всё
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-12 text-center text-gray-400">
          Нечего сравнивать. Добавьте товары через значок{" "}
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 align-middle">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18M7 16l4-6 4 4 4-8"/>
            </svg>
          </span>{" "}
          на карточке товара.
          <div className="mt-4">
            <Link href="/catalog" className="text-orange-500 link-underline">Перейти в каталог →</Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <div className="grid min-w-[640px] gap-px overflow-hidden rounded-2xl border border-gray-100 bg-gray-100"
            style={{ gridTemplateColumns: `160px repeat(${products.length}, 1fr)` }}>

            {/* Заголовок с фото */}
            <div className="bg-white p-3" />
            {products.map(p => (
              <div key={p.id} className="relative bg-white p-3 text-center">
                <button onClick={() => toggleCompare(p.id)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-red-200 hover:text-red-500">
                  ×
                </button>
                <Link href={`/product/${p.slug}`} className="block">
                  <div className="relative mx-auto h-24 w-24">
                    <Image src={p.images[0] || "/products/placeholders/wrap.svg"} alt={p.title} fill className="object-contain" />
                  </div>
                  <div className="mt-2 line-clamp-2 text-xs font-semibold text-gray-900 hover:text-orange-500">{p.title}</div>
                </Link>
              </div>
            ))}

            {/* Строки характеристик */}
            {ROWS.map(row => (
              <>
                <div key={row.label} className="bg-gray-50 p-3 text-xs font-semibold text-gray-500">
                  {row.label}
                </div>
                {products.map(p => (
                  <div key={p.id + row.label} className="bg-white p-3 text-center text-sm text-gray-900">
                    {row.key === "price"
                      ? formatPrice(p.salePrice ?? p.basePrice)
                      : row.key === "grammage"
                        ? `${p.grammage} г/м²`
                        : row.key === "pcsPerBox"
                          ? `${p.pcsPerBox} шт.`
                          : String(p[row.key])}
                  </div>
                ))}
              </>
            ))}

            {/* Кнопка в каталог */}
            <div className="bg-white p-3" />
            {products.map(p => (
              <div key={p.id + "-link"} className="bg-white p-3 text-center">
                <Link href={`/product/${p.slug}`}
                  className="inline-flex rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-600">
                  Перейти к товару
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
