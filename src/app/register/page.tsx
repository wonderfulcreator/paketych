"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

function RegisterInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get("redirect") || "/account";
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    website: "", // honeypot — должно остаться пустым
  });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.website) return; // honeypot заполнен — это бот, молча игнорируем
    if (!agree) return setError("Подтвердите согласие на обработку данных");
    if (form.password.length < 8)
      return setError("Пароль должен быть не короче 8 символов");
    if (form.password !== form.confirm)
      return setError("Пароли не совпадают");
    const res = await register({
      name: form.name,
      company: form.company,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });
    if (!res.ok) return setError(res.error || "Ошибка регистрации");
    router.push(redirect);
  }

  return (
    <div className="container flex justify-center py-12">
      <div className="card-white w-full max-w-md p-7">
        <h1 className="heading text-2xl">Регистрация</h1>
        <p className="mt-1 text-sm text-gray-500">
          Создайте аккаунт, чтобы оформлять заявки и видеть наличие.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          {/* Honeypot — невидимое поле для ботов */}
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
            aria-hidden="true"
          />
          <input className="field" placeholder="Имя контактного лица" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          <input className="field" placeholder="Название компании" value={form.company} onChange={(e) => set("company", e.target.value)} required />
          <input className="field" type="email" placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          <input className="field" placeholder="Телефон +7…" value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
          <input className="field" type="password" placeholder="Пароль (от 8 символов)" value={form.password} onChange={(e) => set("password", e.target.value)} required />
          <input className="field" type="password" placeholder="Повторите пароль" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} required />
          <label className="flex items-start gap-2 text-xs text-gray-500">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
            Согласен с обработкой персональных данных и политикой конфиденциальности
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="btn-primary w-full">Зарегистрироваться</button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="brand-link">Войти</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}
