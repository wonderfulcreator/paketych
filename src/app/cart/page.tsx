"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAllProducts } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useStore } from "@/providers/StoreProvider";

const allProducts = getAllProducts();

// Пороги скидок
const DISCOUNT_TIERS = [
  { boxes: 5,  label: "−5%",  color: "bg-orange-400" },
  { boxes: 10, label: "−10%", color: "bg-orange-500" },
  { boxes: 20, label: "−15%", color: "bg-orange-600" },
  { boxes: 50, label: "−20%", color: "bg-red-500" },
];

function ProgressBar({ totalBoxes }: { totalBoxes: number }) {
  const next = DISCOUNT_TIERS.find(t => t.boxes > totalBoxes);
  const current = [...DISCOUNT_TIERS].reverse().find(t => t.boxes <= totalBoxes);
  const max = next?.boxes ?? DISCOUNT_TIERS[DISCOUNT_TIERS.length - 1].boxes;
  const prev = current?.boxes ?? 0;
  const progress = Math.min(((totalBoxes - prev) / (max - prev)) * 100, 100);

  return (
    <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-900">Прогресс скидки</span>
        {current && (
          <span className="rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-bold text-white">
            Уже {current.label}
          </span>
        )}
      </div>
      <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-orange-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      {next ? (
        <p className="mt-2 text-xs text-gray-500">
          Добавьте ещё{" "}
          <span className="font-bold text-orange-600">{next.boxes - totalBoxes} кор.</span>{" "}
          и получите скидку <span className="font-bold text-orange-600">{next.label}</span>
        </p>
      ) : (
        <p className="mt-2 text-xs font-semibold text-green-600">
          Максимальная скидка достигнута 🎉
        </p>
      )}
      <div className="mt-3 flex gap-1">
        {DISCOUNT_TIERS.map(t => (
          <div key={t.boxes} className="flex flex-1 flex-col items-center">
            <div className={`h-2 w-2 rounded-full transition ${totalBoxes >= t.boxes ? t.color : "bg-gray-200"}`} />
            <span className="mt-1 text-[10px] text-gray-400">{t.boxes} кор.</span>
            <span className={`text-[10px] font-bold ${totalBoxes >= t.boxes ? "text-orange-600" : "text-gray-300"}`}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Конфетти-частицы
function Confetti({ onDone }: { onDone: () => void }) {
  const colors = ["#f97316","#10b981","#3b82f6","#f59e0b","#ec4899","#8b5cf6"];
  const particles = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: (Math.random() - 0.5) * 600,
    y: -(Math.random() * 400 + 100),
    rotate: Math.random() * 720 - 360,
    delay: Math.random() * 0.3,
  }));

  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[300] flex items-center justify-center overflow-hidden">
      {particles.map(p => (
        <motion.div key={p.id}
          className="absolute h-3 w-3 rounded-sm"
          style={{ backgroundColor: p.color }}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: 0, scale: 0.5, x: p.x, y: p.y, rotate: p.rotate }}
          transition={{ duration: 1.6, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { user, ready: authReady } = useAuth();
  const { request, setBoxes, removeFromRequest, clearRequest, ready } = useStore();
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (authReady && !user) router.replace("/login?redirect=/cart");
  }, [authReady, user, router]);

  if (!authReady || !ready) return <div className="container py-12 text-gray-400">Загрузка…</div>;
  if (!user) return null;

  const lines = request.map(r => {
    const p = allProducts.find(x => x.id === r.productId);
    return p ? { product: p, boxes: r.boxes } : null;
  }).filter(Boolean) as { product: typeof allProducts[number]; boxes: number }[];

  const totalBoxes = lines.reduce((s, l) => s + l.boxes, 0);

  function submit() {
    const id = "PP-" + Math.floor(100000 + Math.random() * 900000);
    try {
      const prev = JSON.parse(localStorage.getItem("pp_requests") || "[]");
      prev.push({
        id, createdAt: new Date().toISOString(), status: "new", comment, user,
        items: lines.map(l => ({
          productId: l.product.id, sku: l.product.sku, title: l.product.title,
          boxes: l.boxes, basePrice: l.product.basePrice,
        })),
      });
      localStorage.setItem("pp_requests", JSON.stringify(prev));
    } catch {}
    setRequestId(id);
    setShowConfetti(true);
    clearRequest();
    setTimeout(() => setSubmitted(true), 600);
  }

  if (submitted) {
    return (
      <div className="container flex justify-center py-16">
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
          className="card-white max-w-lg p-8 text-center">
          <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
            transition={{ type:"spring", stiffness:400, damping:20, delay:0.1 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✓
          </motion.div>
          <h1 className="font-display text-2xl font-extrabold text-gray-900">
            Заявка {requestId} принята
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Менеджер свяжется с вами в течение рабочего дня и пришлёт коммерческое предложение.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/account" className="btn-ghost">Мои заявки</Link>
            <Link href="/catalog" className="btn-primary">В каталог</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

      <h1 className="font-display text-3xl font-extrabold text-gray-900">Корзина заявки</h1>

      {lines.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-10 text-center text-gray-400">
          Заявка пуста.{" "}
          <Link href="/catalog" className="text-orange-500 hover:underline underline-offset-4">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Список */}
          <div className="space-y-3">
            <AnimatePresence>
              {lines.map(({ product, boxes }) => (
                <motion.div key={product.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-50">
                    <Image src={product.images[0] || "/products/placeholders/wrap.svg"}
                      alt={product.title} fill className="object-contain p-1.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${product.slug}`}
                      className="line-clamp-1 text-sm font-semibold text-gray-900 hover:text-orange-500">
                      {product.title}
                    </Link>
                    <div className="text-xs text-gray-400">{product.sku}</div>
                    <div className="mt-1 text-sm font-bold text-gray-900">
                      от {formatPrice(product.basePrice)} / кор.
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => boxes <= 1 ? removeFromRequest(product.id) : setBoxes(product.id, boxes - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 font-bold text-gray-600 transition hover:border-orange-300 hover:text-orange-500">
                      −
                    </button>
                    <input type="number" min={1} value={boxes}
                      onChange={e => setBoxes(product.id, parseInt(e.target.value) || 1)}
                      className="h-8 w-14 rounded-xl border border-gray-200 text-center text-sm outline-none focus:border-orange-400" />
                    <button onClick={() => setBoxes(product.id, boxes + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 font-bold text-gray-600 transition hover:border-orange-300 hover:text-orange-500">
                      +
                    </button>
                  </div>
                  <button onClick={() => removeFromRequest(product.id)}
                    className="text-gray-300 transition hover:text-red-400" aria-label="Удалить">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                    </svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Сайдбар */}
          <aside className="space-y-4">
            <ProgressBar totalBoxes={totalBoxes} />

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold text-gray-900">Оформление</h2>
              <p className="mt-1 text-xs text-gray-400">
                Окончательная цена формируется менеджером с учётом объёма.
              </p>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Пожелания, сроки, вопросы…" rows={4}
                className="mt-3 w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Позиций:</span>
                  <span className="font-bold text-gray-900">{lines.length}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Коробок:</span>
                  <span className="font-bold text-gray-900">{totalBoxes}</span>
                </div>
              </div>
              <motion.button onClick={submit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="relative mt-4 w-full overflow-hidden rounded-xl bg-orange-500 py-3 font-bold text-white transition hover:bg-orange-600">
                Отправить заявку менеджеру
              </motion.button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
