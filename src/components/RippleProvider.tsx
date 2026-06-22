"use client";

import { useEffect } from "react";

export function RippleProvider() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>(".ripple-container");
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.className = "ripple-effect";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      const prevPosition = getComputedStyle(target).position;
      if (prevPosition === "static") {
        target.style.position = "relative";
      }
      target.appendChild(ripple);
      setTimeout(() => ripple.remove(), 550);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
