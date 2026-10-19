"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Layers,
  Download,
  Ruler,
} from "lucide-react";
import { PLAYGROUND_PRODUCTS } from "@/lib/factory-data";

export default function PlaygroundsPage() {
  const [query, setQuery] = useState("");

  const filtered = PLAYGROUND_PRODUCTS.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [p.code, p.title, p.info, p.dimensions, ...p.keys]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link href="/" className="hover:text-emerald-700">
            Главная
          </Link>
          <span>/</span>
          <strong className="text-slate-900">Детские городки</strong>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> На главную
        </Link>
      </div>

      <section className="rounded-3xl bg-gradient-to-r from-[#174b35] to-[#2f7652] p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-300">
              <Layers className="h-4 w-4" /> Основная категория №1
            </span>
            <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold tracking-tight">
              Каталог детских игровых городков
            </h1>
            <p className="mt-2 text-sm text-slate-200">
              Выберите серию городка для просмотра состава изделия, цветов RAL,
              чертежей деталей и метизов.
            </p>
          </div>
          <span className="rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-extrabold text-emerald-200">
            Всего в базе: {filtered.length} из {PLAYGROUND_PRODUCTS.length}
          </span>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-900 shadow">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по коду модели (1.07, 1.08, 1.15), габаритам или ключевым словам..."
            className="w-full bg-transparent text-sm sm:text-base font-medium focus:outline-none"
          />
        </div>
      </section>

      <section className="mt-8 flex flex-col gap-3">
        {filtered.map((product) => (
          <article
            key={product.code}
            className="hc-card-anim flex flex-col sm:flex-row sm:items-stretch justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-emerald-400"
          >
            <div>
              <Link
                href={`/product/${product.specCode}`}
                className="group block relative h-44 w-full sm:w-56 sm:min-w-56 bg-slate-50 p-4 border-b sm:border-b-0 sm:border-r border-slate-100 overflow-hidden"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <span
                  style={{ fontFamily: "var(--font-mono)" }}
                  className="absolute left-3 top-3 rounded-xl bg-[#174b35]/90 px-3 py-1 text-xs font-extrabold text-white shadow"
                >
                  {product.code}
                </span>
              </Link>

              <div className="p-5">
                <h2 className="text-lg font-extrabold text-slate-900">
                  {product.title}
                </h2>
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Ruler className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Габариты: {product.dimensions}</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">{product.info}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 bg-slate-50/60 p-4 sm:min-w-56">
              <Link
                href={`/product/${product.specCode}`}
                className="flex flex-1 items-center justify-between rounded-xl bg-[#174b35] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-700 transition-colors"
              >
                <span>Открыть техкарту</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {product.excelFile && (
                <a
                  href={`/downloads/${encodeURIComponent(product.excelFile)}`}
                  download={product.excelFile}
                  data-file-name={product.excelFile}
                  data-file-title={`Спецификация ${product.code}`}
                  data-file-type="XLSX"
                  data-article={product.code}
                  data-category="Спецификации городков"
                  title="Скачать Excel-спецификацию"
                  className="flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-xs font-extrabold text-emerald-900 hover:bg-emerald-100"
                >
                  <Download className="h-3.5 w-3.5" /> XLSX
                </a>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
