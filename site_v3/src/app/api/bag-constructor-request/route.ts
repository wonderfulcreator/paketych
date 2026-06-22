export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSessionCookie, getSessionUser } from "@/lib/auth";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const MANAGER_EMAIL = process.env.MANAGER_EMAIL || "o.vanukova@interteks.ru";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Пакет Пакетыч <orders@paketpaketych.ru>";

// POST /api/bag-constructor-request { size, shape, material, handle, finish, color, design, hasLogo }
// Принимает заявку из визуального конструктора фирменного пакета.
// Это не настоящий заказ — просьба связаться для обсуждения брендирования.
export async function POST(req: NextRequest) {
  try {
    const { size, shape, material, handle, finish, color, design, hasLogo } = await req.json();

    let contact = "Гость (без входа)";
    const sessionId = getSessionCookie();
    if (sessionId) {
      const user = await getSessionUser(sessionId);
      if (user) contact = `${user.name} (${user.company}) — ${user.email}, ${user.phone}`;
    }

    if (resend) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: MANAGER_EMAIL,
        subject: `Заявка из конструктора пакета — ${size}, ${design ?? color}`,
        html: `
          <p>Новая заявка из визуального конструктора фирменного пакета.</p>
          <ul>
            <li><b>Размер:</b> ${size}</li>
            <li><b>Форма:</b> ${shape ?? "—"}</li>
            <li><b>Материал:</b> ${material ?? "—"}</li>
            <li><b>Отделка:</b> ${finish ?? "—"}</li>
            <li><b>Ручка:</b> ${handle ?? "—"}</li>
            <li><b>Дизайн:</b> ${design ?? "—"}</li>
            <li><b>Цвет (если без дизайна):</b> ${color ?? "—"}</li>
            <li><b>Логотип загружен:</b> ${hasLogo ? "да" : "нет"}</li>
            <li><b>Контакт:</b> ${contact}</li>
          </ul>
        `,
      });
    } else {
      console.log("[bag-constructor-request] RESEND_API_KEY not set, skipping email", { size, shape, material, handle, finish, color, design, hasLogo, contact });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[bag-constructor-request POST]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
