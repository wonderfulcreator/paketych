"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";

const SEARCH_MODES = [
  { id: "available", label: "Только в наличии" },
  { id: "sku",       label: "По артикулу" },
  { id: "words",     label: "По словам" },
] as const;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function LiveSearch({ products }: { products: Product[] }) {
  const router = useRouter();
  const [query, setQuery]       = useState("");
  const [mode, setMode]         = useState("available");
  const [modeOpen, setModeOpen] = useState(false);
  const [focused, setFocused]   = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 220);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
        setModeOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const modeLabel = SEARCH_MODES.find(m => m.id === mode)?.label ?? "Только в наличии";

  const results = debouncedQuery.trim().length >= 2
    ? products
        .filter(p => {
          if (mode === "available" && !p.isAvailable) return false;
          const q = debouncedQuery.toLowerCase();
          if (mode === "sku") return p.sku.toLowerCase().includes(q);
          return p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.collection.toLowerCase().includes(q);
        })
        .slice(0, 6)
    : [];

  const showDropdown = focused && debouncedQuery.trim().length >= 2;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setFocused(false);
    router.push(`/catalog?q=${encodeURIComponent(query.trim())}&mode=${mode}`);
  }

  return (
    <div ref={wrapRef} className="relative flex-1">
      <form onSubmit={submit}
        className={cn(
          "flex items-center rounded-full border bg-gray-50 px-2 py-1.5 transition",
          focused ? "border-orange-400 bg-white ring-2 ring-orange-100" : "border-gray-200"
        )}
      >
        {/* Mode selector */}
        <div className="relative shrink-0">
          <button type="button" onClick={() => setModeOpen(v => !v)}
            className="flex items-center gap-1 border-r border-gray-200 py-1 pl-2 pr-3 text-xs font-semibold text-gray-500 transition hover:text-orange-500">
            {modeLabel}
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          {modeOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
              {SEARCH_MODES.map(m => (
                <button key={m.id} type="button"
                  onClick={() => { setMode(m.id); setModeOpen(false); }}
                  className={cn("flex w-full items-center gap-2.5 px-4 py-3 text-sm transition hover:bg-orange-50",
                    mode === m.id ? "font-bold text-orange-600" : "text-gray-600")}>
                  <span className={cn("inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border-2",
                    mode === m.id ? "border-orange-500 bg-orange-500 text-white" : "border-gray-300")}>
                    {mode === m.id && <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>}
                  </span>
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Поиск по названию или артикулу…"
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
        <button type="submit" aria-label="Найти"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white transition hover:bg-orange-600">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
          </svg>
        </button>
      </form>

      {/* Live results dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          {results.length === 0 ? (
            <div className="px-4 py-5 text-center text-sm text-gray-400">
              Ничего не найдено.{" "}
              {mode === "available" && (
                <button onClick={() => setMode("words")} className="text-orange-500 underline underline-offset-2">
                  Искать среди всех
                </button>
              )}
            </div>
          ) : (
            <>
              {results.map(p => (
                <Link key={p.id} href={`/product/${p.slug}`}
                  onClick={() => { setFocused(false); setQuery(""); }}
                  className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-orange-50">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                    <Image src={p.images[0] || "/products/placeholders/wrap.svg"} alt={p.title}
                      fill className="object-contain p-1" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-gray-900">{p.title}</div>
                    <div className="text-xs text-gray-400">{p.sku}</div>
                  </div>
                  <div className="shrink-0 text-sm font-bold text-gray-900">
                    от {formatPrice(p.salePrice ?? p.basePrice)}
                  </div>
                </Link>
              ))}
              <Link href={`/catalog?q=${encodeURIComponent(query)}&mode=${mode}`}
                onClick={() => { setFocused(false); }}
                className="flex items-center justify-center gap-1.5 border-t border-gray-100 py-3 text-sm font-semibold text-orange-500 transition hover:bg-orange-50">
                Показать все результаты →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
