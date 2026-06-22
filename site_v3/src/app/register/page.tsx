"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

function RegisterInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get("redirect") || "/account";
  const inviteId = sp.get("invite");
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
  const [agreeConsent, setAgreeConsent] = useState(false);
  const [error, setError] = useState("");
  const [inviteInfo, setInviteInfo] = useState<{ valid: boolean; email: string; companyName: string } | null>(null);
  const [inviteChecked, setInviteChecked] = useState(false);

  // Проверяем приглашение, если есть параметр invite
  useEffect(() => {
    if (!inviteId) { setInviteChecked(true); return; }
    fetch(`/api/team/invites/${inviteId}`)
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setInviteInfo({ valid: data.valid, email: data.email, companyName: data.companyName });
          if (data.valid) {
            setForm(f => ({ ...f, email: data.email, company: data.companyName }));
          }
        }
      })
      .catch(() => {})
      .finally(() => setInviteChecked(true));
  }, [inviteId]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function touch(k: string) {
    setTouched(t => ({ ...t, [k]: true }));
    validateField(k, form[k as keyof typeof form]);
  }

  function validateField(k: string, v: string) {
    let err = "";
    if (k === "phone" && v && !/^\+7[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/.test(v.trim())) {
      err = "Формат: +7 (999) 999-99-99";
    }
    if (k === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) {
      err = "Введите корректный email";
    }
    if (k === "password" && v && v.length < 8) {
      err = "Минимум 8 символов";
    }
    if (k === "confirm" && v && form.password && v !== form.password) {
      err = "Пароли не совпадают";
    }
    setFieldErrors(e => ({ ...e, [k]: err }));
  }

  function setAndValidate(k: string, v: string) {
    set(k, v);
    if (touched[k]) validateField(k, v);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.website) return; // honeypot заполнен — это бот, молча игнорируем
    if (!agree) return setError("Ознакомьтесь с Политикой конфиденциальности и подтвердите согласие");
    if (!agreeConsent) return setError("Подтвердите согласие на обработку персональных данных");
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
      ...(inviteInfo?.valid && inviteId ? { inviteId } : {}),
    } as Parameters<typeof register>[0] & { inviteId?: string });
    if (!res.ok) return setError(res.error || "Ошибка регистрации");
    router.push(redirect);
  }

  const isInviteFlow = !!inviteId && inviteChecked && inviteInfo?.valid;
  const isInviteInvalid = !!inviteId && inviteChecked && !inviteInfo?.valid;

  return (
    <div className="container flex justify-center py-12">
      <div className="card-white w-full max-w-md p-7">
        <h1 className="heading text-2xl">Регистрация</h1>

        {isInviteFlow ? (
          <p className="mt-1 text-sm text-gray-500">
            Вас пригласили в команду <span className="font-semibold text-gray-900">{inviteInfo!.companyName}</span>. Завершите регистрацию ниже.
          </p>
        ) : isInviteInvalid ? (
          <p className="mt-1 text-sm text-red-500">
            Это приглашение больше не действует. Зарегистрируйтесь как новая компания или попросите коллегу отправить новое приглашение.
          </p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">
            Создайте аккаунт, чтобы оформлять заявки и видеть наличие.
          </p>
        )}

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
          <input className="field" placeholder="Имя контактного лица" value={form.name} onChange={(e) => setAndValidate("name", e.target.value)} required />
          <input className="field" placeholder="Название компании" value={form.company} onChange={(e) => setAndValidate("company", e.target.value)}
            disabled={isInviteFlow} required />

          {/* Email */}
          <div>
            <input className={`field ${fieldErrors.email && touched.email ? "border-red-300 focus:border-red-400" : ""}`}
              type="email" placeholder="Email" value={form.email}
              onChange={(e) => setAndValidate("email", e.target.value)}
              onBlur={() => touch("email")}
              disabled={isInviteFlow} required />
            {touched.email && fieldErrors.email
              ? <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              : <p className="mt-1 text-xs text-gray-400">Например: company@mail.ru</p>}
          </div>

          {/* Телефон */}
          <div>
            <input className={`field ${fieldErrors.phone && touched.phone ? "border-red-300 focus:border-red-400" : ""}`}
              placeholder="Телефон +7 (999) 999-99-99" value={form.phone}
              onChange={(e) => setAndValidate("phone", e.target.value)}
              onBlur={() => touch("phone")}
              required />
            {touched.phone && fieldErrors.phone
              ? <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
              : <p className="mt-1 text-xs text-gray-400">Формат: +7 (999) 999-99-99</p>}
          </div>

          {/* Пароль */}
          <div>
            <input className={`field ${fieldErrors.password && touched.password ? "border-red-300 focus:border-red-400" : ""}`}
              type="password" placeholder="Пароль" value={form.password}
              onChange={(e) => setAndValidate("password", e.target.value)}
              onBlur={() => touch("password")}
              required />
            {touched.password && fieldErrors.password
              ? <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
              : <p className="mt-1 text-xs text-gray-400">Минимум 8 символов</p>}
          </div>

          {/* Подтверждение пароля */}
          <div>
            <input className={`field ${fieldErrors.confirm && touched.confirm ? "border-red-300 focus:border-red-400" : ""}`}
              type="password" placeholder="Повторите пароль" value={form.confirm}
              onChange={(e) => setAndValidate("confirm", e.target.value)}
              onBlur={() => touch("confirm")}
              required />
            {touched.confirm && fieldErrors.confirm && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.confirm}</p>
            )}
          </div>
          <div className="space-y-2 pt-1">
            <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 shrink-0 accent-orange-500" />
              <span>Я ознакомился с{" "}
                <a href="/privacy" target="_blank" className="text-orange-500 hover:underline">Политикой конфиденциальности</a>
              </span>
            </label>
            <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={agreeConsent} onChange={(e) => setAgreeConsent(e.target.checked)} className="mt-0.5 shrink-0 accent-orange-500" />
              <span>Даю{" "}
                <a href="/privacy/consent" target="_blank" className="text-orange-500 hover:underline">согласие на обработку персональных данных</a>
              </span>
            </label>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            {isInviteFlow ? "Присоединиться к команде" : "Зарегистрироваться"}
          </button>
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
