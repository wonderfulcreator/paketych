import { getFeatured, getNew } from "@/lib/products";
import { HomeClient } from "./home-client";

export default function HomePage() {
  const featured = getFeatured(8);
  const fresh = getNew(8);
  return <HomeClient featured={featured} fresh={fresh} />;
}
