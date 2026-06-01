"use client";

import { useMemo, useState, Suspense } from "react";
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
  { id: "popular",    label: "По популярности" },
  { id: "new",        label: "Сначала новинки" },
  { id: "price-asc",  label: "Цена ↑" },
  { id: "price-desc", label: "Цена ↓" },
  { id: "sale",       label: "По скидке" },
] as const;

// Группировка коллекций по семействам дизайнов
const COLLECTION_GROUPS: { label: string; collections: string[] }[] = [
  {
    label: "🎄 Новинки 2025",
    collections: ["Снежные грёзы", "Мандариновая сказка", "Christmas Gold", "Зимняя сказка"],
  },
  {
    label: "✨ Премиум",
    collections: ["BC LUX", "BC XL"],
  },
  {
    label: "📦 Базовые",
    collections: ["B", "B Kraft", "M", "M Kraft", "L", "L Kraft", "XL", "Basics"],
  },
  {
    label: "🎁 Прямоугольные",
    collections: ["B XL", "BP", "LP", "ML", "MS"],
  },
];

function effectivePrice(p: Product) {
  return p.isSale && p.salePrice ? p.salePrice : p.basePrice;
}

function CatalogInner({ products, collections, themes, sizes }: Props) {
  const sp          = useSearchParams();
  const initQ       = sp.get("q") || "";
  const searchMode  = sp.get("mode") || "available";

  const [query,         setQuery]         = useState(initQ);
  const [onlyAvail,     setOnlyAvail]     = useState(true);
  const [onlySale,      setOnlySale]      = useState(false);
  const [onlyNew,       setOnlyNew]       = useState(false);
  const [selSizes,      setSelSizes]      = useState<string[]>([]);
  const [selCols,       setSelCols]       = useState<string[]>([]);
  const [selThemes,     setSelThemes]     = useState<string[]>([]);
  const [sort,          setSort]          = useState("popular");
  const [visible,       setVisible]       = useState(24);
  const [mobileOpen,    setMobileOpen]    = useState(false);

  function toggle<T>(list: T[], set: (v: T[]) => void, val: T) {
    set(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);
    setVisible(24);
  }

  const filtered = useMemo(() => {
    let res = [...products];
    if (onlyAvail) res = res.filter(p => p.isAvailable);
    if (onlySale)  res = res.filter(p => p.isSale);
    if (onlyNew)   res = res.filter(p => p.isNew);
    if (selSizes.length)  res = res.filter(p => selSizes.includes(p.size));
    if (selCols.length)   res = res.filter(p => selCols.includes(p.collection));
    if (selThemes.length) res = res.filter(p => p.theme.some(t => selThemes.includes(t)));

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      res = res.filter(p =>
        searchMode === "sku"
          ? p.sku.toLowerCase().includes(q)
          : p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.collection.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "new":        res.sort((a, b) => +b.isNew - +a.isNew); break;
      case "price-asc":  res.sort((a, b) => effectivePrice(a) - effectivePrice(b)); break;
      case "price-desc": res.sort((a, b) => effectivePrice(b) - effectivePrice(a)); break;
      case "sale":       res.sort((a, b) => +b.isSale - +a.isSale); break;
      default:           res.sort((a, b) => +b.isHit - +a.isHit);
    }
    return res;
  }, [products, onlyAvail, onlySale, onlyNew, selSizes, selCols, selThemes, query, searchMode, sort]);

  // Группируем видимые коллекции для отображения в фильтре
  const presentCollections = new Set(products.map(p => p.collection));

  const FiltersContent = (
    <div className="space-y-6">
      {/* Наличие и теги */}
      <FilterSection title="Показать">
        <Check label="Только в наличии" checked={onlyAvail} onChange={() => { setOnlyAvail(v => !v); setVisible(24); }} />
        <Check label="Новинки"          checked={onlyNew}   onChange={() => { setOnlyNew(v => !v);   setVisible(24); }} />
        <Check label="Со скидкой"       checked={onlySale}  onChange={() => { setOnlySale(v => !v);  setVisible(24); }} />
      </FilterSection>

      {/* Размер */}
      <FilterSection title="Размер пакета">
        <div className="flex flex-wrap gap-2">
          {sizes.map(s => (
            <button key={s} onClick={() => toggle(selSizes, setSelSizes, s)}
              className={cn("rounded-lg border px-3 py-1.5 text-sm font-semibold transition",
                selSizes.includes(s)
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-orange-300")}>
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Коллекции — сгруппированные */}
      <FilterSection title="Коллекция / серия">
        {COLLECTION_GROUPS.map(group => {
          const visible_cols = group.collections.filter(c => presentCollections.has(c));
          if (!visible_cols.length) return null;
          return (
            <div key={group.label} className="mb-3">
              <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">{group.label}</div>
              <div className="space-y-1">
                {visible_cols.map(c => (
                  <Check key={c} label={c} checked={selCols.includes(c)}
                    onChange={() => toggle(selCols, setSelCols, c)} />
                ))}
              </div>
            </div>
          );
        })}
        {/* Коллекции вне групп */}
        {collections.filter(c => !COLLECTION_GROUPS.flatMap(g => g.collections).includes(c) && presentCollections.has(c)).map(c => (
          <Check key={c} label={c} checked={selCols.includes(c)}
            onChange={() => toggle(selCols, setSelCols, c)} />
        ))}
      </FilterSection>

      {/* Тема */}
      <FilterSection title="Повод / тема">
        <div className="space-y-1">
          {themes.map(t => (
            <Check key={t} label={t} checked={selThemes.includes(t)}
              onChange={() => toggle(selThemes, setSelThemes, t)} />
          ))}
        </div>
      </FilterSection>

      {/* Сброс */}
      {(selSizes.length || selCols.length || selThemes.length || onlySale || onlyNew) ? (
        <button onClick={() => { setSelSizes([]); setSelCols([]); setSelThemes([]); setOnlySale(false); setOnlyNew(false); setVisible(24); }}
          className="w-full rounded-xl border border-gray-200 py-2 text-sm text-gray-500 transition hover:border-orange-300 hover:text-orange-500">
          Сбросить фильтры
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
        Каталог
      </h1>
      <p className="mt-1 text-sm text-gray-500">Найдено: {filtered.length} из {products.length} товаров</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Фильтры десктоп */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            {FiltersContent}
          </div>
        </aside>

        <div>
          {/* Тулбар */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <button onClick={() => setMobileOpen(true)}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-300 lg:hidden">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54Z"/>
              </svg>
              Фильтры
              {(selSizes.length + selCols.length + selThemes.length) > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs text-white">
                  {selSizes.length + selCols.length + selThemes.length}
                </span>
              )}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-sm text-gray-400 sm:block">Сортировка:</span>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-400">
                {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-12 text-center text-gray-400">
              Ничего не найдено. Попробуйте изменить фильтры или поисковый запрос.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {filtered.slice(0, visible).map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {visible < filtered.length && (
                <div className="mt-8 text-center">
                  <button onClick={() => setVisible(v => v + 24)}
                    className="rounded-full border border-gray-200 bg-white px-8 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-orange-300 hover:text-orange-500">
                    Показать ещё ({filtered.length - visible})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Фильтры</h2>
              <button onClick={() => setMobileOpen(false)}
                className="rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-600">
                Закрыть
              </button>
            </div>
            {FiltersContent}
            <button onClick={() => setMobileOpen(false)}
              className="mt-5 w-full rounded-xl bg-orange-500 py-3 font-bold text-white">
              Показать {filtered.length} товаров
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Вспомогательные компоненты ────────────────────────────────────
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2.5 text-sm font-bold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1 text-left text-sm transition hover:bg-gray-50">
      {/* Чекбокс — всегда виден на белом фоне */}
      <span className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition",
        checked
          ? "border-orange-500 bg-orange-500 text-white"
          : "border-gray-300 bg-white"
      )}>
        {checked && (
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        )}
      </span>
      <span className={cn("leading-tight", checked ? "font-semibold text-gray-900" : "text-gray-600")}>
        {label}
      </span>
    </button>
  );
}

export function CatalogClient(props: Props) {
  return (
    <Suspense fallback={<div className="container py-8 text-gray-400">Загрузка…</div>}>
      <CatalogInner {...props} />
    </Suspense>
  );
}
