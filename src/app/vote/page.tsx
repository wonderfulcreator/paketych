"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { playClickSound, vibrate } from "@/lib/feedback";

const OPTIONS = [
  {
    id: "mandarin_classic",
    title: "«С Новым годом»",
    description: "Мандарины, хвоя и новогодние сладости на тёмно-зелёном фоне",
    image: "/products/mandarinka/design-mandarinka.webp",
  },
  {
    id: "mandarin_family",
    title: "«Семейный праздник»",
    description: "Тёплая сцена украшения ёлки на насыщенном красном фоне",
    image: "/products/mandarinka/design-family.webp",
  },
  {
    id: "mandarin_new",
    title: "Новый эскиз (на согласовании)",
    description: "Третий вариант появится здесь после утверждения макета дизайнером",
    image: null,
  },
];

type Results = Record<string, number>;

export default function VotePage() {
  const { user } = useAuth();
  const [results, setResults] = useState<Results>({});
  const [myVote, setMyVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/design-vote")
      .then(r => r.json())
      .then(data => {
        if (data.ok) { setResults(data.results); setMyVote(data.myVote); }
      })
      .finally(() => setLoading(false));
  }, []);

  async function vote(optionId: string) {
    if (!user) { setError("Войдите в аккаунт, чтобы проголосовать"); return; }
    setError("");
    const prevVote = myVote;
    setMyVote(optionId);
    setResults(prev => {
      const next = { ...prev };
      if (prevVote) next[prevVote] = Math.max(0, (next[prevVote] ?? 1) - 1);
      next[optionId] = (next[optionId] ?? 0) + 1;
      return next;
    });
    playClickSound();
    vibrate(10);

    try {
      const res = await fetch("/api/design-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ optionId }),
      });
      const data = await res.json();
      if (!data.ok) setError(data.error || "Не удалось сохранить голос");
    } catch {
      setError("Ошибка соединения");
    }
  }

  const total = Object.values(results).reduce((s, n) => s + n, 0);

  return (
    <div className="container py-8">
      <span className="chip">Голосование</span>
      <h1 className="heading mt-3 text-3xl">Выберите следующий дизайн «Мандариновой сказки»</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-500">
        Коллекция получит развитие в следующем сезоне — какой из вариантов отправить в производство решают наши клиенты.
      </p>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {OPTIONS.map(opt => {
          const votes = results[opt.id] ?? 0;
          const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
          const isMine = myVote === opt.id;

          return (
            <button key={opt.id} onClick={() => vote(opt.id)} disabled={loading}
              className={`group relative overflow-hidden rounded-2xl border-2 bg-white text-left transition ${
                isMine ? "border-orange-500" : "border-gray-100 hover:border-orange-200"
              }`}>
              <div className="relative aspect-[3/4] bg-gray-50">
                {opt.image ? (
                  <Image src={opt.image} alt={opt.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                    <svg className="h-8 w-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
                    </svg>
                    <span className="text-xs text-gray-400">Эскиз готовится</span>
                  </div>
                )}
                {isMine && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white shadow-md">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </motion.div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-gray-900">{opt.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{opt.description}</p>
                {total > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <motion.div className="h-full rounded-full bg-orange-400"
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">{pct}% · {votes} голосов</p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!user && (
        <p className="mt-4 text-sm text-gray-400">
          Войдите в аккаунт, чтобы голос засчитался.
        </p>
      )}
    </div>
  );
}
