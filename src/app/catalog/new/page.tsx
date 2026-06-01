import { getAllProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export const metadata = { title: "Новинки — Пакет Пакетыч" };

export default function NewPage() {
  const products = getAllProducts().filter((p) => p.isNew && p.isAvailable);
  return (
    <div className="container py-8">
      <span className="chip">Новинки</span>
      <h1 className="heading mt-3 text-3xl">Свежие поступления</h1>
      <p className="mt-1 max-w-2xl text-sm text-gray-500">
        Новогодние коллекции «Зимняя сказка» и «Christmas Gold» — акварельные
        пейзажи, золотое тиснение и атласные ленты.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
