"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";

type Member = { id: number; name: string; email: string; role: string; created_at: string };
type Invite = { id: string; email: string; created_at: string; expires_at: string };

export default function TeamPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (ready && !user) router.replace("/login?redirect=/account/team");
  }, [ready, user, router]);

  function loadTeam() {
    fetch("/api/team/members", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setMembers(data.members ?? []);
          setInvites(data.invites ?? []);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadTeam(); }, []);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!email.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error || "Не удалось отправить приглашение"); }
      else { setSuccess(`Приглашение отправлено на ${email.trim()}`); setEmail(""); loadTeam(); }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setSending(false);
    }
  }

  async function revokeInvite(inviteId: string) {
    await fetch("/api/team/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ revokeInviteId: inviteId }),
    });
    loadTeam();
  }

  if (!ready || !user) return <div className="container py-12 text-gray-400">Загрузка…</div>;

  const isOwner = user.role === "owner";

  return (
    <div className="container py-8">
      <Link href="/account" className="text-sm text-gray-400 hover:text-orange-500">← Личный кабинет</Link>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-gray-900">Команда</h1>
      <p className="mt-1 text-sm text-gray-500">
        Сотрудники с доступом к корзине, заказам и истории компании «{user.company}».
      </p>

      {isOwner && (
        <form onSubmit={sendInvite} className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="email коллеги@компания.ru"
            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          <button type="submit" disabled={sending}
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-50">
            {sending ? "Отправка…" : "Пригласить"}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">{success}</p>}

      <div className="mt-6">
        <h2 className="font-display text-lg font-bold text-gray-900">Участники</h2>
        {loading ? (
          <div className="mt-3 text-sm text-gray-400">Загрузка…</div>
        ) : (
          <div className="mt-3 space-y-2">
            <AnimatePresence>
              {members.map(m => (
                <motion.div key={m.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-orange-600">
                      {m.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{m.name} {m.email === user.email && <span className="text-gray-400">(вы)</span>}</div>
                      <div className="text-xs text-gray-400">{m.email}</div>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${m.role === "owner" ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-500"}`}>
                    {m.role === "owner" ? "Владелец" : "Сотрудник"}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {invites.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display text-lg font-bold text-gray-900">Ожидают подтверждения</h2>
          <div className="mt-3 space-y-2">
            {invites.map(inv => (
              <div key={inv.id} className="flex items-center justify-between rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
                <div>
                  <div className="text-sm font-semibold text-gray-700">{inv.email}</div>
                  <div className="text-xs text-gray-400">
                    Приглашение действует до {new Date(inv.expires_at).toLocaleDateString("ru-RU")}
                  </div>
                </div>
                {isOwner && (
                  <button onClick={() => revokeInvite(inv.id)}
                    className="text-xs font-semibold text-gray-400 transition hover:text-red-500">
                    Отозвать
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
