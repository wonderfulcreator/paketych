"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const categories = [
  {
    title: "Подарочные пакеты",
    desc: "Базовый и премиальный ассортимент всех размеров",
    href: "/catalog?category=bags",
    image: "/products/newyear/ny-010.webp",
    count: "225 моделей",
    accent: "from-[#e3531d]/85",
  },
  {
    title: "Новогодняя коллекция",
    desc: "Зимняя сказка и Christmas Gold — свежие дизайны",
    href: "/catalog/new",
    image: "/products/newyear/ny-001.webp",
    count: "15 новинок",
    accent: "from-[#1d6e56]/85",
  },
];

export function HomeClient({
  featured,
  fresh,
}: {
  featured: Product[];
  fresh: Product[];
}) {
  return (
    <div className="pb-8 pt-6 md:pt-8">
      {/* HERO */}
      <section className="container">
        <div className="paper-card hero-burst overflow-hidden px-6 py-10 md:px-12 md:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="paper-chip"
              >
                Опт от 1 коробки
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="brand-heading mt-5 max-w-2xl text-4xl leading-[1.05] md:text-6xl"
              >
                Упаковка, которая уже сама выглядит как подарок
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-5 max-w-xl text-base leading-7 text-inkSoft md:text-lg"
              >
                Подарочные пакеты от производителя для розничных сетей и оптовых
                закупщиков. Удобный каталог, актуальный ассортимент и быстрая
                заявка персональному менеджеру.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link href="/catalog" className="btn-primary">
                  Перейти в каталог
                </Link>
                <Link href="/wholesale" className="btn-ghost">
                  Оптовым клиентам
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto flex max-w-sm items-center justify-center"
            >
              <Image
                src="/brand/team-hero.png"
                alt="Пакет Пакетыч"
                width={799}
                height={306}
                priority
                className="h-auto w-full drop-shadow-[0_18px_40px_rgba(176,42,9,0.18)]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* КАТЕГОРИИ — шторки */}
      <section className="container mt-10">
        <div className="grid gap-5 md:grid-cols-2">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
            >
              <Link
                href={cat.href}
                className="group relative block h-72 overflow-hidden rounded-brand border border-line/70 shadow-card md:h-80"
              >
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-110"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${cat.accent} via-black/20 to-transparent`}
                />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
                    {cat.count}
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-extrabold md:text-3xl">
                    {cat.title}
                  </h2>
                  <p className="mt-1 max-w-sm text-sm text-white/90">{cat.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold opacity-0 transition group-hover:opacity-100">
                    Смотреть →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* НОВИНКИ */}
      {fresh.length > 0 && (
        <Section
          title="Новинки коллекции"
          subtitle="Свежие новогодние дизайны: Зимняя сказка и Christmas Gold"
          href="/catalog/new"
          products={fresh}
        />
      )}

      {/* ХИТЫ */}
      {featured.length > 0 && (
        <Section
          title="Хиты продаж"
          subtitle="Самые востребованные модели у наших оптовых клиентов"
          href="/catalog"
          products={featured}
        />
      )}

      {/* ДОВЕРИЕ */}
      <section className="container mt-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "240+", l: "позиций в каталоге" },
            { n: "1 кор.", l: "минимальный заказ" },
            { n: "по РФ", l: "доставка транспортной" },
            { n: "100%", l: "от производителя" },
          ].map((m, i) => (
            <motion.div
              key={m.l}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="paper-card-soft p-5 text-center"
            >
              <div className="font-display text-3xl font-extrabold text-flameDeep">
                {m.n}
              </div>
              <div className="mt-1 text-sm text-inkSoft">{m.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* РАСПРОДАЖА + АКЦИИ */}
      <section className="container mt-10">
        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/catalog/sale"
            className="group relative overflow-hidden rounded-brand border-2 border-flameDeep bg-gradient-to-br from-[#e3531d] to-[#b02a09] p-8 text-white shadow-card"
          >
            <h3 className="font-display text-2xl font-extrabold">Распродажа стока</h3>
            <p className="mt-2 max-w-sm text-sm text-white/90">
              Скидки до 30% на коллекции прошлых сезонов. Отличная цена для
              быстрого пополнения витрины.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold">
              Смотреть распродажу →
            </span>
          </Link>
          <Link
            href="/actions"
            className="group relative overflow-hidden rounded-brand border-2 border-[#c9a227] bg-gradient-to-br from-[#f5c542] to-[#d49a13] p-8 text-flameDeep shadow-card"
          >
            <h3 className="font-display text-2xl font-extrabold">Акции и спецпредложения</h3>
            <p className="mt-2 max-w-sm text-sm text-flameDeep/80">
              Скидка за объём, сезонные подборки и выгодные условия для постоянных
              клиентов.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold">
              Узнать условия →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  href,
  products,
}: {
  title: string;
  subtitle: string;
  href: string;
  products: Product[];
}) {
  return (
    <section className="container mt-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="brand-heading text-2xl md:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-inkSoft">{subtitle}</p>
        </div>
        <Link href={href} className="brand-link">
          Смотреть все →
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
