import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-100 bg-gray-50">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div>
          <Image src="/brand/logo-main.png" alt="Пакет Пакетыч" width={120} height={110} className="h-12 w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-gray-500">
            Подарочная упаковка от производителя. Собственные дизайны, оптовые
            поставки по всей России от 1 коробки.
          </p>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-gray-900">Каталог</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li><Link href="/catalog"      className="hover:text-orange-500">Все товары</Link></li>
            <li><Link href="/catalog/new"  className="hover:text-orange-500">Новинки</Link></li>
            <li><Link href="/catalog/sale" className="hover:text-orange-500">Распродажа</Link></li>
            <li><Link href="/actions"      className="hover:text-orange-500">Акции</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-gray-900">Компания</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li><Link href="/about"     className="hover:text-orange-500">О бренде</Link></li>
            <li><Link href="/wholesale" className="hover:text-orange-500">Оптовым клиентам</Link></li>
            <li><Link href="/contact"   className="hover:text-orange-500">Контакты</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-gray-900">Связаться</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li><a href="tel:+79000000000" className="hover:text-orange-500">8 (900) 000-00-00</a></li>
            <li><a href="mailto:hello@paket-paketych.ru" className="hover:text-orange-500">hello@paket-paketych.ru</a></li>
            <li className="flex gap-3 pt-1">
              <span>Telegram</span><span>WhatsApp</span><span>VK</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-gray-400 sm:flex-row">
          <span>© {new Date().getFullYear()} Пакет Пакетыч. Все права защищены.</span>
          <Link href="/privacy" className="hover:text-orange-500">Политика конфиденциальности</Link>
        </div>
      </div>
    </footer>
  );
}
