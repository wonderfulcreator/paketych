export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSessionCookie, deleteSession, clearSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    const sessionId = getSessionCookie();
    if (sessionId) {
      await deleteSession(sessionId);
      clearSessionCookie();
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[logout]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
