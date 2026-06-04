"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─────────────────────────────────────────────────────────────────────
   ParallaxCard — шторка с НАСТОЯЩИМ параллаксом и правильным масштабом
   
   Принцип: фоновое изображение чуть БОЛЬШЕ карточки (scale 1.15 по умолчанию),
   при скролле смещается на ±8% — это и есть параллакс.
   При hover scale растёт до 1.22 — изображение "приближается",
   но никогда не растягивается под размер блока (object-cover только для
   полноформатных lifestyle-фото, для продуктовых — contain с padding).
──────────────────────────────────────────────────────────────────────── */
function ParallaxCard({
  title, desc, cta, href, image, overlay, count, custom = 0, objectPos = "center center", isProduct = false,
}: {
  title: string; desc: string; cta: string; href: string;
  image: string; overlay: string; count: string;
  custom?: number; objectPos?: string; isProduct?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <motion.div ref={ref} custom={custom} initial="hidden" whileInView="show"
      viewport={{ once: true, amount: 0.15 }} variants={fadeUp}
      className="group relative h-80 overflow-hidden rounded-2xl shadow-sm md:h-[380px]">

      {/* Фоновый слой — двигается при скролле, зумится при hover */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.06]">
          <Image
            src={image} alt={title} fill
            sizes="(max-width:768px) 100vw, 50vw"
            className={isProduct
              ? "object-contain p-8"          // продуктовые фото — без обрезки
              : "object-cover"                // lifestyle/паттерн — cover
            }
            style={{ objectPosition: objectPos }}
          />
        </div>
      </motion.div>

      {/* Градиент — всегда поверх */}
      <div className={`absolute inset-0 ${overlay} pointer-events-none`} />

      {/* Контент */}
      <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-7">
        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
          {count}
        </span>
        <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight drop-shadow-sm md:text-[1.65rem]">
          {title}
        </h2>
        <p className="mt-1.5 max-w-xs text-sm text-white/85 leading-relaxed hidden sm:block">{desc}</p>
        <Link href={href}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-bold backdrop-blur-sm transition hover:bg-white/30">
          {cta} <Arrow />
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Полноширинный баннер-мокап ──────────────────────────────────── */
function MockupBanner({ title, subtitle, desc, cta, href, image }: {
  title: string; subtitle: string; desc: string; cta: string; href: string; image: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <motion.div ref={ref} initial="hidden" whileInView="show" custom={0}
      viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
      className="group relative h-60 overflow-hidden rounded-2xl shadow-sm md:h-72">
      <motion.div className="absolute inset-0" style={{ y }}>
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]">
          <Image src={image} alt={title} fill className="object-cover object-center" />
        </div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
      <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-7 md:px-10">
        <span className="inline-block w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {subtitle}
        </span>
        <h3 className="mt-2.5 max-w-sm font-display text-2xl font-extrabold text-white drop-shadow md:text-3xl">
          {title}
        </h3>
        <p className="mt-1.5 max-w-xs text-sm text-white/85">{desc}</p>
        <Link href={href}
          className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/28">
          {cta} <Arrow />
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Секция с товарами ───────────────────────────────────────────── */
function ProductSection({ label, title, subtitle, href, products }: {
  label: string; title: string; subtitle: string; href: string; products: Product[];
}) {
  return (
    <section className="container mt-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-600">
            {label}
          </span>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-gray-900 md:text-3xl">{title}</h2>
          <p className="mt-1 max-w-xl text-sm text-gray-500">{subtitle}</p>
        </div>
        <Link href={href} className="text-sm font-semibold text-orange-500 hover:text-orange-700 hover:underline underline-offset-4 transition">
          Смотреть все →
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

/* ── ГЛАВНАЯ ─────────────────────────────────────────────────────── */
export function HomeClient({ featured, fresh }: { featured: Product[]; fresh: Product[] }) {
  return (
    <div className="pb-8 pt-6 md:pt-10">

      {/* HERO ───────────────────────────────────────────────────── */}
      <section className="container">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white px-6 py-10 shadow-sm md:px-12 md:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <motion.span initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5 }}
                className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-600">
                Оптовые поставки · от 1 коробки
              </motion.span>
              <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.1 }}
                className="mt-4 font-display text-4xl font-extrabold leading-[1.08] text-gray-900 md:text-5xl lg:text-6xl">
                Упаковка, которая говорит сама за себя
              </motion.h1>
              <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.2 }}
                className="mt-4 max-w-xl text-base leading-7 text-gray-500 md:text-lg">
                Подарочные пакеты собственного производства для розничных сетей
                и оптовых закупщиков. Свежие авторские дизайны каждый сезон,
                прозрачные условия поставки и персональный менеджер.
              </motion.p>
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.3 }}
                className="mt-8 flex flex-wrap gap-3">
                <Link href="/catalog" className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-orange-600">
                  Перейти в каталог
                </Link>
                <Link href="/wholesale" className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:border-orange-300 hover:bg-orange-50">
                  Условия оптовикам
                </Link>
              </motion.div>
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:.6, delay:.5 }}
                className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { n:"248+", l:"позиции в каталоге" },
                  { n:"1 кор.", l:"минимальный заказ" },
                  { n:"по РФ", l:"доставка по стране" },
                ].map(m => (
                  <div key={m.l} className="rounded-xl bg-gray-50 p-3 text-center">
                    <div className="font-display text-xl font-extrabold text-orange-500">{m.n}</div>
                    <div className="mt-0.5 text-xs text-gray-500">{m.l}</div>
                  </div>
                ))}
              </motion.div>
            </div>
            <motion.div initial={{ opacity:0, scale:.94 }} animate={{ opacity:1, scale:1 }} transition={{ duration:.7, delay:.2 }}
              className="flex items-center justify-center">
              <Image src="/brand/team-hero.png" alt="Пакет Пакетыч" width={799} height={306} priority
                className="h-auto w-full max-w-sm drop-shadow-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* КОЛЛЕКЦИИ — 6 параллакс-шторок ────────────────────────── */}
      <section className="container mt-10">
        <div className="mb-5">
          <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-600">
            Коллекции
          </span>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-gray-900 md:text-3xl">
            Что вы найдёте в каталоге
          </h2>
        </div>

        {/* Ряд 1: Базовые + НГ — используем коллажи из реальных товаров */}
        <div className="grid gap-4 md:grid-cols-2">
          <ParallaxCard
            custom={0}
            title="Базовые и премиальные пакеты"
            desc="248 моделей от S до XXL: крафт, мелованная бумага, глянец и матовое ламинирование. Для любого повода и масштаба закупки."
            cta="Смотреть весь каталог"
            href="/catalog"
            image="/products/hero-basic-bags.webp"
            overlay="bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent"
            count="248 моделей"
            isProduct={true}
          />
          <ParallaxCard
            custom={1}
            title="Новогодняя коллекция 2025"
            desc="Акварельные пейзажи, золотое тиснение и атласные ленты. Пакеты, которые запоминаются раньше, чем распакован подарок."
            cta="Смотреть новинки"
            href="/catalog/new"
            image="/products/hero-ny-collection.webp"
            overlay="bg-gradient-to-t from-indigo-900/80 via-indigo-900/20 to-transparent"
            count="23 новинки"
            objectPos="center top"
          />
        </div>

        {/* Ряд 2: Мандариновая сказка */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ParallaxCard
            custom={0}
            title="Мандариновая сказка"
            desc="Мандарины, пряники и морозные ветви — тот самый запах праздника. Тёмно-зелёный дизайн «С Новым Годом»."
            cta="Посмотреть коллекцию"
            href="/catalog?q=Мандариновая+сказка&mode=words"
            image="/products/mandarinka/design-mandarinka.webp"
            overlay="bg-gradient-to-t from-emerald-900/80 via-emerald-900/15 to-transparent"
            count="Новинка · 2025"
          />
          <ParallaxCard
            custom={1}
            title="Семейный праздник"
            desc="Семья у ёлки, гирлянды и яркие шары — тёплый иллюстративный стиль на насыщенном красном. Создаёт атмосферу с первого взгляда."
            cta="Посмотреть коллекцию"
            href="/catalog?q=Мандариновая+сказка&mode=words"
            image="/products/mandarinka/design-family.webp"
            overlay="bg-gradient-to-t from-red-900/80 via-red-900/15 to-transparent"
            count="Новинка · 2025"
          />
        </div>

        {/* Баннер Мандариновая сказка */}
        <div className="mt-4">
          <MockupBanner
            title="Мандариновая сказка — уже в каталоге"
            subtitle="Мандариновая сказка · 2025"
            desc="Два дизайна, размеры M и L, розовые атласные ленты. Оформите корзину — менеджер подготовит предложение."
            cta="Оформить заявку"
            href="/catalog?q=Мандариновая+сказка&mode=words"
            image="/products/mandarinka/mockup-both.webp"
          />
        </div>

        {/* Ряд 3: Снежные грёзы */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ParallaxCard
            custom={0}
            title="Снежные грёзы — Желаю счастья"
            desc="Нежная ёлка с розовыми лентами в винтажной рамке на пудровом фоне. Изысканный минимализм для тех, кто ценит детали."
            cta="Посмотреть коллекцию"
            href="/catalog?q=Снежные+грёзы&mode=words"
            image="/products/snezhnie/design-tree.webp"
            overlay="bg-gradient-to-t from-pink-900/75 via-pink-900/10 to-transparent"
            count="Новинка · 2025"
          />
          <ParallaxCard
            custom={1}
            title="Снежные грёзы — Праздничные ромбы"
            desc="Геометрический паттерн в розово-мятной гамме с шарами, бантиками и еловыми ветвями. Яркий и праздничный."
            cta="Посмотреть коллекцию"
            href="/catalog?q=Снежные+грёзы&mode=words"
            image="/products/snezhnie/pattern-diamond.webp"
            overlay="bg-gradient-to-t from-teal-900/75 via-teal-900/10 to-transparent"
            count="Новинка · 2025"
          />
        </div>

        {/* Баннер Снежные грёзы */}
        <div className="mt-4">
          <MockupBanner
            title="Снежные грёзы — пастельная нежность"
            subtitle="Снежные грёзы · 2025"
            desc="Два дизайна, размеры M и L, нежно-розовые и голубые атласные ленты."
            cta="Оформить заявку"
            href="/catalog?q=Снежные+грёзы&mode=words"
            image="/products/snezhnie/mockup-both.webp"
          />
        </div>
      </section>

      {/* НОВИНКИ ─────────────────────────────────────────────────── */}
      {fresh.length > 0 && (
        <ProductSection
          label="Новинки"
          title="Свежие поступления"
          subtitle="«Снежные грёзы», «Мандариновая сказка», «Christmas Gold» и «Зимняя сказка» — все авторские коллекции сезона"
          href="/catalog/new"
          products={fresh.slice(0, 8)}
        />
      )}

      {/* ХИТЫ ───────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <ProductSection
          label="Хиты продаж"
          title="Выбор закупщиков"
          subtitle="Модели, которые стабильно заказывают байеры сетей и владельцы подарочных отделов по всей России"
          href="/catalog"
          products={featured.slice(0, 8)}
        />
      )}

      {/* РАСПРОДАЖА + АКЦИИ ─────────────────────────────────────── */}
      <section className="container mt-16">
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/catalog/sale"
            className="group relative overflow-hidden rounded-2xl border border-red-100 bg-red-50 p-8 transition hover:shadow-md">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-red-100 opacity-60 transition group-hover:scale-125" />
            <div className="relative">
              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-red-600">
                Распродажа
              </span>
              <h3 className="mt-3 font-display text-xl font-extrabold text-gray-900">Остатки сезона — до −30%</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-500">
                Коллекции прошлых сезонов по сниженным ценам. Отличный способ выгодно пополнить витрину и поднять средний чек в подарочном отделе.
              </p>
              <span className="mt-4 inline-flex text-sm font-semibold text-red-500 hover:underline underline-offset-4">
                Смотреть распродажу →
              </span>
            </div>
          </Link>

          <Link href="/actions"
            className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-amber-50 p-8 transition hover:shadow-md">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-amber-100 opacity-60 transition group-hover:scale-125" />
            <div className="relative">
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-700">
                Акции
              </span>
              <h3 className="mt-3 font-display text-xl font-extrabold text-gray-900">Скидка за объём и первый заказ</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-500">
                +10% при заказе от 5 коробок одной коллекции, бесплатная доставка новым клиентам и сезонные спецпредложения.
              </p>
              <span className="mt-4 inline-flex text-sm font-semibold text-amber-600 hover:underline underline-offset-4">
                Узнать об акциях →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* КАК РАБОТАЕТ B2B ─────────────────────────────────────────── */}
      <section className="container mt-16">
        <div className="rounded-2xl bg-gray-50 px-6 py-10 md:px-12">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-600">
              Для оптовиков
            </span>
            <h2 className="mt-3 font-display text-2xl font-extrabold text-gray-900 md:text-3xl">
              Как оформить оптовый заказ
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
              Без звонков «а есть ли в наличии» — всё видно на сайте после быстрой регистрации
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-4">
            {[
              { n:"01", t:"Зарегистрируйтесь", d:"Имя, компания и телефон — 1 минута. После входа откроется статус наличия и кнопка «В корзину»." },
              { n:"02", t:"Добавьте в корзину", d:"Выберите позиции в каталоге. Фильтры по коллекции, размеру и теме помогут быстро найти нужное." },
              { n:"03", t:"Получите КП", d:"Менеджер перезвонит в течение рабочего дня и пришлёт коммерческое предложение с актуальными ценами." },
              { n:"04", t:"Подтвердите и получите", d:"Подтвердите заказ, оплатите удобным способом — отгрузим транспортной компанией по всей России." },
            ].map((step, i) => (
              <motion.div key={step.n} custom={i} initial="hidden" whileInView="show"
                viewport={{ once: true }} variants={fadeUp} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 font-display text-lg font-extrabold text-white shadow-md">
                  {step.n}
                </div>
                <h3 className="font-display text-base font-bold text-gray-900">{step.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{step.d}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-orange-600">
              Зарегистрироваться бесплатно
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

function Arrow() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}
