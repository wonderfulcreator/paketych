export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionCookie, getSessionUser } from "@/lib/auth";

// POST /api/team/invite  { email }
export async function POST(req: NextRequest) {
  try {
    const sessionId = getSessionCookie();
    if (!sessionId) return NextResponse.json({ ok: false }, { status: 401 });

    const user = await getSessionUser(sessionId);
    if (!user || !user.company_id) {
      return NextResponse.json({ ok: false, error: "Компания не найдена" }, { status: 400 });
    }
    if (user.role !== "owner") {
      return NextResponse.json({ ok: false, error: "Только владелец может приглашать сотрудников" }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Укажите корректный email" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Уже зарегистрирован?
    const existingUser = await queryOne(`SELECT id FROM users WHERE email = $1`, [normalizedEmail]);
    if (existingUser) {
      return NextResponse.json({ ok: false, error: "Этот email уже зарегистрирован" }, { status: 409 });
    }

    // Уже есть активное приглашение?
    const existingInvite = await queryOne(
      `SELECT id FROM invites WHERE email = $1 AND company_id = $2 AND status = 'pending' AND expires_at > NOW()`,
      [normalizedEmail, user.company_id]
    );
    if (existingInvite) {
      return NextResponse.json({ ok: false, error: "Приглашение этому email уже отправлено" }, { status: 409 });
    }

    const rows = await query<{ id: string }>(
      `INSERT INTO invites (company_id, email, invited_by) VALUES ($1, $2, $3) RETURNING id`,
      [user.company_id, normalizedEmail, user.id]
    );

    const inviteId = rows[0].id;
    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/register?invite=${inviteId}`;

    // Отправляем email-приглашение если настроен Resend
    try {
      const { sendTeamInvite } = await import("@/lib/email");
      await sendTeamInvite({
        to: normalizedEmail,
        inviterName: user.name,
        companyName: user.company,
        inviteUrl,
      });
    } catch (e) {
      console.warn("[team/invite] email send failed:", e);
    }

    return NextResponse.json({ ok: true, inviteId, inviteUrl });
  } catch (err) {
    console.error("[team/invite POST]", err);
    return NextResponse.json({ ok: false, error: "Ошибка сервера" }, { status: 500 });
  }
}
