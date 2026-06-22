"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

const MAX_COMPARE = 3;
const KEY = "pp_compare";

type CompareContextType = {
  compareIds: string[];
  isComparing: (id: string) => boolean;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  ready: boolean;
};

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setCompareIds(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(compareIds));
  }, [compareIds, ready]);

  const isComparing = useCallback((id: string) => compareIds.includes(id), [compareIds]);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= MAX_COMPARE) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);

  return (
    <CompareContext.Provider value={{ compareIds, isComparing, toggleCompare, clearCompare, ready }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}

export { MAX_COMPARE };
