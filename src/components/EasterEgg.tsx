"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const TARGET = "пакетыч";

type ConfettiPiece = { id: number; x: number; y: number; color: string; rotate: number };

const COLORS = ["#F97316", "#FBBF24", "#22C55E", "#EF4444", "#3B82F6"];

export function EasterEgg() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const bufferRef = useRef("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key.length !== 1) return;

      bufferRef.current = (bufferRef.current + e.key.toLowerCase()).slice(-TARGET.length);
      if (bufferRef.current === TARGET) {
        trigger();
        bufferRef.current = "";
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function trigger() {
    setActive(true);
    const newPieces: ConfettiPiece[] = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 280,
      y: -(80 + Math.random() * 140),
      color: COLORS[i % COLORS.length],
      rotate: Math.random() * 360,
    }));
    setPieces(newPieces);
    setTimeout(() => setActive(false), 2200);
  }

  if (!mounted || !active) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[300] flex items-center justify-center">
      <AnimatePresence>
        {pieces.map(p => (
          <motion.span
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
            animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            style={{ position: "absolute", width: 7, height: 7, borderRadius: 1, background: p.color }}
          />
        ))}
      </AnimatePresence>
      <motion.div
        initial={{ scale: 0.3, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0, rotate: [0, -6, 6, -3, 0] }}
        exit={{ scale: 0.3, opacity: 0, y: 30 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center"
      >
        <Image src="/brand/mascot-wink.png" alt="Пакетыч приветствует" width={160} height={160} className="drop-shadow-xl" />
        <span className="mt-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-orange-600 shadow-md">
          Привет! Это секретное приветствие
        </span>
      </motion.div>
    </div>,
    document.body
  );
}
