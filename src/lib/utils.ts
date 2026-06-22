import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
}

export function discountPercent(base: number, sale: number): number {
  return Math.round((1 - sale / base) * 100);
}
