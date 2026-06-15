import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, name, company, phone, password } = await req.json();

    if (!email || !name || !company || !phone || !password) {
      return NextResponse.json(
        { ok: false, error: "Заполните все поля" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Пароль должен быть не менее 6 символов" },
        { status: 400 }
      );
    }

    // Проверяем уникальность email
    const existing = await queryOne(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Пользователь с таким email уже зарегистрирован" },
        { status: 409 }
      );
    }

    // Создаём пользователя
    const passwordHash = hashPassword(password);
    const rows = await query<{ id: number; email: string; name: string; company: string; phone: string }>(
      `INSERT INTO users (email, name, company, phone, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, company, phone`,
      [email.toLowerCase().trim(), name.trim(), company.trim(), phone.trim(), passwordHash]
    );

    const user = rows[0];

    // Создаём сессию
    const sessionId = await createSession(user.id);
    setSessionCookie(sessionId);

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { ok: false, error: "Ошибка сервера. Попробуйте позже." },
      { status: 500 }
    );
  }
}
