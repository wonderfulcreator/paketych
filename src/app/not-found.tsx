import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center py-20 text-center">
      <div className="relative">
        <Image
          src="/brand/mascot-wink.png"
          alt="Пакетыч растерянно смотрит"
          width={220}
          height={220}
          className="mx-auto drop-shadow-lg"
          priority
        />
        <span className="absolute -right-2 top-4 rounded-full bg-orange-500 px-3 py-1 text-sm font-extrabold text-white shadow-md rotate-6">
          404
        </span>
      </div>

      <h1 className="mt-6 font-display text-3xl font-extrabold text-gray-900 md:text-4xl">
        Ой, кажется пакет потерялся
      </h1>
      <p className="mt-3 max-w-md text-sm text-gray-500 md:text-base">
        Такой страницы не существует, либо товар сняли с продажи. Загляните в каталог — там точно найдётся что-то подходящее.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/catalog"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-orange-600">
          Перейти в каталог
        </Link>
        <Link href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:border-orange-300 hover:bg-orange-50">
          На главную
        </Link>
      </div>

      <div className="mt-10 grid w-full max-w-md grid-cols-3 gap-3">
        <Link href="/catalog/new" className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-center transition hover:border-orange-200 hover:bg-orange-50">
          <div className="text-sm font-bold text-gray-900">Новинки</div>
          <div className="mt-0.5 text-xs text-gray-400">Сезон 2025</div>
        </Link>
        <Link href="/catalog/sale" className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-center transition hover:border-orange-200 hover:bg-orange-50">
          <div className="text-sm font-bold text-gray-900">Распродажа</div>
          <div className="mt-0.5 text-xs text-gray-400">До −30%</div>
        </Link>
        <Link href="/wholesale" className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-center transition hover:border-orange-200 hover:bg-orange-50">
          <div className="text-sm font-bold text-gray-900">Оптовикам</div>
          <div className="mt-0.5 text-xs text-gray-400">Условия</div>
        </Link>
      </div>
    </div>
  );
}
