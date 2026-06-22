export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionCookie, getSessionUser } from "@/lib/auth";

// GET /api/team/members — список коллег + ожидающие приглашения
export async function GET() {
  try {
    const sessionId = getSessionCookie();
    if (!sessionId) return NextResponse.json({ ok: false }, { status: 401 });

    const user = await getSessionUser(sessionId);
    if (!user || !user.company_id) return NextResponse.json({ ok: true, members: [], invites: [] });

    const members = await query<{ id: number; name: string; email: string; role: string; created_at: string }>(
      `SELECT id, name, email, role, created_at FROM users
       WHERE company_id = $1
       ORDER BY role = 'owner' DESC, created_at ASC`,
      [user.company_id]
    );

    const invites = await query<{ id: string; email: string; created_at: string; expires_at: string }>(
      `SELECT id, email, created_at, expires_at FROM invites
       WHERE company_id = $1 AND status = 'pending' AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [user.company_id]
    );

    return NextResponse.json({ ok: true, members, invites, currentUserId: user.id, currentUserRole: user.role });
  } catch (err) {
    console.error("[team/members GET]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// POST /api/team/members  { revokeInviteId } — отозвать приглашение
export async function POST(req: NextRequest) {
  try {
    const sessionId = getSessionCookie();
    if (!sessionId) return NextResponse.json({ ok: false }, { status: 401 });

    const user = await getSessionUser(sessionId);
    if (!user || user.role !== "owner") {
      return NextResponse.json({ ok: false, error: "Только владелец может управлять командой" }, { status: 403 });
    }

    const { revokeInviteId } = await req.json();
    if (revokeInviteId) {
      await query(
        `UPDATE invites SET status = 'expired' WHERE id = $1 AND company_id = $2`,
        [revokeInviteId, user.company_id]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[team/members POST]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
