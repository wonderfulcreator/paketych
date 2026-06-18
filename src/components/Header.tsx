"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { useStore } from "@/providers/StoreProvider";
import { LiveSearch } from "@/components/LiveSearch";
import { getAllProducts } from "@/lib/products";

const allProducts = getAllProducts();

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { favorites, requestCount } = useStore();

  // Bounce при изменении requestCount
  const [bounce, setBounce] = useState(false);
  const prevCount = useRef(requestCount);
  useEffect(() => {
    if (requestCount > prevCount.current) {
      setBounce(true);
      setTimeout(() => setBounce(false), 600);
    }
    prevCount.current = requestCount;
  }, [requestCount]);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
      {/* Верхняя строка */}
      <div className="container flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3 shrink-0">
          <Image src="/brand/logo-main.png" alt="Пакет Пакетыч" width={150} height={138} priority
            className="h-12 w-auto" />
          <div className="hidden sm:block">
            <div className="text-sm font-extrabold uppercase tracking-[0.2em] text-orange-600">Пакет&nbsp;Пакетыч</div>
            <div className="text-xs text-gray-400">упаковка оптом · от 1 коробки</div>
          </div>
        </Link>

        <a href="tel:+79000000000"
          className="hidden text-sm font-semibold text-gray-500 transition hover:text-orange-500 md:block">
          8 (900) 000-00-00
        </a>

        <div className="flex items-center gap-2">
          {/* Избранное */}
          <Link href="/favorites" aria-label="Избранное"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-orange-300 hover:text-orange-500">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
            </svg>
            <AnimatePresence>
              {favorites.length > 0 && (
                <motion.span key={favorites.length}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white">
                  {favorites.length}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/account" data-tour="account"
                className="hidden rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:inline-flex">
                {user.name.split(" ")[0]}
              </Link>
              <button onClick={() => { logout(); router.push("/"); }}
                className="hidden rounded-full px-2 py-2 text-sm text-gray-400 transition hover:text-orange-500 sm:inline-flex">
                Выйти
              </button>

              {/* Корзина с bounce */}
              <Link href="/cart" data-tour="cart"
                onMouseEnter={() => router.prefetch("/cart")}
                className="ripple-container relative inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600">
                <motion.span
                  animate={bounce ? { scale: [1, 1.35, 0.9, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="inline-flex items-center gap-1.5"
                >
                  🛍 Корзина
                </motion.span>
                <AnimatePresence>
                  {requestCount > 0 && (
                    <motion.span key={requestCount}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      className="inline-flex min-w-5 items-center justify-center rounded-full bg-white/30 px-1.5 text-xs font-bold">
                      {requestCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"
                className="rounded-full px-3 py-2 text-sm font-semibold text-gray-600 transition hover:text-orange-500">
                Войти
              </Link>
              <Link href="/register"
                className="hidden rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:inline-flex">
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Нижняя строка */}
      <div className="border-t border-gray-100">
        <div className="container flex items-center gap-3 py-2.5">
          <Link href="/catalog" data-tour="catalog"
            onMouseEnter={() => router.prefetch("/catalog")}
            className="ripple-container flex shrink-0 items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            Каталог
          </Link>

          {/* Живой поиск */}
          <div data-tour="search" className="flex-1">
            <LiveSearch products={allProducts} />
          </div>

          {/* Быстрые ссылки */}
          <nav className="hidden shrink-0 items-center gap-5 lg:flex">
            <Link href="/catalog/new"  className="text-sm font-bold text-green-600 transition hover:opacity-80">Новинки</Link>
            <Link href="/catalog/sale" className="text-sm font-bold text-red-500 transition hover:opacity-80">Распродажа</Link>
            <Link href="/actions"      className="text-sm font-bold text-amber-600 transition hover:opacity-80">Акции</Link>
          </nav>
        </div>

        {/* Мобильные ссылки */}
        <div className="container flex gap-4 overflow-x-auto pb-2.5 lg:hidden">
          <Link href="/catalog/new"  className="whitespace-nowrap text-sm font-bold text-green-600">Новинки</Link>
          <Link href="/catalog/sale" className="whitespace-nowrap text-sm font-bold text-red-500">Распродажа</Link>
          <Link href="/actions"      className="whitespace-nowrap text-sm font-bold text-amber-600">Акции</Link>
        </div>
      </div>
    </header>
  );
}
