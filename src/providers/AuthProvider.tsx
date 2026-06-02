"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/lib/types";

type StoredUser = User & { password: string };

type AuthContextType = {
  user: User | null;
  ready: boolean;
  register: (u: StoredUser) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "pp_users";
const SESSION_KEY = "pp_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) setUser(JSON.parse(session));
    } catch {}
    setReady(true);
  }, []);

  function readUsers(): StoredUser[] {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function register(u: StoredUser) {
    const users = readUsers();
    if (users.some((x) => x.email.toLowerCase() === u.email.toLowerCase())) {
      return { ok: false, error: "Пользователь с таким email уже существует" };
    }
    users.push(u);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const session: User = {
      email: u.email,
      name: u.name,
      company: u.company,
      phone: u.phone,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  }

  function login(email: string, password: string) {
    const users = readUsers();
    const found = users.find(
      (x) => x.email.toLowerCase() === email.toLowerCase()
    );
    if (!found || found.password !== password) {
      return { ok: false, error: "Неверный email или пароль" };
    }
    const session: User = {
      email: found.email,
      name: found.name,
      company: found.company,
      phone: found.phone,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
