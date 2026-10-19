import React from "react";
import Link from "next/link";
import { History, ArrowLeft, CheckCircle2, Download } from "lucide-react";
import { CHANGELOG_ENTRIES } from "@/lib/factory-data";

export default function ChangelogPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pt-6 pb-16 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link href="/" className="hover:text-emerald-700">
            Главная
          </Link>
          <span>/</span>
          <strong className="text-slate-900">История изменений</strong>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> На главную
        </Link>
      </div>

      <section className="rounded-3xl bg-gradient-to-r from-[#174b35] to-[#1a3e63] p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-300">
              <History className="h-4 w-4" /> Журнал обновлений техсистемы
            </span>
            <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold tracking-tight">
              История изменений сайта завода
            </h1>
            <p className="mt-2 text-sm text-slate-200">
              Все доработки интерфейса, структуры разделов, чертежей и личных
              кабинетов сотрудников.
            </p>
          </div>
          <a
            href="/downloads/happychild-sourcecraft-update.zip"
            download
            data-file-name="happychild-sourcecraft-update.zip"
            data-file-title="Архив обновлённого кода для SourceCraft"
            data-file-type="ZIP"
            data-category="Обновление системы"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-xs font-extrabold text-slate-950 hover:bg-emerald-300 shadow"
          >
            <Download className="h-4 w-4" />
            Скачать пакет обновлений (.zip)
          </a>
        </div>
      </section>

      <div className="mt-8 space-y-5">
        {CHANGELOG_ENTRIES.map((entry) => (
          <article
            key={entry.date + entry.title}
            className="hc-card-anim rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-900">
                  {entry.date}
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-900">
                  {entry.badge}
                </span>
              </div>
            </div>
            <h2 className="mt-4 text-lg sm:text-xl font-extrabold text-slate-900">
              {entry.title}
            </h2>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-700">
              {entry.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}
