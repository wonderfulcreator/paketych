import { getAllProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export const metadata = { title: "Распродажа — Пакет Пакетыч" };

export default function SalePage() {
  const products = getAllProducts().filter((p) => p.isSale && p.isAvailable);
  return (
    <div className="container py-8">
      <span className="chip !text-red-500">Распродажа</span>
      <h1 className="heading mt-3 text-3xl">Распродажа стока</h1>
      <p className="mt-1 max-w-2xl text-sm text-gray-500">
        Скидки до 30% на коллекции прошлых сезонов. Успейте пополнить витрину по
        выгодной цене — количество ограничено остатками на складе.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {products.map((p, idx) => (
          <ProductCard key={p.id} product={p} index={idx} />
        ))}
      </div>
    </div>
  );
}
