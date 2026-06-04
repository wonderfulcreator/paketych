import data from "@/data/products.json";
import type { Product } from "./types";

const products = data as Product[];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeatured(limit = 8): Product[] {
  return products.filter((p) => p.isHit && p.isAvailable).slice(0, limit);
}

export function getNew(limit = 8): Product[] {
  return products.filter((p) => p.isNew && p.isAvailable).slice(0, limit);
}

export function getOnSale(limit = 100): Product[] {
  return products.filter((p) => p.isSale && p.isAvailable).slice(0, limit);
}

export function getRelated(product: Product, limit = 6): Product[] {
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        p.isAvailable &&
        (p.collection === product.collection ||
          p.theme.some((t) => product.theme.includes(t)))
    )
    .slice(0, limit);
}

export function getCollections(): string[] {
  return Array.from(new Set(products.map((p) => p.collection))).sort();
}

export function getThemes(): string[] {
  const all = products.flatMap((p) => p.theme);
  return Array.from(new Set(all)).sort();
}

export function getSizes(): string[] {
  const order = ["S", "M", "L", "XL", "XXL"];
  const present = Array.from(new Set(products.map((p) => p.size)));
  return order.filter((s) => present.includes(s));
}

export function getMaterials(): string[] {
  return Array.from(new Set(products.map((p) => p.material))).sort();
}
