"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { playClickSound, playSuccessSound } from "@/lib/feedback";

const SIZES = [
  { id: "S",   label: "S",   dims: "200×200×100 мм", scale: 0.46 },
  { id: "M",   label: "M",   dims: "230×260×100 мм", scale: 0.58 },
  { id: "L",   label: "L",   dims: "280×330×120 мм", scale: 0.7 },
  { id: "XL",  label: "XL",  dims: "150×360×120 мм", scale: 0.78 },
  { id: "XXL", label: "XXL", dims: "560×410×240 мм", scale: 1 },
] as const;

const SHAPES = [
  { id: "standard", label: "Стандартный", widthRatio: 1 },
  { id: "narrow",   label: "Узкий",       widthRatio: 0.62 },
  { id: "wide",     label: "Широкий",     widthRatio: 1.35 },
  { id: "square",   label: "Квадратный",  widthRatio: 1.05 },
] as const;

const MATERIALS = [
  { id: "laminated", label: "Ламинированная бумага", sheen: 0.18 },
  { id: "kraft",      label: "Крафт",                  sheen: 0 },
  { id: "matte",       label: "Мелованная бумага",     sheen: 0.06 },
  { id: "lux",         label: "Люкс с тиснением",       sheen: 0.32 },
  { id: "textile",     label: "Текстиль",               sheen: 0.02 },
] as const;

const HANDLES = [
  { id: "cord",   label: "Крученый шнур" },
  { id: "ribbon", label: "Лента" },
  { id: "flat",   label: "Плоская ручка" },
  { id: "none",   label: "Без ручки" },
] as const;

const FINISHES = [
  { id: "full-color", label: "Полноцветная печать" },
  { id: "foil",       label: "Тиснение фольгой" },
  { id: "embossed",    label: "Конгрев (без цвета)" },
] as const;

const LOGO_POSITIONS = [
  { id: "center", label: "По центру" },
  { id: "corner",  label: "В углу" },
  { id: "repeat",  label: "Повтором" },
  { id: "bottom",  label: "Внизу" },
] as const;

const COLORS = [
  { id: "dark",    hex: "#1f2937", label: "Графит" },
  { id: "red",     hex: "#dc2626", label: "Красный" },
  { id: "orange",  hex: "#f97316", label: "Оранжевый" },
  { id: "green",   hex: "#16a34a", label: "Зелёный" },
  { id: "blue",    hex: "#2563eb", label: "Синий" },
  { id: "purple",  hex: "#7c3aed", label: "Фиолетовый" },
  { id: "pink",    hex: "#db2777", label: "Розовый" },
  { id: "cream",   hex: "#f5f5f0", label: "Крафт" },
  { id: "white",   hex: "#ffffff", label: "Белый" },
] as const;

const DESIGN_SKINS = [
  { id: "none",        label: "Без рисунка",               image: null },
  { id: "snezh-tree",  label: "Снежные грёзы — Ёлка",       image: "/products/snezhnie/design-tree.webp" },
  { id: "snezh-diam",  label: "Снежные грёзы — Ромб",       image: "/products/snezhnie/design-diamond.webp" },
  { id: "mand-classic",label: "Мандариновая — С Новым годом", image: "/products/mandarinka/design-mandarinka.webp" },
  { id: "mand-family", label: "Мандариновая — Семейный праздник", image: "/products/mandarinka/design-family.webp" },
  { id: "winter-1",    label: "Зимняя сказка — Эскиз 1",    image: "/products/newyear/ny-001.webp" },
  { id: "winter-2",    label: "Зимняя сказка — Эскиз 2",    image: "/products/newyear/ny-002.webp" },
  { id: "winter-4",    label: "Зимняя сказка — Эскиз 4",    image: "/products/newyear/ny-004.webp" },
  { id: "gold-1",      label: "Christmas Gold — Эскиз 3",   image: "/products/newyear/ny-003.webp" },
  { id: "gold-2",      label: "Christmas Gold — Эскиз 6",   image: "/products/newyear/ny-006.webp" },
  { id: "gold-3",      label: "Christmas Gold — Эскиз 9",   image: "/products/newyear/ny-009.webp" },
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
      <svg width="26" height="76" viewBox="0 0 24 70" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 2h6v9c0 2.5 2 3.5 2 7v46a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V18c0-3.5 2-4.5 2-7V2Z" />
        <line x1="9" y1="2" x2="15" y2="2" />
      </svg>
    );
  }
  if (icon === "shoebox") {
    return (
      <svg width="68" height="29" viewBox="0 0 60 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="6" width="56" height="16" rx="1" />
        <path d="M2 6 8 2h44l6 4" />
      </svg>
    );
  }
  if (icon === "guitar") {
    return (
      <svg width="42" height="128" viewBox="0 0 50 150" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="20" cy="105" rx="16" ry="20" />
        <line x1="20" y1="70" x2="20" y2="2" />
        <line x1="14" y1="123" x2="8" y2="148" />
        <line x1="26" y1="123" x2="32" y2="148" />
      </svg>
    );
  }
  return (
    <svg width="140" height="91" viewBox="0 0 200 130" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="40" cy="95" r="30" />
      <circle cx="160" cy="95" r="30" />
      <line x1="40" y1="95" x2="100" y2="40" />
      <line x1="100" y1="40" x2="160" y2="95" />
      <line x1="100" y1="40" x2="75" y2="95" />
      <line x1="75" y1="95" x2="40" y2="95" />
    </svg>
  );
}

function SwatchRow<T extends { id: string; label: string }>({
  title, options, value, onChange,
}: { title: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button key={opt.id} onClick={() => onChange(opt)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              value.id === opt.id ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-600 hover:border-orange-300"
            }`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ConstructorPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [size, setSize] = useState<typeof SIZES[number]>(SIZES[2]);
  const [shape, setShape] = useState<typeof SHAPES[number]>(SHAPES[0]);
  const [material, setMaterial] = useState<typeof MATERIALS[number]>(MATERIALS[0]);
  const [handle, setHandle] = useState<typeof HANDLES[number]>(HANDLES[0]);
  const [finish, setFinish] = useState<typeof FINISHES[number]>(FINISHES[0]);
  const [color, setColor] = useState<typeof COLORS[number]>(COLORS[0]);
  const [skin, setSkin] = useState<typeof DESIGN_SKINS[number]>(DESIGN_SKINS[0]);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoPos, setLogoPos] = useState<typeof LOGO_POSITIONS[number]>(LOGO_POSITIONS[0]);
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
          shape: shape.label,
          material: material.label,
          handle: handle.label,
          finish: finish.label,
          color: color.label,
          design: skin.label,
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

  // Геометрия пакета построена так, чтобы отражать реальные пропорции:
  // фронтальная грань почти прямоугольная (минимальное сужение книзу),
  // плюс видимая боковая грань (gusset) справа для ощущения объёма —
  // как у настоящего бумажного пакета, а не плоской трапеции.
  const baseW = 150 * shape.widthRatio;   // ширина фронтальной грани
  const sideW = baseW * 0.22;             // ширина боковой грани (объём)
  const baseH = 230;                      // высота корпуса
  const topY = 56;                        // где начинается корпус (под ручками)
  const bottomY = baseH - 8;
  const taper = baseW * 0.035;            // едва заметное сужение книзу — у реальных пакетов почти прямые стенки

  const totalW = baseW + sideW;
  const svgW = totalW * size.scale * 1.5;
  const svgH = baseH * size.scale * 1.5;

  const frontLeft = 4;
  const frontRight = frontLeft + baseW;
  const sideRight = frontRight + sideW;

  const logoBoxW = Math.min(44, baseW * 0.32);
  const logoBoxX = frontLeft + (baseW - logoBoxW) / 2;

  return (
    <div className="container py-8">
      <span className="chip">Конструктор</span>
      <h1 className="heading mt-3 text-3xl">Визуализация фирменного пакета</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-500">
        Соберите пакет из формы, материала, отделки, цвета или готового дизайна коллекции и своего логотипа — и сразу увидите, как будет смотреться партия.
        Это визуализация для понимания внешнего вида, а не готовый макет для печати — финальные файлы готовит наш дизайнер после согласования.
      </p>

      {submitted ? (
        <div className="mt-8 rounded-2xl bg-gray-50 p-10 text-center">
          <p className="text-lg font-bold text-gray-900">Заявка отправлена</p>
          <p className="mt-2 text-sm text-gray-500">Менеджер свяжется с вами, чтобы обсудить тираж брендированной партии.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="order-1 flex min-h-[460px] flex-col items-center justify-center rounded-2xl bg-gray-50 p-8 lg:order-1 lg:min-h-[600px]">
            <div className="flex flex-1 items-center justify-center gap-12">
              <div className="flex flex-col items-center">
                <svg width={svgW} height={svgH} viewBox={`0 0 ${totalW} ${baseH}`} className="drop-shadow-xl">
                  <defs>
                    {/* Контур фронтальной грани — почти прямоугольник с едва заметным сужением книзу */}
                    <clipPath id="bagClipFront">
                      <path d={`M${frontLeft} ${topY} L${frontRight} ${topY} L${frontRight - taper} ${bottomY} L${frontLeft + taper} ${bottomY} Z`} />
                    </clipPath>
                    <clipPath id="bagClipSide">
                      <path d={`M${frontRight} ${topY} L${sideRight} ${topY + 4} L${sideRight - taper * 0.6} ${bottomY} L${frontRight - taper} ${bottomY} Z`} />
                    </clipPath>
                    {logo && (
                      <clipPath id="logoClip">
                        {logoPos.id === "corner" ? (
                          <rect x={frontLeft + 8} y={topY + 10} width={logoBoxW * 0.7} height={logoBoxW * 0.7} rx="3" />
                        ) : logoPos.id === "bottom" ? (
                          <rect x={logoBoxX} y={bottomY - 50} width={logoBoxW} height={logoBoxW} rx="4" />
                        ) : (
                          <rect x={logoBoxX} y={baseH * 0.46} width={logoBoxW} height={logoBoxW} rx="4" />
                        )}
                      </clipPath>
                    )}
                    <linearGradient id="foilGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                      <stop offset="50%" stopColor="#FFD700" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* ── Боковая грань (объём) — рисуется первой, чуть темнее фронтальной ── */}
                  <path d={`M${frontRight} ${topY} L${sideRight} ${topY + 4} L${sideRight - taper * 0.6} ${bottomY} L${frontRight - taper} ${bottomY} Z`}
                    fill={skin.image ? "#d1d5db" : color.hex}
                    opacity={skin.image ? 1 : 0.72} />
                  {skin.image && (
                    <image href={skin.image} x={frontRight - 14} y={topY - 4} width={sideW + 28} height={bottomY - topY + 8}
                      clipPath="url(#bagClipSide)" preserveAspectRatio="xMidYMid slice" opacity="0.85" />
                  )}
                  <rect x={frontRight} y={topY} width={sideW} height={bottomY - topY} fill="#000" opacity="0.1" clipPath="url(#bagClipSide)" />

                  {/* ── Фронтальная грань ── */}
                  <path d={`M${frontLeft} ${topY} L${frontRight} ${topY} L${frontRight - taper} ${bottomY} L${frontLeft + taper} ${bottomY} Z`}
                    fill={skin.image ? "#e5e7eb" : color.hex}
                    stroke={color.id === "white" ? "#e5e7eb" : "none"} strokeWidth="1" />

                  {skin.image && (
                    <image href={skin.image} x={frontLeft - 10} y={topY - 6} width={baseW + 20} height={bottomY - topY + 10}
                      clipPath="url(#bagClipFront)" preserveAspectRatio="xMidYMid slice" />
                  )}

                  {/* Кант — место сгиба бумаги сверху */}
                  <rect x={frontLeft} y={topY} width={baseW} height="13" fill="#000" opacity="0.12" clipPath="url(#bagClipFront)" />
                  <rect x={frontRight} y={topY} width={sideW} height="13" fill="#000" opacity="0.16" clipPath="url(#bagClipSide)" />

                  {/* Линия сгиба между гранями — едва заметная вертикаль, передаёт объём */}
                  <line x1={frontRight} y1={topY} x2={frontRight - taper} y2={bottomY} stroke="#000" strokeOpacity="0.15" strokeWidth="1" />

                  {material.sheen > 0 && (
                    <rect x={frontLeft} y={topY} width={baseW * 0.32} height={bottomY - topY}
                      fill="#fff" opacity={material.sheen} clipPath="url(#bagClipFront)" />
                  )}

                  {finish.id === "foil" && (
                    <rect x={frontLeft} y={topY} width={baseW} height={bottomY - topY}
                      fill="url(#foilGrad)" opacity="0.25" clipPath="url(#bagClipFront)" />
                  )}

                  {/* ── Ручки — две раздельные петли, как у настоящего пакета ── */}
                  {handle.id === "cord" && (
                    <>
                      <path d={`M${frontLeft + baseW * 0.22} ${topY} C${frontLeft + baseW * 0.18} ${topY - 30} ${frontLeft + baseW * 0.42} ${topY - 30} ${frontLeft + baseW * 0.42} ${topY}`}
                        fill="none" stroke={skin.image ? "#92400e" : color.id === "white" ? "#9ca3af" : color.hex} strokeWidth="5" strokeLinecap="round" />
                      <path d={`M${frontLeft + baseW * 0.58} ${topY} C${frontLeft + baseW * 0.58} ${topY - 30} ${frontLeft + baseW * 0.82} ${topY - 30} ${frontLeft + baseW * 0.78} ${topY}`}
                        fill="none" stroke={skin.image ? "#92400e" : color.id === "white" ? "#9ca3af" : color.hex} strokeWidth="5" strokeLinecap="round" />
                    </>
                  )}
                  {handle.id === "ribbon" && (
                    <>
                      <path d={`M${frontLeft + baseW * 0.22} ${topY} C${frontLeft + baseW * 0.2} ${topY - 26} ${frontLeft + baseW * 0.4} ${topY - 26} ${frontLeft + baseW * 0.4} ${topY}`}
                        fill="none" stroke="#dc2626" strokeWidth="7" />
                      <path d={`M${frontLeft + baseW * 0.6} ${topY} C${frontLeft + baseW * 0.6} ${topY - 26} ${frontLeft + baseW * 0.8} ${topY - 26} ${frontLeft + baseW * 0.78} ${topY}`}
                        fill="none" stroke="#dc2626" strokeWidth="7" />
                    </>
                  )}
                  {handle.id === "flat" && (
                    <>
                      <path d={`M${frontLeft + baseW * 0.22} ${topY} L${frontLeft + baseW * 0.22} ${topY - 18} L${frontLeft + baseW * 0.4} ${topY - 18} L${frontLeft + baseW * 0.4} ${topY}`}
                        fill="none" stroke={color.id === "white" ? "#9ca3af" : color.hex} strokeWidth="6" strokeLinecap="round" />
                      <path d={`M${frontLeft + baseW * 0.6} ${topY} L${frontLeft + baseW * 0.6} ${topY - 18} L${frontLeft + baseW * 0.78} ${topY - 18} L${frontLeft + baseW * 0.78} ${topY}`}
                        fill="none" stroke={color.id === "white" ? "#9ca3af" : color.hex} strokeWidth="6" strokeLinecap="round" />
                    </>
                  )}

                  {logo ? (
                    logoPos.id === "repeat" ? (
                      <>
                        {[0, 1, 2].map(i => (
                          <image key={i} href={logo}
                            x={frontLeft + 10 + i * (logoBoxW * 0.5)} y={baseH * 0.36} width={logoBoxW * 0.4} height={logoBoxW * 0.4}
                            clipPath="url(#bagClipFront)" preserveAspectRatio="xMidYMid slice" opacity="0.95" />
                        ))}
                      </>
                    ) : logoPos.id === "corner" ? (
                      <>
                        <rect x={frontLeft + 8} y={topY + 10} width={logoBoxW * 0.7} height={logoBoxW * 0.7} rx="3" fill="#fff" opacity="0.92" />
                        <image href={logo} x={frontLeft + 8} y={topY + 10} width={logoBoxW * 0.7} height={logoBoxW * 0.7}
                          clipPath="url(#logoClip)" preserveAspectRatio="xMidYMid slice" />
                      </>
                    ) : logoPos.id === "bottom" ? (
                      <>
                        <rect x={logoBoxX} y={bottomY - 50} width={logoBoxW} height={logoBoxW} rx="4" fill="#fff" opacity="0.92" />
                        <image href={logo} x={logoBoxX} y={bottomY - 50} width={logoBoxW} height={logoBoxW}
                          clipPath="url(#logoClip)" preserveAspectRatio="xMidYMid slice" />
                      </>
                    ) : (
                      <>
                        <rect x={logoBoxX} y={baseH * 0.46} width={logoBoxW} height={logoBoxW} rx="4" fill="#fff" opacity="0.92" />
                        <image href={logo} x={logoBoxX} y={baseH * 0.46} width={logoBoxW} height={logoBoxW}
                          clipPath="url(#logoClip)" preserveAspectRatio="xMidYMid slice" />
                      </>
                    )
                  ) : (
                    !skin.image && (
                      <>
                        <rect x={logoBoxX} y={baseH * 0.46} width={logoBoxW} height={logoBoxW} rx="4" fill="#ffffff" opacity="0.9" />
                        <text x={frontLeft + baseW / 2} y={baseH * 0.46 + logoBoxW / 2 + 3} fontSize="10" fill="#999" textAnchor="middle">LOGO</text>
                      </>
                    )
                  )}
                </svg>
                <span className="mt-4 text-sm font-semibold text-gray-700">
                  Пакет {size.label} · {shape.label} · {material.label}
                </span>
              </div>

              <div className="hidden shrink-0 flex-col items-center text-gray-300 sm:flex">
                <ScaleRefIcon icon={activeRef.icon} />
                <span className="mt-2 text-xs text-gray-400">{activeRef.name}</span>
              </div>
            </div>
            <p className="mt-4 text-center text-[11px] text-gray-400">
              Визуализация приблизительная — финальный вид зависит от способа нанесения логотипа и материала
            </p>
          </div>

          <div className="order-2 space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:order-2 lg:max-h-[600px] lg:overflow-y-auto">
            <SwatchRow title="Размер" options={SIZES} value={size} onChange={setSize} />
            <p className="-mt-3 text-[11px] text-gray-400">{size.dims}</p>

            <SwatchRow title="Форма" options={SHAPES} value={shape} onChange={setShape} />
            <SwatchRow title="Материал" options={MATERIALS} value={material} onChange={setMaterial} />
            <SwatchRow title="Отделка" options={FINISHES} value={finish} onChange={setFinish} />
            <SwatchRow title="Ручка" options={HANDLES} value={handle} onChange={setHandle} />

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Готовый дизайн коллекции</p>
              <div className="grid grid-cols-4 gap-1.5">
                {DESIGN_SKINS.map(d => (
                  <button key={d.id} onClick={() => setSkin(d)} title={d.label}
                    className={`flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 transition ${
                      skin.id === d.id ? "border-orange-500" : "border-gray-100 hover:border-gray-300"
                    }`}>
                    {d.image ? (
                      <div className="relative h-full w-full">
                        <Image src={d.image} alt={d.label} fill className="object-cover" />
                      </div>
                    ) : (
                      <span className="text-[8px] text-gray-400">Без узора</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-gray-400">{skin.label}</p>
            </div>

            {skin.id === "none" && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Цвет пакета</p>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button key={c.id} onClick={() => setColor(c)}
                      title={c.label}
                      className={`h-8 w-8 rounded-full border-2 transition ${color.id === c.id ? "border-gray-900 scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c.hex, boxShadow: c.id === "cream" || c.id === "white" ? "inset 0 0 0 1px #e5e7eb" : undefined }} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Ваш логотип</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-500">
                {logo ? "Заменить файл" : "Загрузить файл"}
              </button>
              {logo && (
                <>
                  <button onClick={() => setLogo(null)} className="mt-1.5 text-xs text-gray-400 hover:text-red-500">
                    Убрать логотип
                  </button>
                  <div className="mt-3">
                    <SwatchRow title="Размещение лого" options={LOGO_POSITIONS} value={logoPos} onChange={setLogoPos} />
                  </div>
                </>
              )}
            </div>

            <button onClick={submitRequest} disabled={submitting}
              className="ripple-container w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-60">
              {submitting ? "Отправляем…" : "Отправить запрос на брендирование"}
            </button>
            {!user && <p className="text-[11px] text-gray-400">Заявку можно отправить и без входа — мы запросим контакты дополнительно.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
