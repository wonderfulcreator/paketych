"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type RequestLine = { productId: string; boxes: number };

type StoreContextType = {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  request: RequestLine[];
  addToRequest: (id: string, boxes?: number) => void;
  setBoxes: (id: string, boxes: number) => void;
  removeFromRequest: (id: string) => void;
  clearRequest: () => void;
  requestCount: number;
  ready: boolean;
};

const StoreContext = createContext<StoreContextType | null>(null);

const FAV_KEY = "pp_favorites";
const REQ_KEY = "pp_request";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [request, setRequest] = useState<RequestLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
      setRequest(JSON.parse(localStorage.getItem(REQ_KEY) || "[]"));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem(REQ_KEY, JSON.stringify(request));
  }, [request, ready]);

  function toggleFavorite(id: string) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }
  const isFavorite = (id: string) => favorites.includes(id);

  function addToRequest(id: string, boxes = 1) {
    setRequest((prev) => {
      const existing = prev.find((x) => x.productId === id);
      if (existing) {
        return prev.map((x) =>
          x.productId === id ? { ...x, boxes: x.boxes + boxes } : x
        );
      }
      return [...prev, { productId: id, boxes }];
    });
  }

  function setBoxes(id: string, boxes: number) {
    setRequest((prev) =>
      prev.map((x) => (x.productId === id ? { ...x, boxes: Math.max(1, boxes) } : x))
    );
  }

  function removeFromRequest(id: string) {
    setRequest((prev) => prev.filter((x) => x.productId !== id));
  }

  function clearRequest() {
    setRequest([]);
  }

  return (
    <StoreContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        request,
        addToRequest,
        setBoxes,
        removeFromRequest,
        clearRequest,
        requestCount: request.length,
        ready,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
