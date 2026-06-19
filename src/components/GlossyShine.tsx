"use client";

import { useRef, useState } from "react";

export function isGlossyMaterial(material: string): boolean {
  const m = material.toLowerCase();
  return m.includes("тиснение") || m.includes("люкс") || m.includes("ламинирован");
}

export function GlossyShine({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  }

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos(null)}>
      {children}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: pos ? 1 : 0,
          background: pos
            ? `radial-gradient(circle 90px at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.45), transparent 70%)`
            : undefined,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
