"use client";

import {
  createContext, useContext, useEffect, useState, useCallback, type ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";

type RequestItem = { productId: string; boxes: number };

type StoreContextType = {
  favorites:     string[];
  request:       RequestItem[];
  requestCount:  number;
  ready:         boolean;
  isFavorite:    (id: string) => boolean;
  toggleFavorite:(id: string) => void;
  addToRequest:  (productId: string, boxes?: number) => void;
  setBoxes:      (productId: string, boxes: number) => void;
  removeFromRequest: (productId: string) => void;
  clearRequest:  () => void;
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();

  const [favorites, setFavorites] = useState<string[]>([]);
  const [request,   setRequest]   = useState<RequestItem[]>([]);
  const [ready,     setReady]     = useState(false);

  // Загружаем избранное при смене пользователя
  useEffect(() => {
    if (!authReady) return;

    if (user) {
      // Загружаем избранное с сервера
      fetch("/api/favorites", { credentials: "include" })
        .then(r => r.json())
        .then(data => { if (data.ok) setFavorites(data.favorites ?? []); })
        .catch(() => {});

      // Корзина — localStorage (не персональные данные, только productId + кол-во)
      try {
        const saved = JSON.parse(localStorage.getItem("pp_cart") || "[]");
        setRequest(saved);
      } catch {}
    } else {
      // Гость — избранное тоже из localStorage
      try {
        setFavorites(JSON.parse(localStorage.getItem("pp_favorites") || "[]"));
        setRequest([]);
      } catch {}
    }
    setReady(true);
  }, [user, authReady]);

  // Сохраняем корзину в localStorage при изменении
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("pp_cart", JSON.stringify(request));
  }, [request, ready]);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    const isFav = favorites.includes(id);
    if (user) {
      // Сервер
      fetch("/api/favorites", {
        method: isFav ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: id }),
      }).catch(() => {});
    } else {
      // Гость — localStorage
      const next = isFav ? favorites.filter(f => f !== id) : [...favorites, id];
      localStorage.setItem("pp_favorites", JSON.stringify(next));
    }
    setFavorites(prev =>
      isFav ? prev.filter(f => f !== id) : [...prev, id]
    );
  }, [favorites, user]);

  const addToRequest = useCallback((productId: string, boxes = 1) => {
    setRequest(prev => {
      const exists = prev.find(r => r.productId === productId);
      return exists
        ? prev.map(r => r.productId === productId ? { ...r, boxes: r.boxes + boxes } : r)
        : [...prev, { productId, boxes }];
    });
  }, []);

  const setBoxes = useCallback((productId: string, boxes: number) => {
    setRequest(prev =>
      prev.map(r => r.productId === productId ? { ...r, boxes: Math.max(1, boxes) } : r)
    );
  }, []);

  const removeFromRequest = useCallback((productId: string) => {
    setRequest(prev => prev.filter(r => r.productId !== productId));
  }, []);

  const clearRequest = useCallback(() => {
    setRequest([]);
    localStorage.removeItem("pp_cart");
  }, []);

  const requestCount = request.reduce((s, r) => s + r.boxes, 0);

  return (
    <StoreContext.Provider value={{
      favorites, request, requestCount, ready,
      isFavorite, toggleFavorite,
      addToRequest, setBoxes, removeFromRequest, clearRequest,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
