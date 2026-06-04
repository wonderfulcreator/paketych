"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  images: string[];
  current: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  alt: string;
};

export function Lightbox({ images, current, onClose, onPrev, onNext, alt }: Props) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") onPrev();
    if (e.key === "ArrowRight") onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[500] flex items-center justify-center bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Закрыть */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Закрыть"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Фото */}
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-4 flex max-h-[85vh] max-w-3xl items-center justify-center"
          onClick={e => e.stopPropagation()}
        >
          <div className="relative h-[75vh] w-[75vw] max-w-2xl">
            <Image
              src={images[current]}
              alt={`${alt} — фото ${current + 1}`}
              fill
              className="object-contain"
              sizes="80vw"
              priority
            />
          </div>
        </motion.div>

        {/* Стрелки — только если несколько фото */}
        {images.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); onPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
              aria-label="Предыдущее фото"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <button
              onClick={e => { e.stopPropagation(); onNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
              aria-label="Следующее фото"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>

            {/* Счётчик */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-sm text-white backdrop-blur-sm">
              {current + 1} / {images.length}
            </div>

            {/* Точки-миниатюры */}
            <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((img, i) => (
                <button
                  key={img}
                  onClick={e => { e.stopPropagation(); /* navigate to i */ }}
                  className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                  aria-label={`Фото ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
