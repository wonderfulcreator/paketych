"use client";

import { useEffect } from "react";

export function HotkeysProvider() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // ⌘K / Ctrl+K — фокус на поиск
      if (modKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="Поиск"]'
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Esc — закрыть лайтбокс, дропдауны и т.п.
      if (e.key === "Escape") {
        // Снимаем фокус с активного элемента — большинство наших dropdown
        // закрываются через onBlur / outside-click, потеря фокуса их триггерит
        const active = document.activeElement as HTMLElement | null;
        if (active && active !== document.body) {
          active.blur();
        }
        // Кастомный event для компонентов, которые слушают Esc сами
        // (лайтбокс уже обрабатывает Escape внутри себя)
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
