import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { StoreProvider } from "@/providers/StoreProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Пакет Пакетыч — подарочная упаковка оптом от производителя",
  description: "Подарочные пакеты и упаковка оптом от 1 коробки. Новогодняя коллекция, базовый ассортимент, удобный каталог и быстрая заказ менеджеру.",
  openGraph: {
    title: "Пакет Пакетыч — подарочная упаковка оптом",
    description: "Подарочные пакеты оптом от 1 коробки. Каталог и заказ онлайн.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <StoreProvider>
            <ToastProvider>
              <div className="relative z-10 flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </ToastProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
