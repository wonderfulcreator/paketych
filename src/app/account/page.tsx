"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { formatPrice } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  processing: "В обработке",
  quoted: "КП отправлено",
  done: "Выполнена",
  cancelled: "Отменена",
};

type StoredRequest = {
  id: string;
  createdAt: string;
  status: string;
  comment: string;
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

  if (!ready || !user) return <div className="container py-12 text-gray-500">Загрузка…</div>;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <h1 className="heading text-3xl">Личный кабинет</h1>
        <button onClick={() => { logout(); router.push("/"); }} className="btn-ghost !py-2 !text-xs">
          Выйти
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="card-white h-fit p-5">
          <div className="text-sm text-gray-500">Контактное лицо</div>
          <div className="font-bold text-gray-900">{user.name}</div>
          <div className="mt-3 text-sm text-gray-500">Компания</div>
          <div className="font-bold text-gray-900">{user.company}</div>
          <div className="mt-3 text-sm text-gray-500">Email</div>
          <div className="font-semibold text-gray-900">{user.email}</div>
          <div className="mt-3 text-sm text-gray-500">Телефон</div>
          <div className="font-semibold text-gray-900">{user.phone}</div>
          <Link href="/favorites" className="brand-link mt-5 inline-flex text-sm">
            Избранное →
          </Link>
        </aside>

        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">Мои заявки</h2>
          {requests.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 mt-4 p-8 text-center text-gray-500">
              Заявок пока нет.{" "}
              <Link href="/catalog" className="brand-link">Перейти в каталог</Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="rounded-brand border border-gray-200/70 bg-paper p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-gray-900">{r.id}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                    <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-red-500">
                      {STATUS_LABELS[r.status] || r.status}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    {r.items.map((it) => (
                      <div key={it.sku} className="flex justify-between text-gray-500">
                        <span className="line-clamp-1">{it.title}</span>
                        <span className="shrink-0 pl-3">
                          {it.boxes} кор. · от {formatPrice(it.basePrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {r.comment && (
                    <div className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-xs text-gray-500">
                      {r.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
