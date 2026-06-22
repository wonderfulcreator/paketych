import {
  getAllProducts,
  getCollections,
  getThemes,
  getSizes,
} from "@/lib/products";
import { CatalogClient } from "./catalog-client";

export const metadata = {
  title: "Каталог — Пакет Пакетыч",
  description: "Подарочные пакеты оптом. Фильтры по размеру, коллекции, теме.",
};

export default function CatalogPage() {
  return (
    <CatalogClient
      products={getAllProducts()}
      collections={getCollections()}
      themes={getThemes()}
      sizes={getSizes()}
    />
  );
}
