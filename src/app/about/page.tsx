import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "О бренде — Пакет Пакетыч" };

export default function AboutPage() {
  return (
    <div className="container py-8">
      <div className="paper-card overflow-hidden">
        <div className="grid items-center gap-6 p-8 md:grid-cols-2 md:p-12">
          <div>
            <span className="paper-chip">О бренде</span>
            <h1 className="brand-heading mt-4 text-4xl leading-tight">
              Делаем упаковку, которой хочется дарить
            </h1>
            <p className="mt-4 text-base leading-7 text-inkSoft">
              Пакет Пакетыч — производитель подарочной упаковки для розничных
              сетей и оптовых закупщиков. Мы соединяем яркий дизайн, качественные
              материалы и удобные условия работы от 1 коробки.
            </p>
          </div>
          <Image
            src="/brand/team-hero.png"
            alt="Пакет Пакетыч"
            width={799}
            height={306}
            className="h-auto w-full"
          />
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { t: "Качество материалов", d: "Плотная мелованная бумага, золотое тиснение, атласные ленты. Упаковка держит форму и выглядит дорого." },
          { t: "Свой дизайн", d: "Собственная студия рисует коллекции под тренды сезона. Новогодние серии «Зимняя сказка» и «Christmas Gold» — пример свежих работ." },
          { t: "Удобный опт", d: "Минимальный заказ от 1 коробки, персональный менеджер, доставка по всей России транспортными компаниями." },
        ].map((v) => (
          <div key={v.t} className="paper-card p-6">
            <h3 className="font-display text-lg font-bold text-ink">{v.t}</h3>
            <p className="mt-2 text-sm leading-6 text-inkSoft">{v.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/catalog" className="btn-primary">Смотреть каталог</Link>
      </div>
    </div>
  );
}
