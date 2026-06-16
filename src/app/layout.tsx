import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { StoreProvider } from "@/providers/StoreProvider";
import { CompareProvider } from "@/providers/CompareProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCart } from "@/components/FloatingCart";
import { PageProgress } from "@/components/PageProgress";
import { YandexMetrika } from "@/components/YandexMetrika";
import { CompareBar } from "@/components/CompareBar";
import { HotkeysProvider } from "@/components/HotkeysProvider";

export const metadata: Metadata = {
  title: "Пакет Пакетыч — подарочная упаковка оптом от производителя",
  description: "Подарочные пакеты и упаковка оптом от 1 коробки. Авторские коллекции, удобный каталог и быстрая заявка менеджеру.",
  openGraph: {
    title: "Пакет Пакетыч — подарочная упаковка оптом",
    description: "Подарочные пакеты оптом от 1 коробки.",
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
        <YandexMetrika />
        <HotkeysProvider />
        <AuthProvider>
          <StoreProvider>
            <CompareProvider>
              <ToastProvider>
                <PageProgress />
                <div className="relative z-10 flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <FloatingCart />
                <CompareBar />
              </ToastProvider>
            </CompareProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
