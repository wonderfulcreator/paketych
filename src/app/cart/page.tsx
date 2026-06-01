"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllProducts } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useStore } from "@/providers/StoreProvider";

const allProducts = getAllProducts();

export default function CartPage() {
  const router = useRouter();
  const { user, ready: authReady } = useAuth();
  const { request, setBoxes, removeFromRequest, clearRequest, ready } =
    useStore();
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState("");

  useEffect(() => {
    if (authReady && !user) router.replace("/login?redirect=/cart");
  }, [authReady, user, router]);

  if (!authReady || !ready) return <div className="container py-12 text-gray-500">Загрузка…</div>;
  if (!user) return null;

  const lines = request
    .map((r) => {
      const p = allProducts.find((x) => x.id === r.productId);
      return p ? { product: p, boxes: r.boxes } : null;
    })
    .filter(Boolean) as { product: (typeof allProducts)[number]; boxes: number }[];

  function submit() {
    const id = "PP-" + Math.floor(100000 + Math.random() * 900000);
    // Демо: сохраняем заявку в localStorage (в проде — POST в API → email/1С)
    try {
      const prev = JSON.parse(localStorage.getItem("pp_requests") || "[]");
      prev.push({
        id,
        createdAt: new Date().toISOString(),
        status: "new",
        comment,
        user,
        items: lines.map((l) => ({
          productId: l.product.id,
          sku: l.product.sku,
          title: l.product.title,
          boxes: l.boxes,
          basePrice: l.product.basePrice,
        })),
      });
      localStorage.setItem("pp_requests", JSON.stringify(prev));
    } catch {}
    setRequestId(id);
    setSubmitted(true);
    clearRequest();
  }

  if (submitted) {
    return (
      <div className="container flex justify-center py-16">
        <div className="card-white max-w-lg p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-leaf/15 text-3xl">
            ✓
          </div>
          <h1 className="heading text-2xl">Заявка {requestId} принята</h1>
          <p className="mt-2 text-sm text-gray-500">
            Менеджер свяжется с вами в течение рабочего дня и пришлёт
            коммерческое предложение с актуальными ценами и условиями.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/account" className="btn-ghost">Мои заявки</Link>
            <Link href="/catalog" className="btn-primary">В каталог</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="heading text-3xl">Корзина заявки</h1>

      {lines.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 mt-6 p-10 text-center text-gray-500">
          Заявка пуста.{" "}
          <Link href="/catalog" className="brand-link">Перейти в каталог</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-3">
            {lines.map(({ product, boxes }) => (
              <div
                key={product.id}
                className="flex items-center gap-4 rounded-brand border border-gray-200/70 bg-paper p-3"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-50">
                  <Image
                    src={product.images[0] || "/products/placeholders/wrap.svg"}
                    alt={product.title}
                    fill
                    className="object-contain p-1.5"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${product.slug}`} className="line-clamp-1 text-sm font-semibold text-gray-900 hover:text-orange-500">
                    {product.title}
                  </Link>
                  <div className="text-xs text-gray-500">{product.sku}</div>
                  <div className="mt-1 text-sm font-bold text-gray-900">
                    от {formatPrice(product.basePrice)} / кор.
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setBoxes(product.id, boxes - 1)} className="h-8 w-8 rounded-full border border-gray-200 bg-white font-bold">−</button>
                  <input
                    type="number"
                    min={1}
                    value={boxes}
                    onChange={(e) => setBoxes(product.id, parseInt(e.target.value) || 1)}
                    className="h-8 w-14 rounded-xl border border-gray-200 bg-paper text-center text-sm"
                  />
                  <button onClick={() => setBoxes(product.id, boxes + 1)} className="h-8 w-8 rounded-full border border-gray-200 bg-white font-bold">+</button>
                </div>
                <button onClick={() => removeFromRequest(product.id)} className="text-gray-500 hover:text-red-500" aria-label="Удалить">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <aside className="card-white h-fit p-5">
            <h2 className="font-display text-lg font-bold text-gray-900">Оформление</h2>
            <p className="mt-2 text-xs text-gray-500">
              Окончательная цена формируется менеджером с учётом объёма и
              актуальных условий.
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Пожелания, сроки, вопросы…"
              rows={4}
              className="field mt-4 resize-none"
            />
            <div className="mt-4 rounded-2xl bg-gray-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Позиций:</span>
                <span className="font-bold text-gray-900">{lines.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Коробок всего:</span>
                <span className="font-bold text-gray-900">
                  {lines.reduce((s, l) => s + l.boxes, 0)}
                </span>
              </div>
            </div>
            <button onClick={submit} className="btn-primary mt-4 w-full">
              Отправить заявку менеджеру
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
