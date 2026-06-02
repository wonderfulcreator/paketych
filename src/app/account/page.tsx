"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { formatPrice } from "@/lib/utils";

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
  { min: 2, max: 4,   label: "Постоянный",        badge: "⭐", color: "bg-yellow-50 text-yellow-700", desc: "Ещё заявок и вы станете партнёром" },
  { min: 5, max: 9,   label: "Партнёр",           badge: "🏆", color: "bg-orange-50 text-orange-600", desc: "Персональные условия по запросу" },
  { min: 10, max: 999, label: "Ключевой партнёр", badge: "💎", color: "bg-blue-50 text-blue-700",     desc: "Эксклюзивные условия и приоритет" },
];

function getLevel(count: number) {
  return CLIENT_LEVELS.find(l => count >= l.min && count <= l.max) ?? CLIENT_LEVELS[0];
}

type StoredRequest = {
  id: string; createdAt: string; status: string; comment: string;
  items: { sku: string; title: string; boxes: number; basePrice: number }[];
};

export default function AccountPage() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();
  const [requests, setRequests] = useState<StoredRequest[]>([]);

  useEffect(() => {
    if (ready && !user) router.replace("/login?redirect=/account");
  }, [ready, user, router]);

  useEffect(() => {
    try {
      setRequests(JSON.parse(localStorage.getItem("pp_requests") || "[]").reverse());
    } catch {}
  }, []);

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
        <button onClick={() => { logout(); router.push("/"); }}
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 transition hover:border-orange-300 hover:text-orange-500">
          Выйти
        </button>
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
            <Link href="/favorites" className="mt-4 inline-flex text-sm font-semibold text-orange-500 hover:underline underline-offset-4">
              Избранное →
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
            <div className="mt-3 text-xs opacity-75">{requests.length} заявок оформлено</div>
            {nextLevel && (
              <>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
                  <motion.div className="h-full rounded-full bg-current opacity-60"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }} />
                </div>
                <div className="mt-1 text-xs opacity-60">
                  До уровня «{nextLevel.label}»: ещё {nextLevel.min - requests.length} заявок
                </div>
              </>
            )}
          </motion.div>
        </aside>

        {/* Заявки */}
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">Мои заявки</h2>
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
                <motion.div key={r.id}
                  initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-gray-900">{r.id}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-gray-500">
                    {r.items.map(it => (
                      <div key={it.sku} className="flex justify-between">
                        <span className="line-clamp-1">{it.title}</span>
                        <span className="shrink-0 pl-3">{it.boxes} кор. · от {formatPrice(it.basePrice)}</span>
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
