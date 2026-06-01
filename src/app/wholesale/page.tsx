import Link from "next/link";

export const metadata = { title: "Оптовым клиентам — Пакет Пакетыч" };

const faq = [
  { q: "Какой минимальный заказ?", a: "От 1 коробки любой позиции. Это удобно как для крупных сетей, так и для небольших магазинов." },
  { q: "Как формируется цена?", a: "На сайте указана базовая цена. Окончательная оптовая цена зависит от объёма и формируется менеджером в коммерческом предложении после вашей заявки." },
  { q: "Как происходит доставка?", a: "Отгружаем транспортными компаниями по всей России. Доставку до терминала ТК организуем сами, далее — по тарифам перевозчика." },
  { q: "Какие условия оплаты?", a: "Работаем по предоплате и по договору для постоянных клиентов. Условия обсуждаются индивидуально с менеджером." },
];

export default function WholesalePage() {
  return (
    <div className="container py-8">
      <span className="paper-chip">Опт</span>
      <h1 className="brand-heading mt-3 text-3xl">Оптовым клиентам</h1>
      <p className="mt-1 max-w-2xl text-sm text-inkSoft">
        Прозрачные условия работы и персональный подход к каждому заказчику.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { n: "От 1 коробки", l: "минимальная партия" },
          { n: "По всей РФ", l: "доставка ТК" },
          { n: "Менеджер", l: "персональное сопровождение" },
        ].map((m) => (
          <div key={m.l} className="paper-card-soft p-5 text-center">
            <div className="font-display text-2xl font-extrabold text-flameDeep">{m.n}</div>
            <div className="mt-1 text-sm text-inkSoft">{m.l}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Как заказать</h2>
          <ol className="mt-4 space-y-3">
            {[
              "Зарегистрируйтесь на сайте — это займёт минуту.",
              "Соберите нужные позиции в каталоге и добавьте в заявку.",
              "Отправьте заявку — менеджер свяжется и пришлёт КП с ценами.",
              "Подтвердите заказ, оплатите и получите отгрузку.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-flame text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-sm text-inkSoft">{step}</span>
              </li>
            ))}
          </ol>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">Частые вопросы</h2>
          <div className="mt-4 space-y-3">
            {faq.map((f) => (
              <details key={f.q} className="rounded-brand border border-line/70 bg-paper p-4">
                <summary className="cursor-pointer font-semibold text-ink">{f.q}</summary>
                <p className="mt-2 text-sm text-inkSoft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <aside className="paper-card h-fit p-6 text-center">
          <h3 className="font-display text-lg font-bold text-ink">Готовы начать?</h3>
          <p className="mt-2 text-sm text-inkSoft">
            Зарегистрируйтесь и оформите первую заявку.
          </p>
          <Link href="/register" className="btn-primary mt-4 w-full">
            Регистрация
          </Link>
          <Link href="/catalog" className="btn-ghost mt-2 w-full">
            В каталог
          </Link>
        </aside>
      </div>
    </div>
  );
}
