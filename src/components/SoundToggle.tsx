"use client";

import { useEffect, useState } from "react";
import { isSoundEnabled, setSoundEnabled, playClickSound } from "@/lib/feedback";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isSoundEnabled());
  }, []);

  function toggle() {
    const next = !enabled;
    setSoundEnabled(next);
    setEnabled(next);
    if (next) playClickSound();
  }

  return (
    <button onClick={toggle}
      aria-label={enabled ? "Выключить звук" : "Включить звук"}
      title={enabled ? "Звук включён" : "Звук выключен"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-50 hover:text-gray-600">
      {enabled ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5Z"/>
          <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
          <path d="M18.5 5.5a9 9 0 0 1 0 13"/>
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5Z"/>
          <path d="M23 9l-6 6M17 9l6 6"/>
        </svg>
      )}
    </button>
  );
}
