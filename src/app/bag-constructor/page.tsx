"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { playClickSound, playSuccessSound } from "@/lib/feedback";

const SIZES = [
  { id: "S",   label: "S",   dims: "200×200×100 мм", scale: 0.5 },
  { id: "M",   label: "M",   dims: "230×260×100 мм", scale: 0.62 },
  { id: "L",   label: "L",   dims: "280×330×120 мм", scale: 0.72 },
  { id: "XL",  label: "XL",  dims: "150×360×120 мм", scale: 0.78 },
  { id: "XXL", label: "XXL", dims: "560×410×240 мм", scale: 1.05 },
] as const;

const COLORS = [
  { id: "dark",   hex: "#1f2937", label: "Графит" },
  { id: "red",    hex: "#dc2626", label: "Красный" },
  { id: "orange", hex: "#f97316", label: "Оранжевый" },
  { id: "green",  hex: "#16a34a", label: "Зелёный" },
  { id: "cream",  hex: "#f5f5f0", label: "Крафт" },
] as const;

const SCALE_REFS = [
  { name: "Бутылка вина", icon: "wine" },
  { name: "Коробка обуви", icon: "shoebox" },
  { name: "Гитара", icon: "guitar" },
  { name: "Велосипед", icon: "bicycle" },
] as const;

function ScaleRefIcon({ icon }: { icon: string }) {
  if (icon === "wine") {
    return (
      <svg width="22" height="64" viewBox="0 0 24 70" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 2h6v9c0 2.5 2 3.5 2 7v46a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V18c0-3.5 2-4.5 2-7V2Z" />
        <line x1="9" y1="2" x2="15" y2="2" />
      </svg>
    );
  }
  if (icon === "shoebox") {
    return (
      <svg width="56" height="24" viewBox="0 0 60 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="6" width="56" height="16" rx="1" />
        <path d="M2 6 8 2h44l6 4" />
      </svg>
    );
  }
  if (icon === "guitar") {
    return (
      <svg width="36" height="108" viewBox="0 0 50 150" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="20" cy="105" rx="16" ry="20" />
        <line x1="20" y1="70" x2="20" y2="2" />
        <line x1="14" y1="123" x2="8" y2="148" />
        <line x1="26" y1="123" x2="32" y2="148" />
      </svg>
    );
  }
  return (
    <svg width="120" height="78" viewBox="0 0 200 130" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="40" cy="95" r="30" />
      <circle cx="160" cy="95" r="30" />
      <line x1="40" y1="95" x2="100" y2="40" />
      <line x1="100" y1="40" x2="160" y2="95" />
      <line x1="100" y1="40" x2="75" y2="95" />
      <line x1="75" y1="95" x2="40" y2="95" />
    </svg>
  );
}

export default function ConstructorPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [size, setSize] = useState<typeof SIZES[number]>(SIZES[2]);
  const [color, setColor] = useState<typeof COLORS[number]>(COLORS[0]);
  const [logo, setLogo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast("Файл слишком большой — до 4 МБ", "");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function submitRequest() {
    setSubmitting(true);
    playClickSound();
    try {
      await fetch("/api/bag-constructor-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          size: size.id,
          color: color.label,
          hasLogo: !!logo,
        }),
      });
      setSubmitted(true);
      playSuccessSound();
    } catch {
      showToast("Не удалось отправить запрос, попробуйте ещё раз", "");
    } finally {
      setSubmitting(false);
    }
  }

  const refIndex = size.id === "S" ? 0 : size.id === "M" ? 0 : size.id === "L" ? 1 : size.id === "XL" ? 2 : 3;
  const activeRef = SCALE_REFS[refIndex];

  return (
    <div className="container py-8">
      <span className="chip">Конструктор</span>
      <h1 className="heading mt-3 text-3xl">Визуализация фирменного пакета</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-500">
        Выберите размер и цвет, загрузите логотип — и сразу увидите, как будет смотреться брендированная партия.
        Это визуализация для понимания внешнего вида, а не готовый макет для печати — финальные файлы готовит наш дизайнер после согласования.
      </p>

      {submitted ? (
        <div className="mt-8 rounded-2xl bg-gray-50 p-10 text-center">
          <p className="text-lg font-bold text-gray-900">Заявка отправлена</p>
          <p className="mt-2 text-sm text-gray-500">Менеджер свяжется с вами, чтобы обсудить тираж брендированной партии.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Цвет пакета</p>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c.id} onClick={() => setColor(c)}
                    title={c.label}
                    className={`h-8 w-8 rounded-full border-2 transition ${color.id === c.id ? "border-gray-900 scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c.hex, boxShadow: c.id === "cream" ? "inset 0 0 0 1px #e5e7eb" : undefined }} />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Размер</p>
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map(s => (
                  <button key={s.id} onClick={() => setSize(s)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                      size.id === s.id ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-600 hover:border-orange-300"
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-gray-400">{size.dims}</p>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Ваш логотип</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-500">
                {logo ? "Заменить файл" : "Загрузить файл"}
              </button>
              {logo && (
                <button onClick={() => setLogo(null)} className="mt-1.5 text-xs text-gray-400 hover:text-red-500">
                  Убрать логотип
                </button>
              )}
            </div>

            <button onClick={submitRequest} disabled={submitting}
              className="ripple-container w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-60">
              {submitting ? "Отправляем…" : "Отправить запрос на брендирование"}
            </button>
            {!user && <p className="text-[11px] text-gray-400">Заявку можно отправить и без входа — мы запросим контакты дополнительно.</p>}
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 p-8">
            <div className="flex flex-1 items-end justify-center gap-10">
              <div className="flex flex-col items-center">
                <svg width={140 * size.scale} height={190 * size.scale} viewBox="0 0 140 190">
                  <path d="M15 50 L125 50 L118 180 L22 180 Z" fill={color.hex} />
                  <rect x="15" y="50" width="110" height="14" fill="#000" opacity="0.15" />
                  <path d="M45 50 C45 30 95 30 95 50" fill="none" stroke={color.hex} strokeWidth="6" />
                  {logo ? (
                    <>
                      <clipPath id="logoClip"><rect x="50" y="90" width="40" height="40" rx="4" /></clipPath>
                      <rect x="50" y="90" width="40" height="40" rx="4" fill="#fff" />
                      <image href={logo} x="52" y="92" width="36" height="36" clipPath="url(#logoClip)" preserveAspectRatio="xMidYMid slice" />
                    </>
                  ) : (
                    <>
                      <rect x="55" y="95" width="30" height="30" rx="4" fill="#ffffff" opacity="0.9" />
                      <text x="70" y="113" fontSize="9" fill="#999" textAnchor="middle">LOGO</text>
                    </>
                  )}
                </svg>
                <span className="mt-2 text-xs font-semibold text-gray-700">Пакет ({size.label})</span>
              </div>

              <div className="flex flex-col items-center text-gray-300">
                <ScaleRefIcon icon={activeRef.icon} />
                <span className="mt-2 text-xs text-gray-400">{activeRef.name}</span>
              </div>
            </div>
            <p className="mt-4 text-center text-[11px] text-gray-400">
              Визуализация приблизительная — финальный вид зависит от способа нанесения логотипа
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
