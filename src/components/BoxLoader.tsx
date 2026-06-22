"use client";

export function BoxLoader({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className ?? ""}`}>
      <div className="relative h-12 w-12" style={{ animation: "box-loader-tilt 1.1s ease-in-out infinite" }}>
        {/* Корпус коробки */}
        <div className="absolute bottom-0 left-0 right-0 h-8 rounded-md bg-orange-500" />
        {/* Лента вертикальная */}
        <div className="absolute bottom-0 left-1/2 top-1 w-1.5 -translate-x-1/2 bg-orange-200" />
        {/* Крышка/лента горизонтальная сверху, покачивается отдельно */}
        <div
          className="absolute left-0 right-0 top-0 h-2 rounded-sm bg-orange-200"
          style={{ animation: "box-loader-lid 1.1s ease-in-out infinite" }}
        />
        {/* Бант */}
        <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-sm bg-orange-300" />
      </div>
      {label && <p className="text-xs font-medium text-gray-400">{label}</p>}
    </div>
  );
}
