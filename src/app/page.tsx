import { getFeatured, getNew } from "@/lib/products";
import { HomeClient } from "./home-client";

export default function HomePage() {
  return (
    <HomeClient
      featured={getFeatured(8)}
      fresh={getNew(8)}
    />
  );
}
