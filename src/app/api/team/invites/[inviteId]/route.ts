export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

// GET /api/team/invites/:inviteId — публичная информация о приглашении
export async function GET(
  _req: NextRequest,
  { params }: { params: { inviteId: string } }
) {
  try {
    const invite = await queryOne<{ email: string; status: string; expires_at: string; company_name: string }>(
      `SELECT i.email, i.status, i.expires_at, c.name AS company_name
       FROM invites i
       JOIN companies c ON c.id = i.company_id
       WHERE i.id = $1`,
      [params.inviteId]
    );

    if (!invite) {
      return NextResponse.json({ ok: false, error: "Приглашение не найдено" }, { status: 404 });
    }

    const isValid = invite.status === "pending" && new Date(invite.expires_at) > new Date();

    return NextResponse.json({
      ok: true,
      valid: isValid,
      email: invite.email,
      companyName: invite.company_name,
    });
  } catch (err) {
    console.error("[team/invites/:id GET]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
