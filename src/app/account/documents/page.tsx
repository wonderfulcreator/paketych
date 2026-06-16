"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { formatPrice } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  invoice: "Счёт", waybill: "Накладная", offer: "Коммерческое предложение",
  contract: "Договор", other: "Документ",
};
const TYPE_ICONS: Record<string, string> = {
  invoice: "M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
  waybill: "M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-5-5ZM16 3v5h5",
  offer: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z",
  contract: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  other: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z",
};

type Doc = { id: number; type: string; title: string; file_url: string; created_at: string; order_id: string };
type OrderRef = { order_id: string; created_at: string; total_final: string };

export default function DocumentsPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [orders, setOrders] = useState<OrderRef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !user) router.replace("/login?redirect=/account/documents");
  }, [ready, user, router]);

  useEffect(() => {
    fetch("/api/documents", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data.ok) { setDocuments(data.documents ?? []); setOrders(data.orders ?? []); }
      })
      .finally(() => setLoading(false));
  }, []);

  if (!ready || !user) return <div className="container py-12 text-gray-400">Загрузка…</div>;

  return (
    <div className="container py-8">
      <Link href="/account" className="text-sm text-gray-400 hover:text-orange-500">← Личный кабинет</Link>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-gray-900">Документы</h1>
      <p className="mt-1 text-sm text-gray-500">
        Коммерческие предложения, счета и накладные по заказам компании «{user.company}».
      </p>

      {loading ? (
        <div className="mt-6 text-sm text-gray-400">Загрузка…</div>
      ) : (
        <>
          {/* Загруженные документы (счета, накладные — заполняются менеджером или из 1С) */}
          {documents.length > 0 && (
            <div className="mt-6 space-y-2">
              {documents.map(doc => (
                <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-orange-200">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={TYPE_ICONS[doc.type] ?? TYPE_ICONS.other}/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900">{doc.title}</div>
                    <div className="text-xs text-gray-400">
                      {TYPE_LABELS[doc.type] ?? doc.type} · заказ {doc.order_id} · {new Date(doc.created_at).toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M7 17 17 7M7 7h10v10"/>
                  </svg>
                </a>
              ))}
            </div>
          )}

          {/* КП — генерируются автоматически для каждого заказа */}
          <h2 className="mt-8 font-display text-lg font-bold text-gray-900">Коммерческие предложения по заказам</h2>
          {orders.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center text-gray-400">
              Заказов пока нет.{" "}
              <Link href="/catalog" className="text-orange-500 hover:underline underline-offset-4">Перейти в каталог</Link>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {orders.map(o => (
                <a key={o.order_id} href={`/api/orders/${o.order_id}/pdf`} download
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-orange-200">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900">КП по заказу {o.order_id}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(o.created_at).toLocaleDateString("ru-RU")} · {formatPrice(parseFloat(o.total_final))}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-orange-500">Скачать PDF</span>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
