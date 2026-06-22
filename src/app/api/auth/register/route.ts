import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, name, company, phone, password, website, inviteId } = await req.json();

    // Honeypot — если скрытое поле заполнено, это бот
    if (website) {
      return NextResponse.json({ ok: false, error: "Ошибка валидации" }, { status: 400 });
    }

    if (!email || !name || !phone || !password) {
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

    let companyId: number | null = null;
    let companyName = company?.trim() || "";
    let role = "owner";

    // Сценарий Б — регистрация по приглашению
    if (inviteId) {
      const invite = await queryOne<{ id: string; company_id: number; email: string; status: string }>(
        `SELECT id, company_id, email, status FROM invites WHERE id = $1`,
        [inviteId]
      );

      if (!invite || invite.status !== "pending") {
        return NextResponse.json(
          { ok: false, error: "Приглашение недействительно или уже использовано" },
          { status: 400 }
        );
      }

      const companyRow = await queryOne<{ name: string }>(
        `SELECT name FROM companies WHERE id = $1`,
        [invite.company_id]
      );

      companyId = invite.company_id;
      companyName = companyRow?.name ?? companyName;
      role = "member";
    }

    if (!companyName) {
      return NextResponse.json(
        { ok: false, error: "Укажите название компании" },
        { status: 400 }
      );
    }

    // Создаём пользователя
    const passwordHash = hashPassword(password);
    const rows = await query<{ id: number; email: string; name: string; company: string; phone: string; company_id: number | null; role: string }>(
      `INSERT INTO users (email, name, company, phone, password_hash, company_id, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, name, company, phone, company_id, role`,
      [email.toLowerCase().trim(), name.trim(), companyName, phone.trim(), passwordHash, companyId, role]
    );

    const user = rows[0];

    // Сценарий А — обычная регистрация: создаём новую компанию, пользователь становится владельцем
    if (!inviteId) {
      const companyRows = await query<{ id: number }>(
        `INSERT INTO companies (name, owner_id) VALUES ($1, $2) RETURNING id`,
        [companyName, user.id]
      );
      const newCompanyId = companyRows[0].id;
      await query(`UPDATE users SET company_id = $1 WHERE id = $2`, [newCompanyId, user.id]);
      user.company_id = newCompanyId;
    } else {
      // Помечаем приглашение использованным
      await query(`UPDATE invites SET status = 'accepted' WHERE id = $1`, [inviteId]);
    }

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
