"use client";
import { RecentlyViewed } from "@/components/RecentlyViewed";

import { useMemo, useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeletons";
import { EmptyState, EmptyIcons } from "@/components/EmptyState";
import { ShelfShowcase } from "@/components/ShelfShowcase";
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

const COLOR_SWATCHES: { label: string; hex: string }[] = [
  { label: "Белый",          hex: "#FFFFFF" },
  { label: "Серый",          hex: "#9CA3AF" },
  { label: "Красный",        hex: "#EF4444" },
  { label: "Оранжевый",      hex: "#F97316" },
  { label: "Жёлтый",         hex: "#FCD34D" },
  { label: "Зелёный",        hex: "#22C55E" },
  { label: "Бирюзовый",      hex: "#14B8A6" },
  { label: "Синий",          hex: "#3B82F6" },
  { label: "Фиолетовый",     hex: "#A855F7" },
  { label: "Розовый",        hex: "#EC4899" },
  { label: "Розово-мятный",  hex: "#F0ABFC" },
  { label: "Пудровый",       hex: "#FBCFE8" },
  { label: "Микс",           hex: "#9333EA" },
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
  const [selColors,     setSelColors]     = useState<string[]>([]);
  const [sort,          setSort]          = useState("popular");
  const [isLoading,     setIsLoading]     = useState(true);
  const [viewMode,      setViewMode]      = useState<"grid" | "shelf">("grid");

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(t);
  }, []);
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
    if (selColors.length) res = res.filter(p => selColors.includes(p.color));

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
  }, [products, onlyAvail, onlySale, onlyNew, selSizes, selCols, selThemes, selColors, query, searchMode, sort]);

  // Группируем видимые коллекции для отображения в фильтре
  const presentCollections = new Set(products.map(p => p.collection));
  const presentColors = new Set(products.map(p => p.color));

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

      {/* Подбор по цвету бренда */}
      <FilterSection title="Цвет бренда">
        <div className="flex flex-wrap gap-2">
          {COLOR_SWATCHES.filter(c => presentColors.has(c.label)).map(c => (
            <button key={c.label} onClick={() => toggle(selColors, setSelColors, c.label)}
              title={c.label}
              className={cn("relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition",
                selColors.includes(c.label) ? "border-orange-500 scale-110" : "border-gray-200 hover:border-gray-300")}>
              <span className="h-6 w-6 rounded-full" style={{ backgroundColor: c.hex, border: c.hex === "#FFFFFF" ? "1px solid #E5E7EB" : undefined }} />
              {selColors.includes(c.label) && (
                <svg className="absolute h-3.5 w-3.5 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ filter: c.hex === "#FFFFFF" || c.hex === "#FCD34D" ? "invert(1) drop-shadow(0 0 1px white)" : undefined }}>
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Сброс */}
      {(selSizes.length || selCols.length || selThemes.length || selColors.length || onlySale || onlyNew) ? (
        <button onClick={() => { setSelSizes([]); setSelCols([]); setSelThemes([]); setSelColors([]); setOnlySale(false); setOnlyNew(false); setVisible(24); }}
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
              {(selSizes.length + selCols.length + selThemes.length + selColors.length) > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs text-white">
                  {selSizes.length + selCols.length + selThemes.length + selColors.length}
                </span>
              )}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-0.5 rounded-xl border border-gray-200 bg-white p-0.5">
                <button onClick={() => setViewMode("grid")}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${viewMode === "grid" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"}`}>
                  Сетка
                </button>
                <button onClick={() => setViewMode("shelf")}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${viewMode === "shelf" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"}`}>
                  Витрина
                </button>
              </div>
              <span className="hidden text-sm text-gray-400 sm:block">Сортировка:</span>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-400">
                {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Активные фильтры-чипсы */}
          {(selSizes.length > 0 || selCols.length > 0 || selThemes.length > 0 || selColors.length > 0 || onlySale || onlyNew) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {onlyNew && (
                <button onClick={() => { setOnlyNew(false); setVisible(24); }}
                  className="flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100">
                  Новинки <span className="text-green-500">×</span>
                </button>
              )}
              {onlySale && (
                <button onClick={() => { setOnlySale(false); setVisible(24); }}
                  className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100">
                  Со скидкой <span className="text-red-400">×</span>
                </button>
              )}
              {selSizes.map(s => (
                <button key={s} onClick={() => toggle(selSizes, setSelSizes, s)}
                  className="flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-100">
                  Размер {s} <span className="text-orange-400">×</span>
                </button>
              ))}
              {selCols.map(c => (
                <button key={c} onClick={() => toggle(selCols, setSelCols, c)}
                  className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">
                  {c} <span className="text-blue-400">×</span>
                </button>
              ))}
              {selThemes.map(t => (
                <button key={t} onClick={() => toggle(selThemes, setSelThemes, t)}
                  className="flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-100">
                  {t} <span className="text-purple-400">×</span>
                </button>
              ))}
              {selColors.map(c => (
                <button key={c} onClick={() => toggle(selColors, setSelColors, c)}
                  className="flex items-center gap-1.5 rounded-full bg-pink-50 border border-pink-200 px-3 py-1.5 text-xs font-semibold text-pink-700 transition hover:bg-pink-100">
                  {c} <span className="text-pink-400">×</span>
                </button>
              ))}
              <button onClick={() => { setSelSizes([]); setSelCols([]); setSelThemes([]); setSelColors([]); setOnlySale(false); setOnlyNew(false); setVisible(24); }}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:border-orange-300 hover:text-orange-500">
                Сбросить все
              </button>
            </div>
          )}


          {isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={EmptyIcons.search}
              title="Такого пакета пока нет в коробке"
              description="Попробуйте другой запрос или сбросьте фильтры"
              actionLabel="Сбросить фильтры"
              onAction={() => { setSelSizes([]); setSelCols([]); setSelThemes([]); setSelColors([]); setOnlySale(false); setOnlyNew(false); setQuery(""); setVisible(24); }}
            />
          ) : viewMode === "shelf" ? (
            <ShelfShowcase products={filtered} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {filtered.slice(0, visible).map((p, idx) => <ProductCard key={p.id} product={p} index={idx} />)}
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

      <RecentlyViewed />

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
      <motion.span
        animate={checked ? { scale: [1, 1.18, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
        checked
          ? "border-orange-500 bg-orange-500 text-white"
          : "border-gray-300 bg-white"
      )}>
        <AnimatePresence>
          {checked && (
            <motion.svg
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5"/>
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.span>
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
