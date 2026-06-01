import Link from "next/link";

export const metadata = { title: "Акции — Пакет Пакетыч" };

const actions = [
  {
    title: "Скидка за объём",
    desc: "При заказе от 5 коробок одной коллекции — дополнительная скидка 10% к оптовой цене.",
    until: "Постоянная акция",
    accent: "from-[#e3531d] to-[#b02a09]",
  },
  {
    title: "Новогодняя подборка −15%",
    desc: "Коллекции «Зимняя сказка» и «Christmas Gold» со скидкой при заказе до конца ноября.",
    until: "До 30 ноября",
    accent: "from-[#1d9e75] to-[#0f6e56]",
  },
  {
    title: "Первый заказ",
    desc: "Новым оптовым клиентам — бесплатная доставка до терминала транспортной компании.",
    until: "Для новых клиентов",
    accent: "from-[#f5c542] to-[#d49a13]",
  },
];

export default function ActionsPage() {
  return (
    <div className="container py-8">
      <span className="paper-chip !text-[#b8860b]">Акции</span>
      <h1 className="brand-heading mt-3 text-3xl">Акции и спецпредложения</h1>
      <p className="mt-1 max-w-2xl text-sm text-inkSoft">
        Выгодные условия для оптовых закупок. Чтобы воспользоваться акцией,
        оставьте заявку — менеджер учтёт условия в коммерческом предложении.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {actions.map((a) => (
          <div
            key={a.title}
            className={`flex flex-col rounded-brand border border-line/40 bg-gradient-to-br ${a.accent} p-6 text-white shadow-card`}
          >
            <span className="inline-block w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
              {a.until}
            </span>
            <h2 className="mt-3 font-display text-xl font-extrabold">{a.title}</h2>
            <p className="mt-2 flex-1 text-sm text-white/90">{a.desc}</p>
            <Link href="/catalog" className="mt-4 inline-flex w-fit rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur transition hover:bg-white/30">
              Оставить заявку →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
