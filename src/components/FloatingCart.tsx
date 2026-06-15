"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/providers/StoreProvider";
import { usePathname } from "next/navigation";

export function FloatingCart() {
  const { requestCount, ready } = useStore();
  const pathname = usePathname();

  // Не показываем на самой странице корзины
  if (pathname === "/cart") return null;
  if (!ready || requestCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Link href="/cart"
          className="relative flex items-center gap-2.5 rounded-full bg-orange-500 px-5 py-3 font-bold text-white shadow-[0_8px_24px_rgba(249,115,22,0.4)] transition hover:bg-orange-600 hover:shadow-[0_12px_32px_rgba(249,115,22,0.5)]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
            <path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span className="text-sm">Корзина</span>
          <motion.span
            key={requestCount}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-extrabold text-orange-500"
          >
            {requestCount}
          </motion.span>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
