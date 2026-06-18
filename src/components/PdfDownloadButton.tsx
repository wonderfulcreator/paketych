"use client";

import { useState } from "react";

export function PdfDownloadButton({ orderId, className }: { orderId: string; className?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/pdf`, { credentials: "include" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("[pdf download]", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? (
        <span className="relative h-3.5 w-3.5">
          <span
            className="absolute inset-0 rounded-sm bg-current opacity-70"
            style={{ animation: "box-loader-lid 0.7s ease-in-out infinite" }}
          />
        </span>
      ) : (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
      )}
      {loading ? "Готовим…" : "КП"}
    </button>
  );
}
