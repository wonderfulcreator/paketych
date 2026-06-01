"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useStore } from "@/providers/StoreProvider";

const SEARCH_MODES = [
  { id: "available", label: "Только в наличии" },
  { id: "sku",       label: "По артикулу" },
  { id: "words",     label: "По словам" },
] as const;

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { favorites, requestCount } = useStore();
  const [query, setQuery]       = useState("");
  const [mode, setMode]         = useState("available");
  const [modeOpen, setModeOpen] = useState(false);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (query.trim()) p.set("q", query.trim());
    p.set("mode", mode);
    router.push(`/catalog?${p.toString()}`);
  }

  const modeLabel = SEARCH_MODES.find((m) => m.id === mode)?.label ?? "Только в наличии";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
      {/* Верхняя строка */}
      <div className="container flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3 shrink-0">
          <Image src="/brand/logo-main.png" alt="Пакет Пакетыч" width={150} height={138} priority className="h-12 w-auto" />
          <div className="hidden sm:block">
            <div className="text-sm font-extrabold uppercase tracking-[0.2em] text-orange-600">Пакет&nbsp;Пакетыч</div>
            <div className="text-xs text-gray-400">упаковка оптом · от 1 коробки</div>
          </div>
        </Link>

        <a href="tel:+79000000000" className="hidden text-sm font-semibold text-gray-500 transition hover:text-orange-500 md:block">
          8 (900) 000-00-00
        </a>

        <div className="flex items-center gap-2">
          <Link href="/favorites" aria-label="Избранное"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-orange-300 hover:text-orange-500">
            <HeartIcon className="h-5 w-5" />
            {favorites.length > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white">
                {favorites.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/account" className="hidden rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:inline-flex">
                {user.name.split(" ")[0]}
              </Link>
              <button onClick={() => { logout(); router.push("/"); }}
                className="hidden rounded-full px-2 py-2 text-sm text-gray-400 transition hover:text-orange-500 sm:inline-flex">
                Выйти
              </button>
              <Link href="/cart"
                className="relative inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600">
                Заявка
                {requestCount > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-white/30 px-1.5 text-xs">{requestCount}</span>
                )}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-gray-600 transition hover:text-orange-500">Войти</Link>
              <Link href="/register" className="hidden rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:inline-flex">Регистрация</Link>
            </div>
          )}
        </div>
      </div>

      {/* Нижняя строка: каталог + поиск + быстрые ссылки */}
      <div className="border-t border-gray-100">
        <div className="container flex items-center gap-3 py-2.5">
          <Link href="/catalog"
            className="flex shrink-0 items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600">
            <MenuIcon className="h-4 w-4" /> Каталог
          </Link>

          <form onSubmit={submitSearch} className="relative flex flex-1 items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1.5 transition focus-within:border-orange-300 focus-within:bg-white">
            <div className="relative shrink-0">
              <button type="button" onClick={() => setModeOpen(v => !v)}
                className="flex items-center gap-1 border-r border-gray-200 py-1 pl-2 pr-3 text-xs font-semibold text-gray-500">
                {modeLabel} <ChevronIcon className="h-3 w-3" />
              </button>
              {modeOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lift">
                  {SEARCH_MODES.map((m) => (
                    <button key={m.id} type="button" onClick={() => { setMode(m.id); setModeOpen(false); }}
                      className={cn("flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition hover:bg-orange-50",
                        mode === m.id ? "font-bold text-orange-600" : "text-gray-600")}>
                      <span className={cn("inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        mode === m.id ? "border-orange-500 bg-orange-500 text-white" : "border-gray-300")}>
                        {mode === m.id && <CheckIcon className="h-3 w-3" />}
                      </span>
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Поиск по названию или артикулу…"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400" />
            <button type="submit" aria-label="Найти"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white transition hover:bg-orange-600">
              <SearchIcon className="h-4 w-4" />
            </button>
          </form>

          <nav className="hidden shrink-0 items-center gap-5 lg:flex">
            <Link href="/catalog/new"  className="text-sm font-bold text-green-600  transition hover:text-green-700">Новинки</Link>
            <Link href="/catalog/sale" className="text-sm font-bold text-red-500    transition hover:text-red-600">Распродажа</Link>
            <Link href="/actions"      className="text-sm font-bold text-yellow-600 transition hover:text-yellow-700">Акции</Link>
          </nav>
        </div>

        {/* Мобильные быстрые ссылки */}
        <div className="container flex gap-4 overflow-x-auto pb-2.5 lg:hidden">
          <Link href="/catalog/new"  className="whitespace-nowrap text-sm font-bold text-green-600">Новинки</Link>
          <Link href="/catalog/sale" className="whitespace-nowrap text-sm font-bold text-red-500">Распродажа</Link>
          <Link href="/actions"      className="whitespace-nowrap text-sm font-bold text-yellow-600">Акции</Link>
        </div>
      </div>
    </header>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
}
function SearchIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
}
function ChevronIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>;
}
function CheckIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>;
}
function HeartIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>;
}
