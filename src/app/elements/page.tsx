"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trees,
  Armchair,
  Trash2,
  PanelTop,
  Download,
  ArrowLeft,
  Eye,
  Search,
} from "lucide-react";
import { LANDSCAPING_SUBCATEGORIES } from "@/lib/factory-data";

export default function ElementsPage() {
  const [activeTab, setActiveTab] = useState<
    "all" | "benches" | "urns" | "facades"
  >("all");
  const [query, setQuery] = useState("");
  const [lightbox, setLightbox] = useState<{
    src: string;
    title: string;
  } | null>(null);

  const visibleSubcategories = LANDSCAPING_SUBCATEGORIES.filter(
    (s) => activeTab === "all" || s.id === activeTab
  ).map((sub) => ({
    ...sub,
    items: sub.items.filter((it) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [it.article, it.name, it.material, it.dimensions, it.coating]
        .join(" ")
        .toLowerCase()
        .includes(q);
    }),
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link href="/" className="hover:text-emerald-700">
            Главная
          </Link>
          <span>/</span>
          <strong className="text-slate-900">Элементы благоустройства</strong>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> На главную
        </Link>
      </div>

      <section className="rounded-3xl bg-gradient-to-br from-[#174b35] via-[#205d42] to-[#246747] p-6 sm:p-8 text-white shadow-lg">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-300">
          <Trees className="h-4 w-4" /> Основная категория №3 (объединённый блок)
        </span>
        <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold tracking-tight">
          Элементы благоустройства
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-200">
          Три направления, объединённые в один удобный раздел для цеха:{" "}
          <strong>Лавочки</strong>, <strong>Урны</strong> и{" "}
          <strong>Фасадные элементы</strong> (окна, рамы, фронтоны крыш и
          декоративные панели).
        </p>

        {/* Subcategory filter buttons + search */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                activeTab === "all"
                  ? "bg-emerald-400 text-slate-950 shadow"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Все подразделы (3)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("benches")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                activeTab === "benches"
                  ? "bg-emerald-400 text-slate-950 shadow"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Armchair className="h-4 w-4" /> Лавочки
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("urns")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                activeTab === "urns"
                  ? "bg-emerald-400 text-slate-950 shadow"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Trash2 className="h-4 w-4" /> Урны
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("facades")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                activeTab === "facades"
                  ? "bg-emerald-400 text-slate-950 shadow"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <PanelTop className="h-4 w-4" /> Фасадные элементы
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-slate-900 w-full sm:w-72">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по артикулу или названию..."
              className="w-full bg-transparent text-xs font-semibold focus:outline-none"
            />
          </div>
        </div>
      </section>

      <div className="mt-8 space-y-10">
        {visibleSubcategories.map((sub) => (
          <section
            key={sub.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {sub.title}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  {sub.description}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-extrabold text-emerald-900">
                {sub.items.length} поз.
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sub.items.map((item) => (
                <article
                  key={item.article + item.name}
                  className="hc-card-anim flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-white hover:border-emerald-400"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        style={{ fontFamily: "var(--font-mono)" }}
                        className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-900"
                      >
                        {item.article}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700">
                        {item.status}
                      </span>
                    </div>

                    {item.image && (
                      <button
                        type="button"
                        onClick={() =>
                          setLightbox({
                            src: item.image!,
                            title: `${item.article} — ${item.name}`,
                          })
                        }
                        className="mt-3 flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </button>
                    )}

                    <h3 className="mt-3 text-sm font-extrabold text-slate-900">
                      {item.name}
                    </h3>

                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      <div>
                        Размер: <strong>{item.dimensions}</strong>
                      </div>
                      <div>Материал: {item.material}</div>
                      <div>Покрытие: {item.coating}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/70 flex flex-wrap gap-1.5">
                    {item.dxfFile && (
                      <a
                        href={`/downloads/dxf/${encodeURIComponent(
                          item.dxfFile
                        )}`}
                        download={item.dxfFile}
                        data-file-name={item.dxfFile}
                        data-file-title={`${item.article} — ${item.name}`}
                        data-file-type="DXF"
                        data-article={item.article}
                        data-category={`Благоустройство · ${sub.shortTitle}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-500"
                      >
                        <Download className="h-3.5 w-3.5" />
                        DXF ({item.dxfFile})
                      </a>
                    )}
                    {item.mirrorDxfFile && (
                      <a
                        href={`/downloads/dxf/${encodeURIComponent(
                          item.mirrorDxfFile
                        )}`}
                        download={item.mirrorDxfFile}
                        data-file-name={item.mirrorDxfFile}
                        data-file-title={`${item.article} — Зеркальный DXF`}
                        data-file-type="DXF"
                        data-article={item.article}
                        data-category="Зеркальные чертежи DXF"
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-400 bg-emerald-50 px-2.5 py-1.5 text-xs font-extrabold text-emerald-900 hover:bg-emerald-100"
                      >
                        🪞 {item.mirrorDxfFile}
                      </a>
                    )}
                    {item.image && (
                      <button
                        type="button"
                        onClick={() =>
                          setLightbox({
                            src: item.image!,
                            title: `${item.article} — ${item.name}`,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700"
                      >
                        <Eye className="h-3.5 w-3.5" /> Эскиз
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="max-w-3xl w-full rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <strong className="text-sm font-extrabold text-slate-900">
                {lightbox.title}
              </strong>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
              >
                Закрыть ×
              </button>
            </div>
            <div className="flex items-center justify-center bg-slate-50 rounded-xl p-6">
              <img
                src={lightbox.src}
                alt={lightbox.title}
                className="max-h-[65vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
