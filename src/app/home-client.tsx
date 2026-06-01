"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

/* ─── анимация появления ─────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Параллакс-шторка ───────────────────────────────────────────────────── */
function ParallaxCategory({
  title, subtitle, desc, cta, href, image, accent, light, count, custom,
}: {
  title: string; subtitle: string; desc: string; cta: string; href: string;
  image: string; accent: string; light?: boolean; count: string; custom?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Параллакс: фоновая картинка движется медленнее страницы
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <motion.div
      ref={ref}
      custom={custom ?? 0}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={fadeUp}
      className="group relative h-80 overflow-hidden rounded-2xl shadow-card md:h-96"
    >
      {/* Фон с параллаксом + zoom при hover */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <Image
          src={image} alt={title} fill
          sizes="(max-width:768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ objectPosition: "center center" }}
        />
      </motion.div>

      {/* Градиентный оверлей */}
      <div className={`absolute inset-0 bg-gradient-to-t ${accent} via-black/10 to-transparent`} />

      {/* Контент */}
      <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
          {count}
        </span>
        <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight md:text-[1.75rem]">
          {title}
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-white/85 leading-relaxed hidden sm:block">{desc}</p>
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-bold backdrop-blur-sm transition hover:bg-white/30"
        >
          {cta} <ArrowIcon className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Секция с лентой товаров ────────────────────────────────────────────── */
function ProductSection({ title, subtitle, href, label, products }: {
  title: string; subtitle: string; href: string; label: string; products: Product[];
}) {
  return (
    <section className="container mt-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="chip">{label}</span>
          <h2 className="heading mt-2 text-2xl md:text-3xl">{title}</h2>
          <p className="mt-1 max-w-xl text-sm text-gray-500">{subtitle}</p>
        </div>
        <Link href={href} className="brand-link text-sm">Смотреть все →</Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

/* ─── Главная ────────────────────────────────────────────────────────────── */
export function HomeClient({ featured, fresh, mandarinka }: {
  featured: Product[]; fresh: Product[]; mandarinka: Product[];
}) {
  return (
    <div className="pb-8 pt-6 md:pt-10">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="container">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white px-6 py-10 shadow-card md:px-12 md:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <motion.span initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5 }}
                className="chip">
                Оптовые поставки · от 1 коробки
              </motion.span>
              <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.1 }}
                className="heading mt-4 text-4xl leading-[1.08] md:text-5xl lg:text-6xl">
                Упаковка, которая говорит<br className="hidden md:block" /> сама за себя
              </motion.h1>
              <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.2 }}
                className="mt-4 max-w-xl text-base leading-7 text-gray-500 md:text-lg">
                Подарочные пакеты собственного производства для розничных сетей,
                оптовых закупщиков и маркетплейсов. Свежие дизайны каждый сезон,
                прозрачные условия и персональный менеджер на каждую сделку.
              </motion.p>
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.3 }}
                className="mt-8 flex flex-wrap gap-3">
                <Link href="/catalog" className="btn-primary">Перейти в каталог</Link>
                <Link href="/wholesale" className="btn-ghost">Условия оптовикам</Link>
              </motion.div>

              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:.6, delay:.5 }}
                className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { n: "244+", l: "позиции в каталоге" },
                  { n: "1 кор.", l: "минимальный заказ" },
                  { n: "РФ", l: "доставка по стране" },
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

      {/* ── КАТЕГОРИИ — 4 параллакс-шторки ──────────────────────── */}
      <section className="container mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="chip">Коллекции</span>
            <h2 className="heading mt-2 text-2xl md:text-3xl">Что вы найдёте в каталоге</h2>
          </div>
        </div>

        {/* Первые две шторки — крупные */}
        <div className="grid gap-4 md:grid-cols-2">
          <ParallaxCategory
            custom={0}
            title="Базовые и премиальные пакеты"
            subtitle="Весь ассортимент"
            desc="244 модели от S до XXL: крафт, мелованная бумага, глянец и матовое ламинирование. Для любого повода и любого формата бизнеса."
            cta="Смотреть весь каталог"
            href="/catalog"
            image="/products/newyear/ny-010.webp"
            accent="from-orange-900/75"
            count="244 модели"
          />
          <ParallaxCategory
            custom={1}
            title="Новогодняя коллекция 2025"
            subtitle="Зимняя сказка · Christmas Gold"
            desc="Акварельные пейзажи, золотое тиснение и атласные ленты. Пакеты, которые дарят ещё до того, как внутри что-то есть."
            cta="Смотреть новинки"
            href="/catalog/new"
            image="/products/newyear/ny-001.webp"
            accent="from-blue-900/75"
            count="19 новинок"
          />
        </div>

        {/* Ещё две шторки — коллекция Мандариновая сказка */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ParallaxCategory
            custom={0}
            title="Мандариновая сказка"
            subtitle="Новая коллекция · 2 дизайна"
            desc="Мандарины, имбирные пряники и морозные ветви — тот самый аромат праздника. Дизайн «С Новым Годом» на тёмно-зелёном фоне."
            cta="Посмотреть коллекцию"
            href="/catalog?q=Мандариновая+сказка&mode=words"
            image="/products/mandarinka/design-mandarinka.webp"
            accent="from-green-900/80"
            count="Новинка сезона"
          />
          <ParallaxCategory
            custom={1}
            title="Семейный праздник"
            subtitle="Мандариновая сказка · 2 дизайна"
            desc="Семья у ёлки, гирлянды и яркие шары — тёплый иллюстративный стиль на насыщенном красном. Создаёт атмосферу с первого взгляда."
            cta="Посмотреть коллекцию"
            href="/catalog?q=Мандариновая+сказка&mode=words"
            image="/products/mandarinka/design-family.webp"
            accent="from-red-900/75"
            count="Новинка сезона"
          />
        </div>

        {/* Мокап обоих пакетов — полноширинный баннер */}
        <motion.div
          custom={0} initial="hidden" whileInView="show" viewport={{ once:true, amount:0.2 }} variants={fadeUp}
          className="mt-4"
        >
          <Link href="/catalog?q=Мандариновая+сказка&mode=words"
            className="group relative block h-64 overflow-hidden rounded-2xl shadow-card md:h-80">
            <Image src="/products/mandarinka/mockup-both.webp" alt="Мандариновая сказка — оба дизайна" fill
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
            <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-8 md:px-12">
              <span className="inline-block w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                Мандариновая сказка · 2025
              </span>
              <h3 className="mt-3 max-w-xs font-display text-2xl font-extrabold text-white md:text-3xl">
                Новинка уже доступна для заказа
              </h3>
              <p className="mt-2 max-w-xs text-sm text-white/85">
                Два дизайна, размеры M и L, атласные ленты. Заявку оформляет ваш менеджер.
              </p>
              <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition group-hover:bg-white/25">
                Оформить заявку <ArrowIcon className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* ── НОВИНКИ ─────────────────────────────────────────────── */}
      {fresh.length > 0 && (
        <ProductSection
          title="Свежие поступления"
          subtitle="Новогодние коллекции 2025: «Зимняя сказка», «Christmas Gold» и «Мандариновая сказка» — все новинки здесь"
          href="/catalog/new"
          label="Новинки"
          products={fresh.slice(0, 8)}
        />
      )}

      {/* ── ХИТЫ ПРОДАЖ ─────────────────────────────────────────── */}
      {featured.length > 0 && (
        <ProductSection
          title="Хиты продаж"
          subtitle="Модели, которые стабильно выбирают байеры розничных сетей и владельцы магазинов"
          href="/catalog"
          label="Хиты"
          products={featured.slice(0, 8)}
        />
      )}

      {/* ── РАСПРОДАЖА + АКЦИИ — баннеры ─────────────────────────── */}
      <section className="container mt-16">
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/catalog/sale"
            className="group relative overflow-hidden rounded-2xl bg-red-50 border border-red-100 p-8 transition hover:shadow-lift">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-red-100 transition group-hover:scale-110" />
            <div className="relative">
              <span className="chip !bg-red-100 !text-red-600">Распродажа</span>
              <h3 className="heading mt-3 text-xl">Остатки сезона — до −30%</h3>
              <p className="mt-2 max-w-xs text-sm text-gray-500 leading-relaxed">
                Коллекции прошлых сезонов по сниженным ценам. Отличный способ выгодно пополнить витрину и поднять средний чек в подарочном отделе.
              </p>
              <span className="brand-link mt-4 inline-flex text-sm">Смотреть распродажу →</span>
            </div>
          </Link>

          <Link href="/actions"
            className="group relative overflow-hidden rounded-2xl bg-yellow-50 border border-yellow-100 p-8 transition hover:shadow-lift">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-yellow-100 transition group-hover:scale-110" />
            <div className="relative">
              <span className="chip !bg-yellow-100 !text-yellow-700">Акции</span>
              <h3 className="heading mt-3 text-xl">Скидка за объём и первый заказ</h3>
              <p className="mt-2 max-w-xs text-sm text-gray-500 leading-relaxed">
                Дополнительные 10% при заказе от 5 коробок одной коллекции, бесплатная доставка новым клиентам и сезонные спецпредложения.
              </p>
              <span className="brand-link mt-4 inline-flex text-sm">Узнать об акциях →</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── КАК РАБОТАЕТ B2B ─────────────────────────────────────── */}
      <section className="container mt-16">
        <div className="rounded-2xl bg-gray-50 px-6 py-10 md:px-12">
          <div className="text-center">
            <span className="chip">Для оптовиков</span>
            <h2 className="heading mt-3 text-2xl md:text-3xl">Как оформить оптовый заказ</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
              Без звонков «а есть ли в наличии» — всё видно на сайте после быстрой регистрации
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-4">
            {[
              { n:"01", t:"Зарегистрируйтесь", d:"Имя, компания и телефон — 1 минута. После входа вам откроется статус наличия и кнопка «В заявку»." },
              { n:"02", t:"Добавьте в заявку", d:"Выберите нужные позиции прямо в каталоге. Укажите желаемое количество коробок." },
              { n:"03", t:"Получите КП", d:"Менеджер перезвонит в течение рабочего дня и пришлёт коммерческое предложение с актуальными ценами." },
              { n:"04", t:"Подтвердите и получите", d:"Подтвердите заказ, оплатите по удобной форме — мы отгрузим транспортной компанией по РФ." },
            ].map((step, i) => (
              <motion.div key={step.n} custom={i} initial="hidden" whileInView="show"
                viewport={{ once:true }} variants={fadeUp} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 font-display text-lg font-extrabold text-white shadow-md">
                  {step.n}
                </div>
                <h3 className="font-display text-base font-bold text-gray-900">{step.t}</h3>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{step.d}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/register" className="btn-primary">Зарегистрироваться бесплатно</Link>
          </div>
        </div>
      </section>

    </div>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}
