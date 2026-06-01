"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get("redirect") || "/account";
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = login(email, password);
    if (!res.ok) return setError(res.error || "Ошибка входа");
    router.push(redirect);
  }

  return (
    <div className="container flex justify-center py-12">
      <div className="paper-card w-full max-w-md p-7">
        <h1 className="brand-heading text-2xl">Вход</h1>
        <p className="mt-1 text-sm text-inkSoft">
          Войдите, чтобы продолжить оформление заявки.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="field" type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-flameDeep">{error}</p>}
          <button type="submit" className="btn-primary w-full">Войти</button>
        </form>
        <p className="mt-4 text-center text-sm text-inkSoft">
          Нет аккаунта?{" "}
          <Link href={`/register?redirect=${redirect}`} className="brand-link">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
