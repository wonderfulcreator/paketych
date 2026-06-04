import { NextRequest } from "next/server";

export function verifyToken(request: NextRequest): boolean {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const secret = process.env.SYNC_SECRET_KEY || "";
  if (!secret) return false;
  return token === secret;
}

export function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
