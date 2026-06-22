"use client";

const STORAGE_KEY = "pp_sound_enabled";

// Короткие звуки в виде Web Audio API осцилляторов — без внешних файлов,
// легче, чем грузить mp3, и звучит достаточно мягко на низкой громкости.
function playTone(freq: number, duration: number, volume: number) {
  if (typeof window === "undefined") return;
  if (!isSoundEnabled()) return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    osc.onended = () => ctx.close();
  } catch {
    // Web Audio недоступен — тихо игнорируем
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "1";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  } catch {}
}

// Лёгкий "клик" — добавление в корзину/избранное
export function playClickSound() {
  playTone(680, 0.08, 0.04);
}

// Мягкое "вжух" — успешное действие (заказ оформлен)
export function playSuccessSound() {
  playTone(520, 0.12, 0.035);
  setTimeout(() => playTone(780, 0.15, 0.035), 90);
}

// Тактильная вибрация (мобильные устройства, Web Vibration API)
export function vibrate(pattern: number | number[] = 12) {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  if (!isSoundEnabled()) return;
  try {
    navigator.vibrate(pattern);
  } catch {}
}
