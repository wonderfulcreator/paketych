import Link from "next/link";

export const metadata = { title: "Оптовым клиентам — Пакет Пакетыч" };

const faq = [
  { q: "Какой минимальный заказ?", a: "От 1 коробки любой позиции. Это удобно как для крупных сетей, так и для небольших магазинов." },
  { q: "Как формируется цена?", a: "На сайте указана базовая цена за коробку. При заказе на сумму от 50 000 ₽ действует прогрессивная скидка — она автоматически рассчитывается в корзине." },
  { q: "Какая система скидок?", a: "До 50 000 ₽ — базовая цена. От 50 000 до 100 000 ₽ — скидка 10%. От 100 000 до 150 000 ₽ — 15%. От 150 000 до 200 000 ₽ — 20%. От 200 000 ₽ — 25%. Скидка считается от суммы всего заказа." },
  { q: "Какие сроки доставки?", a: "Сроки и стоимость доставки уточняются индивидуально после оформления заявки — менеджер свяжется с вами и согласует все детали с учётом региона и объёма." },
  { q: "Как происходит доставка?", a: "Отгружаем транспортными компаниями по всей России. Точные условия — после оформления заявки." },
  { q: "Какие условия оплаты?", a: "Работаем по предоплате и по договору для постоянных клиентов. Условия обсуждаются индивидуально с менеджером." },
];

const discountTiers = [
  { range: "до 50 000 ₽",          discount: "Базовая цена", highlight: false },
  { range: "50 000 – 100 000 ₽",   discount: "−10%", highlight: false },
  { range: "100 000 – 150 000 ₽",  discount: "−15%", highlight: false },
  { range: "150 000 – 200 000 ₽",  discount: "−20%", highlight: false },
  { range: "от 200 000 ₽",          discount: "−25%", highlight: true },
];

export default function WholesalePage() {
  return (
    <div className="container py-8">
      <span className="chip">Опт</span>
      <h1 className="heading mt-3 text-3xl">Оптовым клиентам</h1>
      <p className="mt-1 max-w-2xl text-sm text-gray-500">
        Прозрачные условия работы и персональный подход к каждому заказчику.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { n: "От 1 коробки", l: "минимальная партия" },
          { n: "По всей РФ", l: "доставка ТК" },
          { n: "До −25%", l: "скидка за объём" },
        ].map((m) => (
          <div key={m.l} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center">
            <div className="font-display text-2xl font-extrabold text-red-500">{m.n}</div>
            <div className="mt-1 text-sm text-gray-500">{m.l}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {/* Система скидок */}
          <h2 className="font-display text-xl font-bold text-gray-900">Скидка за объём заказа</h2>
          <p className="mt-1 text-sm text-gray-500">
            Скидка считается автоматически от суммы всего заказа и применяется ко всем позициям в корзине.
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100">
            {discountTiers.map((t) => (
              <div key={t.range}
                className={`flex items-center justify-between px-5 py-3 text-sm ${
                  t.highlight ? "bg-orange-50" : "bg-white"
                } border-b border-gray-100 last:border-b-0`}>
                <span className="font-medium text-gray-700">{t.range}</span>
                <span className={`font-bold ${t.highlight ? "text-orange-600" : "text-gray-900"}`}>
                  {t.discount}
                </span>
              </div>
            ))}
          </div>

          <h2 className="mt-8 font-display text-xl font-bold text-gray-900">Как заказать</h2>
          <ol className="mt-4 space-y-3">
            {[
              "Зарегистрируйтесь на сайте — это займёт минуту.",
              "Соберите нужные позиции в каталоге и добавьте в корзину.",
              "Отправьте корзину — менеджер свяжется и согласует сроки доставки и финальные условия.",
              "Подтвердите заказ, оплатите и получите отгрузку.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-flame text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-sm text-gray-500">{step}</span>
              </li>
            ))}
          </ol>

          <h2 className="mt-8 font-display text-xl font-bold text-gray-900">Частые вопросы</h2>
          <div className="mt-4 space-y-3">
            {faq.map((f) => (
              <details key={f.q} className="rounded-brand border border-gray-200/70 bg-paper p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">{f.q}</summary>
                <p className="mt-2 text-sm text-gray-500">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <aside className="card-white h-fit p-6 text-center">
          <h3 className="font-display text-lg font-bold text-gray-900">Готовы начать?</h3>
          <p className="mt-2 text-sm text-gray-500">
            Зарегистрируйтесь и оформите первую заявку. Сроки и условия доставки менеджер уточнит индивидуально.
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
