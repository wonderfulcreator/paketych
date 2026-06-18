import { BoxLoader } from "@/components/BoxLoader";

export default function Loading() {
  return (
    <div className="container flex min-h-[50vh] items-center justify-center py-20">
      <BoxLoader label="Загружаем…" />
    </div>
  );
}
