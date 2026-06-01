"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useStore } from "@/providers/StoreProvider";

const SEARCH_MODES = [
  { id: "available", label: "Только в наличии" },
  { id: "sku", label: "По артикулу" },
  { id: "words", label: "По словам" },
] as const;

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { favorites, requestCount } = useStore();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<string>("available");
  const [modeOpen, setModeOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    params.set("mode", mode);
    router.push(`/catalog?${params.toString()}`);
    setMenuOpen(false);
  }

  const modeLabel =
    SEARCH_MODES.find((m) => m.id === mode)?.label ?? "Только в наличии";

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/90 backdrop-blur-xl">
      {/* Верхняя строка */}
      <div className="container flex items-center justify-between gap-4 py-2.5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/brand/logo-main.png"
            alt="Пакет Пакетыч"
            width={150}
            height={138}
            priority
            className="h-12 w-auto"
          />
          <span className="hidden text-sm font-extrabold uppercase tracking-[0.2em] text-flameDeep sm:block">
            Пакет&nbsp;Пакетыч
          </span>
        </Link>

        <a
          href="tel:+79000000000"
          className="hidden text-sm font-semibold text-inkSoft transition hover:text-flame md:block"
        >
          8 (900) 000-00-00
        </a>

        <div className="flex items-center gap-2">
          <Link
            href="/favorites"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-flameDeep transition hover:bg-creamSoft"
            aria-label="Избранное"
          >
            <HeartIcon className="h-5 w-5" />
            {favorites.length > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-flame px-1 text-[11px] font-bold text-white">
                {favorites.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="hidden rounded-full border border-line bg-paper px-3 py-2 text-sm font-semibold text-flameDeep transition hover:bg-creamSoft sm:inline-flex"
              >
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="hidden rounded-full px-2 py-2 text-sm font-semibold text-inkSoft transition hover:text-flame sm:inline-flex"
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-semibold text-inkSoft transition hover:text-flame"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="hidden rounded-full border border-line bg-paper px-3 py-2 text-sm font-semibold text-flameDeep transition hover:bg-creamSoft sm:inline-flex"
              >
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Нижняя строка */}
      <div className="border-t border-line/60">
        <div className="container flex items-center gap-3 py-2.5">
          <Link href="/catalog" className="btn-primary shrink-0 !px-4 !py-2.5">
            <MenuIcon className="h-4 w-4" />
            Каталог
          </Link>

          {/* Умный поиск */}
          <form
            onSubmit={submitSearch}
            className="relative flex flex-1 items-center gap-2 rounded-full border border-line bg-paper px-2 py-1.5"
          >
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setModeOpen((v) => !v)}
                className="flex items-center gap-1 border-r border-line py-1 pl-2 pr-3 text-xs font-semibold text-inkSoft"
              >
                {modeLabel}
                <ChevronIcon className="h-3 w-3" />
              </button>
              {modeOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-line bg-paper shadow-soft">
                  {SEARCH_MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMode(m.id);
                        setModeOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-creamSoft",
                        mode === m.id
                          ? "font-bold text-flameDeep"
                          : "text-inkSoft"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-4 w-4 items-center justify-center rounded border",
                          mode === m.id
                            ? "border-flame bg-flame text-white"
                            : "border-line"
                        )}
                      >
                        {mode === m.id && <CheckIcon className="h-3 w-3" />}
                      </span>
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по названию или артикулу…"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-inkSoft/60"
            />
            <button
              type="submit"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-flame text-white transition hover:bg-flameDeep"
              aria-label="Найти"
            >
              <SearchIcon className="h-4 w-4" />
            </button>
          </form>

          {/* Быстрые категории */}
          <nav className="hidden shrink-0 items-center gap-4 lg:flex">
            <Link
              href="/catalog/new"
              className="text-sm font-bold text-leaf transition hover:opacity-80"
            >
              Новинки
            </Link>
            <Link
              href="/catalog/sale"
              className="text-sm font-bold text-flameDeep transition hover:opacity-80"
            >
              Распродажа
            </Link>
            <Link
              href="/actions"
              className="text-sm font-bold text-[#b8860b] transition hover:opacity-80"
            >
              Акции
            </Link>
          </nav>
        </div>

        {/* Мобильные быстрые ссылки */}
        <div className="container flex gap-4 overflow-x-auto pb-2.5 lg:hidden">
          <Link href="/catalog/new" className="whitespace-nowrap text-sm font-bold text-leaf">
            Новинки
          </Link>
          <Link href="/catalog/sale" className="whitespace-nowrap text-sm font-bold text-flameDeep">
            Распродажа
          </Link>
          <Link href="/actions" className="whitespace-nowrap text-sm font-bold text-[#b8860b]">
            Акции
          </Link>
          {user && (
            <Link href="/cart" className="whitespace-nowrap text-sm font-bold text-inkSoft">
              Заявка ({requestCount})
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  );
}
