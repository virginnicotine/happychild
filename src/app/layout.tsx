import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, JetBrains_Mono } from "next/font/google";
import FactoryHeader from "@/components/FactoryHeader";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Счастливый ребёнок — Единая техническая система завода",
  description:
    "База изделий, чертежей DXF/PDF, сборочных узлов, элементов благоустройства и личный кабинет сотрудников предприятия.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <body
        style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}
        className="min-h-screen flex flex-col bg-[#f1f5f9] text-slate-900 antialiased selection:bg-emerald-200 selection:text-slate-950"
      >
        <FactoryHeader />
        <div className="flex-1">{children}</div>
        <footer className="mt-16 border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <strong className="font-bold text-slate-700">
                © Завод «Счастливый ребёнок»
              </strong>
              <span>· Единая техническая информационная система</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span>Администратор системы: Дарья Алексеевна</span>
              <a
                href="/downloads/happychild-sourcecraft-update.zip"
                download
                data-file-name="happychild-sourcecraft-update.zip"
                data-file-title="Архив обновлённого кода для SourceCraft"
                data-file-type="ZIP"
                data-category="Обновление системы"
                className="font-bold text-emerald-700 hover:underline"
              >
                Скачать ZIP с кодом для SourceCraft ↓
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
