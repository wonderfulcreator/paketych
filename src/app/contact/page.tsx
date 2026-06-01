"use client";

import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="container py-8">
      <h1 className="brand-heading text-3xl">Контакты</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="paper-card p-6">
          <h2 className="font-display text-lg font-bold text-ink">Связаться с нами</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between">
              <span className="text-inkSoft">Телефон</span>
              <a href="tel:+79000000000" className="font-semibold text-flame">8 (900) 000-00-00</a>
            </li>
            <li className="flex justify-between">
              <span className="text-inkSoft">Email</span>
              <a href="mailto:hello@paket-paketych.ru" className="font-semibold text-flame">hello@paket-paketych.ru</a>
            </li>
            <li className="flex justify-between">
              <span className="text-inkSoft">Telegram</span>
              <span className="font-semibold text-ink">@paketpaketych</span>
            </li>
            <li className="flex justify-between">
              <span className="text-inkSoft">Режим работы</span>
              <span className="font-semibold text-ink">Пн–Пт, 9:00–18:00</span>
            </li>
          </ul>
        </div>

        <div className="paper-card p-6">
          <h2 className="font-display text-lg font-bold text-ink">Быстрая форма</h2>
          {sent ? (
            <p className="mt-4 text-sm text-leaf">
              Спасибо! Мы получили ваше сообщение и скоро ответим.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="mt-4 space-y-3"
            >
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
