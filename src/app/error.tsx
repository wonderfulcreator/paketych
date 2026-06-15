"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="container flex flex-col items-center py-20 text-center">
      <Image
        src="/brand/mascot-wink.png"
        alt="Пакетыч расстроен"
        width={200}
        height={200}
        className="mx-auto opacity-90 drop-shadow-lg"
      />

      <h1 className="mt-6 font-display text-3xl font-extrabold text-gray-900 md:text-4xl">
        Что-то пошло не так
      </h1>
      <p className="mt-3 max-w-md text-sm text-gray-500 md:text-base">
        На нашей стороне произошла ошибка. Попробуйте обновить страницу — если не поможет, мы уже работаем над этим.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-orange-600">
          Попробовать снова
        </button>
        <Link href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:border-orange-300 hover:bg-orange-50">
          На главную
        </Link>
      </div>
    </div>
  );
}
