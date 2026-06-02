import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center py-24 text-center">
      <h1 className="heading text-5xl">404</h1>
      <p className="mt-3 text-gray-500">Такой страницы нет. Возможно, товар временно недоступен.</p>
      <Link href="/catalog" className="btn-primary mt-6">В каталог</Link>
    </div>
  );
}
