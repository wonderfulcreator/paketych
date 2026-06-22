export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionCookie, getSessionUser } from "@/lib/auth";

const VALID_OPTIONS = ["mandarin_classic", "mandarin_family", "mandarin_new"];

// GET /api/design-vote — текущие результаты + голос текущего пользователя
export async function GET() {
  try {
    const rows = await query<{ option_id: string; count: string }>(
      `SELECT option_id, COUNT(*) as count FROM design_votes GROUP BY option_id`
    );

    const results: Record<string, number> = {};
    for (const opt of VALID_OPTIONS) results[opt] = 0;
    for (const row of rows) results[row.option_id] = parseInt(row.count);

    let myVote: string | null = null;
    const sessionId = getSessionCookie();
    if (sessionId) {
      const user = await getSessionUser(sessionId);
      if (user) {
        const existing = await queryOne<{ option_id: string }>(
          `SELECT option_id FROM design_votes WHERE user_id = $1`,
          [user.id]
        );
        myVote = existing?.option_id ?? null;
      }
    }

    return NextResponse.json({ ok: true, results, myVote });
  } catch (err) {
    console.error("[design-vote GET]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// POST /api/design-vote { optionId }
export async function POST(req: NextRequest) {
  try {
    const sessionId = getSessionCookie();
    if (!sessionId) return NextResponse.json({ ok: false, error: "Войдите, чтобы проголосовать" }, { status: 401 });

    const user = await getSessionUser(sessionId);
    if (!user) return NextResponse.json({ ok: false, error: "Войдите, чтобы проголосовать" }, { status: 401 });

    const { optionId } = await req.json();
    if (!VALID_OPTIONS.includes(optionId)) {
      return NextResponse.json({ ok: false, error: "Некорректный вариант" }, { status: 400 });
    }

    await query(
      `INSERT INTO design_votes (user_id, option_id) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET option_id = $2, created_at = NOW()`,
      [user.id, optionId]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[design-vote POST]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
