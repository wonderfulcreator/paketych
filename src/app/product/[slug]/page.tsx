import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllProducts, getProductBySlug, getRelated } from "@/lib/products";
import { ProductDetail } from "./product-detail";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: "Товар не найден" };
  return {
    title: `${product.title} — Пакет Пакетыч`,
    description: `${product.title}. Артикул ${product.sku}. ${product.material}, размер ${product.dimensions}. Опт от 1 коробки.`,
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();
  const related = getRelated(product, 6);
  return <ProductDetail product={product} related={related} />;
}
