export function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="aspect-square animate-pulse bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-gray-100" />
        <div className="h-3 w-2/5 animate-pulse rounded-full bg-gray-100" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-gray-100" />
        <div className="h-9 w-full animate-pulse rounded-xl bg-gray-100 mt-3" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
