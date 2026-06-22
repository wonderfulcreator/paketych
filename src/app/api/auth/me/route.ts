export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSessionCookie, getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const sessionId = getSessionCookie();
    if (!sessionId) {
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }

    const user = await getSessionUser(sessionId);
    if (!user) {
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("[me]", err);
    return NextResponse.json({ ok: false, user: null }, { status: 500 });
  }
}
