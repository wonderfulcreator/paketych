"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

/* ── SVG-иконки ────────────────────────────────────────────── */
function EyeOpen() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function EyeOff() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3 3.8M6.6 6.6A17.6 17.6 0 0 0 2 11s3.5 7 10 7a10.9 10.9 0 0 0 4-.7"/><path d="m3 3 18 18"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>
    </svg>
  );
}

/* ── Конфетти ───────────────────────────────────────────────── */
function Confetti() {
  const colors = ["#F97316","#FB923C","#DC2626","#FACC15","#34D399","#fff"];
  const pieces = Array.from({ length: 26 }, (_, i) => ({
    l: Math.random() * 100,
    d: 0.1 + Math.random() * 0.5,
    dur: 0.9 + Math.random() * 0.8,
    c: colors[i % colors.length],
    r: Math.random() * 360,
    s: 7 + Math.random() * 7,
  }));
  return (
    <div className="pp-confetti">
      {pieces.map((b, i) => (
        <span key={i} style={{
          left: b.l + "%", animationDelay: b.d + "s", animationDuration: b.dur + "s",
          background: b.c, width: b.s, height: b.s * 0.6, transform: `rotate(${b.r}deg)`,
        }}/>
      ))}
    </div>
  );
}

/* ── Маскот ─────────────────────────────────────────────────── */
const TX  = { idle:0, email:14, eager:22, password:-16, peek:-8, success:0, error:0, btn:26 } as Record<string, number>;
const ROT = { idle:0, email:4,  eager:7,  password:-7,  peek:-3, success:0, error:0, btn:8  } as Record<string, number>;
const BUBBLE = {
  idle:     "Привет! Рад видеть тебя 👋",
  email:    "Введи свой email",
  eager:    "Почти готово! 🎯",
  password: "Не подсматриваю, честно!",
  peek:     "Один глазком… окей, смотрю",
  success:  "Ура! Заходи скорее 🎉",
  error:    "Хм, что-то не так…",
  btn:      "Нажимай, жду! 😄",
} as Record<string, string>;

interface MascotProps {
  pose: string;
  lookX: number;
  lookY: number;
  oneShot: string;
  oneShotKey: number;
  scrollY: number;
}

function Mascot({ pose, lookX, lookY, oneShot, oneShotKey, scrollY }: MascotProps) {
  const loop = pose === "success" ? "jump" : pose === "error" ? "shake" : "bob";
  const tx  = TX[pose]  ?? 0;
  const rot = ROT[pose] ?? 0;
  return (
    <div key={oneShotKey} className={`pp-os pp-os--${oneShot}`}
      style={{ width: "100%", height: "100%", position: "relative" }}>
      <div className={`pp-body pp-body--${loop}`}
        style={{ width: "100%", height: "100%", display: "block" }}>
        <div style={{ transform: `translateY(${-scrollY * 0.13}px)`, width: "100%", height: "100%" }}>
          <div style={{
            transform: `translateX(${tx}px) rotate(${rot}deg)`,
            transition: "transform .42s cubic-bezier(.34,1.3,.55,1)",
            transformOrigin: "50% 80%",
            width: "100%", height: "100%",
          }}>
            <div style={{
              transform: `rotate(${lookX * 3}deg) translateY(${lookY * 4}px)`,
              transition: "transform .16s ease-out",
              width: "100%", height: "100%",
            }}>
              <Image
                src="/brand/mascot-wink.png"
                alt="Пакет Пакетыч"
                width={320} height={320}
                draggable={false}
                priority
                style={{
                  width: "100%", height: "100%", objectFit: "contain",
                  userSelect: "none", display: "block",
                  filter: "drop-shadow(0 16px 32px rgba(150,60,0,.22))",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Основной компонент ─────────────────────────────────────── */
function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get("redirect") || "/account";
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [focus, setFocus]       = useState<string | null>(null);
  const [status, setStatus]     = useState("idle");
  const [look, setLook]         = useState({ x: 0, y: 0 });
  const [hover, setHover]       = useState<string | null>(null);
  const [oneShot, setOneShot]   = useState("entrance");
  const [oneShotKey, setKey]    = useState(0);
  const [scrollY, setScrollY]   = useState(0);
  const [serverErr, setServerErr] = useState("");

  const stageRef  = useRef<HTMLDivElement>(null);
  const errTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKP    = useRef(0);
  const prevValid = useRef(false);

  const playOS = useCallback((anim: string) => {
    setOneShot(anim);
    setKey(k => k + 1);
  }, []);

  const resetIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => playOS("wiggle"), 5500);
  }, [playOS]);

  useEffect(() => {
    playOS("entrance");
    resetIdle();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (errTimer.current)  clearTimeout(errTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const onMove = useCallback((e: PointerEvent) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setLook({
      x: Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width * 0.5)) / (r.width * 0.55))),
      y: Math.max(-1, Math.min(1, (e.clientY - (r.top  + r.height * 0.4)) / (r.height * 0.55))),
    });
    resetIdle();
  }, [resetIdle]);

  useEffect(() => {
    window.addEventListener("pointermove", onMove as EventListener);
    return () => window.removeEventListener("pointermove", onMove as EventListener);
  }, [onMove]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  useEffect(() => {
    if (emailValid && !prevValid.current) playOS("approve");
    prevValid.current = emailValid;
  }, [emailValid, playOS]);

  const onKey = useCallback(() => {
    const now = Date.now();
    if (now - lastKP.current > 160) { playOS("keypress"); lastKP.current = now; }
    resetIdle();
  }, [playOS, resetIdle]);

  const formReady = emailValid && password.length >= 1;
  let pose = "idle";
  if      (hover === "btn")      pose = "btn";
  else if (status === "success") pose = "success";
  else if (status === "error")   pose = "error";
  else if (focus === "password") pose = showPwd ? "peek" : "password";
  else if (formReady)            pose = "eager";
  else if (focus === "email")    pose = "email";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerErr("");
    if (errTimer.current) clearTimeout(errTimer.current);
    resetIdle();
    const res = await login(email, password);
    if (res.ok) {
      setFocus(null);
      setStatus("success");
      setTimeout(() => router.push(redirect), 1100);
    } else {
      setStatus("error");
      setServerErr(res.error || "Неверный email или пароль");
      errTimer.current = setTimeout(() => setStatus("idle"), 1800);
    }
  }

  const bubble = BUBBLE[status !== "idle" ? status : pose] ?? BUBBLE.idle;

  return (
    <>
      <style>{`
        .pp-root { width: 100%; min-height: 100vh; background: #1d1d22;
          display: flex; align-items: center; justify-content: center; padding: 28px; }
        .pp-card {
          display: grid; grid-template-columns: 1.05fr 1fr;
          background: #fff; border-radius: 30px; overflow: hidden;
          box-shadow: 0 40px 90px -30px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.04);
          min-height: 600px; width: 100%; max-width: 1000px;
        }
        .pp-stage {
          position: relative;
          background: radial-gradient(120% 90% at 30% 10%, rgba(255,255,255,.6), transparent 60%), #FFEDD5;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 40px 30px 30px; overflow: hidden;
        }
        .pp-stage::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(circle at 1px 1px, rgba(234,88,12,.12) 1.4px, transparent 0);
          background-size: 26px 26px;
          -webkit-mask-image: radial-gradient(circle at 50% 45%, #000 35%, transparent 72%);
          mask-image: radial-gradient(circle at 50% 45%, #000 35%, transparent 72%);
          opacity: .55;
        }
        .pp-stage-inner {
          position: relative; width: 100%; max-width: 360px;
          aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center;
        }
        .pp-mascot-wrap { width: 88%; height: 88%; cursor: pointer; }
        .pp-bubble {
          position: relative; margin-top: 10px; background: #fff; color: #2A1A10;
          font-weight: 700; font-size: 15px; padding: 11px 18px; border-radius: 16px;
          box-shadow: 0 10px 24px -12px rgba(0,0,0,.3); max-width: 300px; text-align: center;
          transition: background .3s, color .3s; z-index: 3;
        }
        .pp-bubble::after {
          content: ''; position: absolute; top: -8px; left: 50%; transform: translateX(-50%);
          border: 8px solid transparent; border-bottom-color: #fff; border-top: 0;
        }
        .pp-bubble-success { background: #F97316 !important; color: #fff !important; }
        .pp-bubble-success::after { border-bottom-color: #F97316 !important; }
        .pp-bubble-error { background: #DC2626 !important; color: #fff !important; }
        .pp-bubble-error::after { border-bottom-color: #DC2626 !important; }
        .pp-brandmark {
          position: absolute; top: 24px; left: 26px;
          font-weight: 900; font-size: 12px; letter-spacing: .14em;
          color: #EA580C; display: flex; align-items: center; gap: 7px; z-index: 3;
        }
        .pp-brandmark-dot { width: 9px; height: 9px; border-radius: 3px; background: #DC2626; box-shadow: 3px 0 0 #F97316; }
        .pp-form-panel { display: flex; align-items: center; justify-content: center; padding: 48px 40px; }
        .pp-form { width: 100%; max-width: 320px; }
        .pp-logo { display: flex; justify-content: center; margin-bottom: 16px; }
        .pp-title { font-size: 28px; font-weight: 900; margin: 0 0 6px; text-align: center; letter-spacing: -.02em; color: #2A1A10; }
        .pp-sub { margin: 0 0 24px; text-align: center; color: #9b8e80; font-weight: 600; font-size: 14px; }
        .pp-field { display: block; position: relative; margin-bottom: 20px; }
        .pp-label { display: block; font-size: 12px; font-weight: 700; color: #8a7d6f; margin-bottom: 7px; }
        .pp-field input {
          width: 100%; border: 0; border-bottom: 2px solid #E7DECF;
          background: transparent; padding: 6px 2px 9px; font-size: 16px; font-weight: 600;
          font-family: inherit; color: #2A1A10; outline: none; transition: border-color .25s;
        }
        .pp-field input::placeholder { color: #cbbfa8; font-weight: 600; }
        .pp-field-focus input { border-bottom-color: #F97316; }
        .pp-field-err input { border-bottom-color: #DC2626; }
        .pp-field-err .pp-label { color: #DC2626; }
        .pp-eye {
          position: absolute; right: 0; bottom: 6px; background: none; border: 0; cursor: pointer;
          color: #b6a994; padding: 4px; display: flex; transition: color .2s;
        }
        .pp-eye:hover { color: #F97316; }
        .pp-forgot { display: flex; justify-content: flex-end; margin: -8px 0 20px; }
        .pp-link { color: #9b8e80; font-weight: 700; font-size: 13px; text-decoration: none; }
        .pp-link:hover { color: #F97316; }
        .pp-btn {
          width: 100%; border: 0; cursor: pointer; font-family: inherit;
          background: #F97316; color: #fff; font-weight: 800; font-size: 16px;
          padding: 14px; border-radius: 14px; letter-spacing: .01em;
          box-shadow: 0 14px 26px -10px rgba(249,115,22,.5);
          transition: transform .12s, background .2s, box-shadow .2s;
        }
        .pp-btn:hover { background: #EA580C; transform: translateY(-1px); }
        .pp-btn:active { transform: translateY(1px) scale(.99); }
        .pp-err-msg { color: #DC2626; font-size: 13px; font-weight: 700; text-align: center; margin: 12px 0 0; }
        .pp-foot { text-align: center; margin: 22px 0 0; font-size: 13.5px; font-weight: 600; color: #8a7d6f; }
        .pp-foot a { color: #EA580C; font-weight: 700; text-decoration: none; }
        .pp-foot a:hover { color: #F97316; }
        .pp-confetti { position: absolute; inset: -10% 0 0; pointer-events: none; z-index: 4; }
        .pp-confetti span {
          position: absolute; top: -8%; border-radius: 2px;
          animation: pp-fall ease-in 1 forwards;
        }
        @keyframes pp-fall {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(440px) rotate(540deg); opacity: 0; }
        }
        .pp-body { display: block; width: 100%; height: 100%; position: relative; }
        .pp-body--bob  { animation: pp-bob   3.8s ease-in-out infinite; }
        .pp-body--jump { animation: pp-jump  1.0s cubic-bezier(.3,1.5,.5,1) both; }
        .pp-body--shake { animation: pp-shake .55s ease-in-out 0s 2 both; }
        @keyframes pp-bob {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%     { transform: translateY(-12px) rotate(-1.2deg); }
        }
        @keyframes pp-jump {
          0%   { transform: translateY(0) rotate(0deg) scale(1); }
          28%  { transform: translateY(-54px) rotate(5deg) scale(1.05); }
          52%  { transform: translateY(0) scaleY(.92); }
          72%  { transform: translateY(-16px) rotate(-3deg); }
          100% { transform: translateY(0) rotate(0deg) scale(1); }
        }
        @keyframes pp-shake {
          0%,100% { transform: translateX(0) rotate(0deg); }
          25%     { transform: translateX(-14px) rotate(-4deg); }
          75%     { transform: translateX(14px) rotate(4deg); }
        }
        .pp-os--entrance { animation: pp-entrance .92s cubic-bezier(.2,1,.4,1) both; }
        .pp-os--wiggle   { animation: pp-wiggle   .85s ease-in-out both; }
        .pp-os--spin     { animation: pp-spin     .72s cubic-bezier(.3,1.5,.5,1) both; }
        .pp-os--keypress { animation: pp-keypress .18s ease-out both; }
        .pp-os--approve  { animation: pp-approve  .52s cubic-bezier(.3,1.5,.5,1) both; }
        .pp-os--none     {}
        @keyframes pp-entrance {
          0%   { transform: translateY(90px) scale(.82); opacity: 0; }
          55%  { transform: translateY(-14px) scale(1.04); opacity: 1; }
          75%  { transform: translateY(7px) scale(.97); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes pp-wiggle {
          0%,100% { transform: rotate(0); }
          15% { transform: rotate(-9deg) scale(1.06); }
          40% { transform: rotate(8deg)  scale(1.06); }
          62% { transform: rotate(-5deg); }
          82% { transform: rotate(4deg); }
        }
        @keyframes pp-spin {
          0%   { transform: rotate(0)      scale(1); }
          35%  { transform: rotate(200deg) scale(1.15) translateY(-22px); }
          65%  { transform: rotate(340deg) scale(.92); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes pp-keypress {
          0%,100% { transform: translateY(0); }
          45%     { transform: translateY(-10px) scale(1.04); }
        }
        @keyframes pp-approve {
          0%   { transform: translateY(0) rotate(0); }
          25%  { transform: translateY(-22px) rotate(6deg) scale(1.08); }
          55%  { transform: translateY(5px) rotate(-2deg); }
          100% { transform: translateY(0) rotate(0); }
        }
        @media (max-width: 860px) {
          .pp-root { padding: 0; align-items: stretch; }
          .pp-card { grid-template-columns: 1fr; min-height: 100vh; border-radius: 0; max-width: none; }
          .pp-stage { min-height: 38vh; padding-top: 60px; order: -1; }
          .pp-stage-inner { max-width: 220px; }
          .pp-form-panel { padding: 32px 24px 52px; }
          .pp-bubble { font-size: 13px; }
        }
        @media (prefers-reduced-motion: reduce) { .pp-body { animation: none !important; } }
      `}</style>

      <div className="pp-root">
        <div className="pp-card">

          {/* ── Панель маскота ── */}
          <div className="pp-stage" ref={stageRef}>
            <div className="pp-stage-inner">
              <div className="pp-mascot-wrap"
                onClick={() => { playOS("spin"); resetIdle(); }}
                onMouseEnter={() => playOS("wiggle")}>
                <Mascot pose={pose} lookX={look.x} lookY={look.y}
                  oneShot={oneShot} oneShotKey={oneShotKey} scrollY={scrollY}/>
              </div>
              {status === "success" && <Confetti/>}
            </div>
            <div className={`pp-bubble ${status === "success" ? "pp-bubble-success" : status === "error" ? "pp-bubble-error" : ""}`}>
              {bubble}
            </div>
            <div className="pp-brandmark">
              <span className="pp-brandmark-dot"/> ПАКЕТ ПАКЕТЫЧ
            </div>
          </div>

          {/* ── Форма ── */}
          <div className="pp-form-panel">
            <form className="pp-form" onSubmit={submit} autoComplete="off">
              <div className="pp-logo">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M5 8h14l-1 12H6L5 8Z" stroke="#F97316" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M8.5 8a3.5 3.5 0 0 1 7 0" stroke="#F97316" strokeWidth="2"/>
                </svg>
              </div>
              <h1 className="pp-title">С возвращением!</h1>
              <p className="pp-sub">Войдите, чтобы оформить заказ</p>

              <label className={`pp-field ${focus === "email" ? "pp-field-focus" : ""} ${status === "error" ? "pp-field-err" : ""}`}>
                <span className="pp-label">E-mail</span>
                <input type="email" value={email} placeholder="anna@mail.ru"
                  onFocus={() => { setFocus("email"); resetIdle(); }}
                  onBlur={() => setFocus(null)}
                  onKeyDown={onKey}
                  onChange={e => { setEmail(e.target.value); if (status === "error") setStatus("idle"); setServerErr(""); }}
                />
              </label>

              <label className={`pp-field ${focus === "password" ? "pp-field-focus" : ""} ${status === "error" ? "pp-field-err" : ""}`}>
                <span className="pp-label">Пароль</span>
                <input type={showPwd ? "text" : "password"} value={password} placeholder="••••••••"
                  onFocus={() => { setFocus("password"); resetIdle(); }}
                  onBlur={() => setFocus(null)}
                  onKeyDown={onKey}
                  onChange={e => { setPassword(e.target.value); if (status === "error") setStatus("idle"); setServerErr(""); }}
                />
                <button type="button" className="pp-eye"
                  onClick={() => { setShowPwd(v => !v); resetIdle(); }}
                  aria-label={showPwd ? "Скрыть пароль" : "Показать пароль"}>
                  {showPwd ? <EyeOpen/> : <EyeOff/>}
                </button>
              </label>

              <div className="pp-forgot">
                <Link href="#" className="pp-link">Забыли пароль?</Link>
              </div>

              <button type="submit" className="pp-btn"
                onMouseEnter={() => setHover("btn")}
                onMouseLeave={() => setHover(null)}>
                Войти
              </button>

              {serverErr && <p className="pp-err-msg">{serverErr}</p>}

              <p className="pp-foot">
                Ещё нет аккаунта?{" "}
                <Link href="/register">Зарегистрируйтесь</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner/>
    </Suspense>
  );
}
