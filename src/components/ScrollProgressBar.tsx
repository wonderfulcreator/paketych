"use client";

import { useEffect, useState } from "react";

export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div className="fixed left-0 top-0 z-50 h-[3px] w-full bg-transparent">
      <div
        className="h-full bg-orange-500 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
