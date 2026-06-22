import { cookies } from "next/headers";
import { query, queryOne } from "@/lib/db";
import * as crypto from "crypto";

// ── Пароли ────────────────────────────────────────────────────────────────────
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    const verify = crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex");
    return verify === hash;
  } catch {
    return false;
  }
}

// ── Сессии ────────────────────────────────────────────────────────────────────
const SESSION_COOKIE = "pp_session";

export async function createSession(userId: number): Promise<string> {
  const rows = await query<{ id: string }>(
    `INSERT INTO sessions (user_id)
     VALUES ($1)
     RETURNING id`,
    [userId]
  );
  return rows[0].id;
}

export async function getSessionUser(sessionId: string) {
  return queryOne<{
    id: number;
    email: string;
    name: string;
    company: string;
    phone: string;
    company_id: number | null;
    role: string;
  }>(
    `SELECT u.id, u.email, u.name, u.company, u.phone, u.company_id, u.role
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = $1
       AND s.expires_at > NOW()`,
    [sessionId]
  );
}

export async function deleteSession(sessionId: string): Promise<void> {
  await query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
}

export function getSessionCookie(): string | undefined {
  return cookies().get(SESSION_COOKIE)?.value;
}

export function setSessionCookie(sessionId: string): void {
  cookies().set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 дней
    path: "/",
  });
}

export function clearSessionCookie(): void {
  cookies().delete(SESSION_COOKIE);
}
