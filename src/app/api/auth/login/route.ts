import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Введите email и пароль" },
        { status: 400 }
      );
    }

    const user = await queryOne<{
      id: number;
      email: string;
      name: string;
      company: string;
      phone: string;
      password_hash: string;
    }>(
      `SELECT id, email, name, company, phone, password_hash
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { ok: false, error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    const sessionId = await createSession(user.id);
    setSessionCookie(sessionId);

    const { password_hash: _, ...safeUser } = user;
    return NextResponse.json({ ok: true, user: safeUser });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json(
      { ok: false, error: "Ошибка сервера. Попробуйте позже." },
      { status: 500 }
    );
  }
}
