"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { useStore } from "@/providers/StoreProvider";
import { useToast } from "@/providers/ToastProvider";
import { getAllProducts } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

const allProducts = getAllProducts();

const STATUS_LABELS: Record<string, string> = {
  new: "Новая", processing: "В обработке",
  quoted: "КП отправлено", done: "Выполнена", cancelled: "Отменена",
};
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-50 text-blue-600", processing: "bg-yellow-50 text-yellow-600",
  quoted: "bg-purple-50 text-purple-600", done: "bg-green-50 text-green-600",
  cancelled: "bg-gray-100 text-gray-500",
};

// Уровни клиента
const CLIENT_LEVELS = [
  { min: 0, max: 1,   label: "Новый клиент",     badge: "🌱", color: "bg-gray-100 text-gray-600",   desc: "Добро пожаловать!" },
  { min: 2, max: 4,   label: "Постоянный",        badge: "⭐", color: "bg-yellow-50 text-yellow-700", desc: "Ещё заказов и вы станете партнёром" },
  { min: 5, max: 9,   label: "Партнёр",           badge: "🏆", color: "bg-orange-50 text-orange-600", desc: "Персональные условия по запросу" },
  { min: 10, max: 999, label: "Ключевой партнёр", badge: "💎", color: "bg-blue-50 text-blue-700",     desc: "Эксклюзивные условия и приоритет" },
];

function getLevel(count: number) {
  return CLIENT_LEVELS.find(l => count >= l.min && count <= l.max) ?? CLIENT_LEVELS[0];
}

type StoredRequest = {
  order_id: string; created_at: string; status: string; comment: string;
  discount_pct: number; total_base: string; total_final: string;
  delivery_stage: string; delivery_eta: string | null;
  tracking_number: string | null; carrier_name: string | null;
  ordered_by_name: string;
  items: { sku: string; title: string; boxes: number; pcs_per_box: number; base_price: string; effective_price: string }[];
};

const DELIVERY_STAGES = [
  { id: "accepted",   label: "Принят" },
  { id: "packed",     label: "Собран" },
  { id: "shipped",    label: "Передан в ТК" },
  { id: "in_transit", label: "В пути" },
  { id: "delivered",  label: "Доставлен" },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();
  const { addToRequest } = useStore();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<StoredRequest[]>([]);
  const [repeated, setRepeated] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace("/login?redirect=/account");
  }, [ready, user, router]);

  useEffect(() => {
    try {
      fetch("/api/orders", { credentials: "include" })
        .then(r => r.json())
        .then(data => { if (data.ok) setRequests(data.orders ?? []); })
        .catch(() => {});
    } catch {}
  }, []);

  function repeatOrder(r: StoredRequest) {
    let added = 0;
    for (const item of r.items) {
      const product = allProducts.find(p => p.sku === item.sku);
      if (product) {
        addToRequest(product.id, item.boxes);
        added++;
      }
    }
    setRepeated(r.order_id);
    if (added > 0) showToast(`Добавлено ${added} позиций из заказа ${r.order_id}`, "");
    setTimeout(() => setRepeated(null), 2500);
  }

  // Заполненность профиля
  const profileFields = [
    { ok: !!user?.name, label: "Имя" },
    { ok: !!user?.company, label: "Компания" },
    { ok: !!user?.email, label: "Email" },
    { ok: !!user?.phone, label: "Телефон" },
  ];
  const profileScore = Math.round((profileFields.filter(f => f.ok).length / profileFields.length) * 100);

  if (!ready || !user) return <div className="container py-12 text-gray-400">Загрузка…</div>;

  const level = getLevel(requests.length);
  const nextLevel = CLIENT_LEVELS.find(l => l.min > requests.length);
  const progressToNext = nextLevel
    ? ((requests.length - level.min) / (nextLevel.min - level.min)) * 100
    : 100;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold text-gray-900">Личный кабинет</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => { try { localStorage.removeItem("pp_onboarding_done"); } catch {} location.href = "/"; }}
            className="hidden rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 transition hover:border-orange-300 hover:text-orange-500 sm:inline-flex">
            Показать обзор сайта
          </button>
          <button onClick={() => { logout(); router.push("/"); }}
            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 transition hover:border-orange-300 hover:text-orange-500">
            Выйти
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Профиль + бейдж */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-xs text-gray-400">Контактное лицо</div>
            <div className="font-bold text-gray-900">{user.name}</div>
            <div className="mt-3 text-xs text-gray-400">Компания</div>
            <div className="font-bold text-gray-900">{user.company}</div>
            <div className="mt-3 text-xs text-gray-400">Email</div>
            <div className="text-sm font-semibold text-gray-700">{user.email}</div>
            <div className="mt-3 text-xs text-gray-400">Телефон</div>
            <div className="text-sm font-semibold text-gray-700">{user.phone}</div>

            {profileScore < 100 && (
              <div className="mt-4 rounded-xl bg-gray-50 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-600">Профиль заполнен</span>
                  <span className="font-bold text-orange-500">{profileScore}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <motion.div className="h-full rounded-full bg-orange-500"
                    initial={{ width: 0 }} animate={{ width: `${profileScore}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }} />
                </div>
              </div>
            )}

            <Link href="/favorites" className="mt-4 inline-flex text-sm font-semibold text-orange-500 hover:underline underline-offset-4">
              Избранное →
            </Link>
            <Link href="/account/team" className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:underline underline-offset-4">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Команда →
            </Link>
            <Link href="/account/documents" className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:underline underline-offset-4">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/>
              </svg>
              Документы →
            </Link>
          </div>

          {/* Бейдж уровня */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.2 }}
            className={`rounded-2xl border p-5 ${level.color.replace("text-","border-").replace("bg-","border-")} ${level.color.split(" ")[0]}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{level.badge}</span>
              <div>
                <div className="font-display text-base font-extrabold">{level.label}</div>
                <div className="text-xs opacity-75">{level.desc}</div>
              </div>
            </div>
            <div className="mt-3 text-xs opacity-75">{requests.length} заказов оформлено</div>
            {nextLevel && (
              <>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
                  <motion.div className="h-full rounded-full bg-current opacity-60"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }} />
                </div>
                <div className="mt-1 text-xs opacity-60">
                  До уровня «{nextLevel.label}»: ещё {nextLevel.min - requests.length} заказов
                </div>
              </>
            )}
          </motion.div>
        </aside>

        {/* Заявки */}
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">Мои заказы</h2>
          {requests.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center text-gray-400">
              Заявок пока нет.{" "}
              <Link href="/catalog" className="text-orange-500 hover:underline underline-offset-4">
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {requests.map((r, i) => (
                <motion.div key={r.order_id}
                  initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-gray-900">{r.order_id}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString("ru-RU")}
                        {r.ordered_by_name && r.ordered_by_name !== user.name && (
                          <> · оформил {r.ordered_by_name}</>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                      <button onClick={() => repeatOrder(r)}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-500">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-5h5"/>
                        </svg>
                        {repeated === r.order_id ? "Добавлено ✓" : "Повторить"}
                      </button>
                      <a href={`/api/orders/${r.order_id}/pdf`}
                        download
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-500">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                        </svg>
                        КП
                      </a>
                    </div>
                  </div>

                  {/* Таймлайн доставки — пока ручной/заглушка, после интеграции с 1С обновляется автоматически */}
                  {r.status !== "cancelled" && r.status !== "new" && (
                    <div className="mt-3 flex items-center gap-1">
                      {DELIVERY_STAGES.map((stage, idx) => {
                        const currentIdx = DELIVERY_STAGES.findIndex(s => s.id === r.delivery_stage);
                        const isDone = idx <= currentIdx;
                        return (
                          <div key={stage.id} className="flex flex-1 items-center">
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${isDone ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                              {isDone ? "✓" : idx + 1}
                            </div>
                            {idx < DELIVERY_STAGES.length - 1 && (
                              <div className={`h-0.5 flex-1 ${idx < currentIdx ? "bg-orange-500" : "bg-gray-100"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {r.status !== "cancelled" && r.status !== "new" && (
                    <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                      {DELIVERY_STAGES.map(s => <span key={s.id}>{s.label}</span>)}
                    </div>
                  )}
                  {r.tracking_number && (
                    <div className="mt-1 text-xs text-gray-400">
                      Трек-номер: <span className="font-semibold text-gray-600">{r.tracking_number}</span>
                      {r.carrier_name && <> · {r.carrier_name}</>}
                    </div>
                  )}

                  <div className="mt-3 space-y-1 text-sm text-gray-500">
                    {r.items.map(it => (
                      <div key={it.sku} className="flex justify-between">
                        <span className="line-clamp-1">{it.title}</span>
                        <span className="shrink-0 pl-3">{it.boxes} кор. · {formatPrice(parseFloat(it.effective_price))}</span>
                      </div>
                    ))}
                  </div>
                  {r.comment && (
                    <div className="mt-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-400">
                      {r.comment}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
