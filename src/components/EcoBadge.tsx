export function EcoBadge({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700 ${className ?? ""}`}>
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 4 13c0-4 3-7 8-13 1 4 2 6 4 8a8 8 0 0 1 2 5 7 7 0 0 1-7 7Z"/>
      </svg>
      Крафт-бумага
    </span>
  );
}

export function isEcoProduct(material: string): boolean {
  return material.toLowerCase().includes("крафт");
}
