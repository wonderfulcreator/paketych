import { getFeatured, getNew, getAllProducts } from "@/lib/products";
import { HomeClient } from "./home-client";

export default function HomePage() {
  const featured  = getFeatured(8);
  const fresh     = getNew(8);
  const mandarinka = getAllProducts()
    .filter(p => p.collection === "Мандариновая сказка")
    .slice(0, 4);
  return <HomeClient featured={featured} fresh={fresh} mandarinka={mandarinka} />;
}
