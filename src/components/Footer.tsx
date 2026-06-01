import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line/70 bg-cream/70">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div>
          <Image
            src="/brand/logo-main.png"
            alt="Пакет Пакетыч"
            width={130}
            height={120}
            className="h-14 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm leading-6 text-inkSoft">
            Подарочная упаковка от производителя. Опт от 1 коробки. Помогаем
            наполнить витрину красиво и выгодно.
          </p>
        </div>

        <div>
          <h3 className="font-display text-base font-bold text-ink">Каталог</h3>
          <ul className="mt-3 space-y-2 text-sm text-inkSoft">
            <li><Link href="/catalog" className="hover:text-flame">Все товары</Link></li>
            <li><Link href="/catalog/new" className="hover:text-flame">Новинки</Link></li>
            <li><Link href="/catalog/sale" className="hover:text-flame">Распродажа</Link></li>
            <li><Link href="/actions" className="hover:text-flame">Акции</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base font-bold text-ink">Компания</h3>
          <ul className="mt-3 space-y-2 text-sm text-inkSoft">
            <li><Link href="/about" className="hover:text-flame">О бренде</Link></li>
            <li><Link href="/wholesale" className="hover:text-flame">Оптовым клиентам</Link></li>
            <li><Link href="/contact" className="hover:text-flame">Контакты</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base font-bold text-ink">Связаться</h3>
          <ul className="mt-3 space-y-2 text-sm text-inkSoft">
            <li><a href="tel:+79000000000" className="hover:text-flame">8 (900) 000-00-00</a></li>
            <li><a href="mailto:hello@paket-paketych.ru" className="hover:text-flame">hello@paket-paketych.ru</a></li>
            <li className="flex gap-3 pt-1">
              <span className="text-xs">Telegram</span>
              <span className="text-xs">WhatsApp</span>
              <span className="text-xs">VK</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line/60">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-inkSoft sm:flex-row">
          <span>© {new Date().getFullYear()} Пакет Пакетыч. Все права защищены.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-flame">Политика конфиденциальности</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
