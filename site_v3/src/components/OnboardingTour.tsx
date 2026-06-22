"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";

const STORAGE_KEY = "pp_onboarding_done";

type Step = {
  target: string;       // значение data-tour
  title: string;
  text: string;
  placement: "bottom" | "top";
};

const STEPS: Step[] = [
  {
    target: "catalog",
    title: "Каталог товаров",
    text: "Здесь все размеры и дизайны пакетов. Используйте фильтры слева — по размеру, цвету бренда и поводу.",
    placement: "bottom",
  },
  {
    target: "search",
    title: "Быстрый поиск",
    text: "Ищите по названию или артикулу. Подсказка: ⌘K (или Ctrl+K) фокусирует поиск из любого места сайта.",
    placement: "bottom",
  },
  {
    target: "cart",
    title: "Корзина и скидки",
    text: "Собирайте заказ здесь — скидка до 25% применяется автоматически при увеличении суммы заказа.",
    placement: "bottom",
  },
  {
    target: "account",
    title: "Личный кабинет",
    text: "Здесь — история заказов, документы и команда. Пригласите коллег, чтобы видеть общие заказы компании.",
    placement: "bottom",
  },
];

function getTargetRect(selector: string): DOMRect | null {
  const el = document.querySelector<HTMLElement>(`[data-tour="${selector}"]`);
  return el ? el.getBoundingClientRect() : null;
}

export function OnboardingTour() {
  const { user, ready } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => setMounted(true), []);

  // Запускаем тур только для авторизованного пользователя, один раз
  useEffect(() => {
    if (!ready || !user) return;
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        // Небольшая задержка — даём странице и хедеру отрендериться
        const t = setTimeout(() => setActive(true), 600);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [ready, user]);

  const updateRect = useCallback(() => {
    const step = STEPS[stepIdx];
    if (!step) return;
    setRect(getTargetRect(step.target));
  }, [stepIdx]);

  useEffect(() => {
    if (!active) return;
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [active, updateRect]);

  function finish() {
    setActive(false);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
  }

  function next() {
    if (stepIdx < STEPS.length - 1) setStepIdx(i => i + 1);
    else finish();
  }

  if (!mounted || !active) return null;

  const step = STEPS[stepIdx];
  const PADDING = 8;

  return createPortal(
    <div className="fixed inset-0 z-[200]" role="dialog" aria-label="Обзор возможностей сайта">
      {/* Затемнение с вырезом под целевой элемент */}
      <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - PADDING} y={rect.top - PADDING}
                width={rect.width + PADDING * 2} height={rect.height + PADDING * 2}
                rx={12} fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(15,15,15,0.55)" mask="url(#tour-mask)" />
      </svg>

      {/* Подсветка-рамка вокруг цели */}
      {rect && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute rounded-2xl ring-2 ring-orange-400"
          style={{
            left: rect.left - PADDING, top: rect.top - PADDING,
            width: rect.width + PADDING * 2, height: rect.height + PADDING * 2,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Карточка подсказки */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIdx}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="absolute w-[300px] rounded-2xl bg-white p-4 shadow-2xl"
          style={
            rect
              ? {
                  top: Math.min(rect.bottom + 16, window.innerHeight - 200),
                  left: Math.min(Math.max(rect.left, 16), window.innerWidth - 316),
                }
              : { top: "40%", left: "50%", transform: "translate(-50%,-50%)" }
          }
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-500">Шаг {stepIdx + 1} из {STEPS.length}</span>
            <button onClick={finish} aria-label="Закрыть обзор"
              className="text-gray-300 transition hover:text-gray-500">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <h3 className="mt-1.5 font-display text-base font-bold text-gray-900">{step.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">{step.text}</p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === stepIdx ? "bg-orange-500" : "bg-gray-200"}`} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={finish}
                className="text-xs font-semibold text-gray-400 transition hover:text-gray-600">
                Пропустить
              </button>
              <button onClick={next}
                className="rounded-full bg-orange-500 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-orange-600">
                {stepIdx < STEPS.length - 1 ? "Далее" : "Готово"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
