"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";

type Props = {
  products: Product[];
  collections: string[];
  themes: string[];
  sizes: string[];
};

const SORTS = [
  { id: "popular", label: "По популярности" },
  { id: "new", label: "Сначала новинки" },
  { id: "price-asc", label: "Цена: по возрастанию" },
  { id: "price-desc", label: "Цена: по убыванию" },
  { id: "sale", label: "По скидке" },
] as const;

function effectivePrice(p: Product) {
  return p.isSale && p.salePrice ? p.salePrice : p.basePrice;
}

function CatalogInner({ products, collections, themes, sizes }: Props) {
  const sp = useSearchParams();
  const initialQuery = sp.get("q") || "";
  const searchMode = sp.get("mode") || "available";

  const [query, setQuery] = useState(initialQuery);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [selSizes, setSelSizes] = useState<string[]>([]);
  const [selCollections, setSelCollections] = useState<string[]>([]);
  const [selThemes, setSelThemes] = useState<string[]>([]);
  const [onlySale, setOnlySale] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [sort, setSort] = useState<string>("popular");
  const [visible, setVisible] = useState(20);
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
    if (searchMode === "sale") setOnlySale(true);
  }, [initialQuery, searchMode]);

  function toggle(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
    setVisible(20);
  }

  const filtered = useMemo(() => {
    let res = products.slice();

    if (onlyAvailable) res = res.filter((p) => p.isAvailable);
    if (onlySale) res = res.filter((p) => p.isSale);
    if (onlyNew) res = res.filter((p) => p.isNew);
    if (selSizes.length) res = res.filter((p) => selSizes.includes(p.size));
    if (selCollections.length)
      res = res.filter((p) => selCollections.includes(p.collection));
    if (selThemes.length)
      res = res.filter((p) => p.theme.some((t) => selThemes.includes(t)));

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (searchMode === "sku") {
        res = res.filter((p) => p.sku.toLowerCase().includes(q));
      } else {
        res = res.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.collection.toLowerCase().includes(q)
        );
      }
    }

    switch (sort) {
      case "new":
        res.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
      case "price-asc":
        res.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case "price-desc":
        res.sort((a, b) => effectivePrice(b) - effectivePrice(a));
        break;
      case "sale":
        res.sort((a, b) => Number(b.isSale) - Number(a.isSale));
        break;
      default:
        res.sort((a, b) => Number(b.isHit) - Number(a.isHit));
    }
    return res;
  }, [
    products,
    onlyAvailable,
    onlySale,
    onlyNew,
    selSizes,
    selCollections,
    selThemes,
    query,
    searchMode,
    sort,
  ]);

  const shown = filtered.slice(0, visible);

  const Filters = (
    <div className="space-y-5">
      <FilterGroup title="Наличие">
        <Check
          label="Только в наличии"
          checked={onlyAvailable}
          onChange={() => {
            setOnlyAvailable((v) => !v);
            setVisible(20);
          }}
        />
        <Check
          label="Новинки"
          checked={onlyNew}
          onChange={() => {
            setOnlyNew((v) => !v);
            setVisible(20);
          }}
        />
        <Check
          label="Со скидкой"
          checked={onlySale}
          onChange={() => {
            setOnlySale((v) => !v);
            setVisible(20);
          }}
        />
      </FilterGroup>

      <FilterGroup title="Размер">
        {sizes.map((s) => (
          <Check
            key={s}
            label={s}
            checked={selSizes.includes(s)}
            onChange={() => toggle(selSizes, setSelSizes, s)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Тема">
        {themes.map((t) => (
          <Check
            key={t}
            label={t}
            checked={selThemes.includes(t)}
            onChange={() => toggle(selThemes, setSelThemes, t)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Коллекция">
        <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
          {collections.map((c) => (
            <Check
              key={c}
              label={c}
              checked={selCollections.includes(c)}
              onChange={() => toggle(selCollections, setSelCollections, c)}
            />
          ))}
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <div className="container py-8">
      <h1 className="brand-heading text-3xl">Каталог</h1>
      <p className="mt-1 text-sm text-inkSoft">
        Найдено: {filtered.length} товаров
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Фильтры — десктоп */}
        <aside className="hidden lg:block">
          <div className="paper-card-soft sticky top-32 p-4">{Filters}</div>
        </aside>

        <div>
          {/* Тулбар */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              onClick={() => setMobileFilters(true)}
              className="btn-ghost !py-2 !text-xs lg:hidden"
            >
              Фильтры
            </button>
            <div className="ml-auto flex items-center gap-2">
              <label className="text-xs text-inkSoft">Сортировка:</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-ink outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {shown.length === 0 ? (
            <div className="paper-card-soft p-10 text-center text-inkSoft">
              Ничего не найдено. Попробуйте изменить фильтры или поисковый запрос.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {shown.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {visible < filtered.length && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setVisible((v) => v + 20)}
                    className="btn-ghost"
                  >
                    Показать ещё
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Фильтры — мобильный bottom sheet */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFilters(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-line bg-paper p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Фильтры</h2>
              <button
                onClick={() => setMobileFilters(false)}
                className="rounded-full border border-line px-3 py-1.5 text-sm"
              >
                Закрыть
              </button>
            </div>
            {Filters}
            <button
              onClick={() => setMobileFilters(false)}
              className="btn-primary mt-5 w-full"
            >
              Показать {filtered.length}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-ink">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center gap-2 text-left text-sm text-inkSoft transition hover:text-flame"
    >
      <span
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border",
          checked ? "border-flame bg-flame text-white" : "border-line"
        )}
      >
        {checked && (
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

export function CatalogClient(props: Props) {
  return (
    <Suspense fallback={<div className="container py-8 text-inkSoft">Загрузка…</div>}>
      <CatalogInner {...props} />
    </Suspense>
  );
}
