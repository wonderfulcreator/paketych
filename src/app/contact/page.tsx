"use client";

import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="container py-8">
      <h1 className="heading text-3xl">Контакты</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-white p-6">
          <h2 className="font-display text-lg font-bold text-gray-900">Связаться с нами</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-500">Телефон</span>
              <a href="tel:+79000000000" className="font-semibold text-orange-500">8 (900) 000-00-00</a>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <a href="mailto:hello@paket-paketych.ru" className="font-semibold text-orange-500">hello@paket-paketych.ru</a>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">Telegram</span>
              <span className="font-semibold text-gray-900">@paketpaketych</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">Режим работы</span>
              <span className="font-semibold text-gray-900">Пн–Пт, 9:00–18:00</span>
            </li>
          </ul>
        </div>

        <div className="card-white p-6">
          <h2 className="font-display text-lg font-bold text-gray-900">Быстрая форма</h2>
          {sent ? (
            <p className="mt-4 text-sm text-leaf">
              Спасибо! Мы получили ваше сообщение и скоро ответим.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const honeypot = (form.elements.namedItem("website") as HTMLInputElement)?.value;
                if (honeypot) {
                  // Бот заполнил скрытое поле — молча игнорируем
                  setSent(true);
                  return;
                }
                setSent(true);
              }}
              className="mt-4 space-y-3"
            >
              {/* Honeypot — невидимое поле для ботов */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
                aria-hidden="true"
              />
              <input className="field" placeholder="Ваше имя" required />
              <input className="field" placeholder="Телефон или email" required />
              <textarea className="field resize-none" rows={4} placeholder="Сообщение" required />
              <button type="submit" className="btn-primary w-full">Отправить</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
