import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://paket-paketych.ru";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/catalog", "/catalog/new", "/catalog/sale", "/actions", "/about", "/wholesale", "/contact"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
  }));
  const products = getAllProducts().map((p) => ({
    url: `${BASE}/product/${p.slug}`,
    lastModified: new Date(),
  }));
  return [...staticPages, ...products];
}
