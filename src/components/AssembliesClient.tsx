"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  ArrowLeft,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getDxfFilesForArticle } from "@/lib/factory-data";

export interface AssemblyRow {
  article: string;
  name: string;
  qty: string;
  coating: string;
  material: string;
  weightOne: string;
  weightTotal: string;
}

export interface AssemblySection {
  title: string;
  countLabel: string;
  rows: AssemblyRow[];
}

export default function AssembliesClient({
  sections,
  metalIndex,
  initialFilter = "",
}: {
  sections: AssemblySection[];
  metalIndex: Record<string, Array<{ f: string; t: string }>>;
  initialFilter?: string;
}) {
  const [filter, setFilter] = useState(initialFilter);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const getMetalFiles = (article?: string) => {
    if (!article) return [];
    const s = String(article).trim().toUpperCase().replace(/Ё/g, "Е");
    const m = s.match(/^0*(\d+)\s*[МM][ПP]/);
    if (!m) return [];
    const numKey = String(parseInt(m[1], 10));
    return metalIndex[numKey] || [];
  };

  const filteredSections = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((sec) => {
        if (sec.title.toLowerCase().includes(q)) return sec;
        return {
          ...sec,
          rows: sec.rows.filter((r) =>
            [r.article, r.name, r.material, r.coating]
              .join(" ")
              .toLowerCase()
              .includes(q)
          ),
        };
      })
      .filter((sec) => sec.rows.length > 0);
  }, [sections, filter]);

  const totalRows = filteredSections.reduce((acc, s) => acc + s.rows.length, 0);

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link href="/" className="hover:text-emerald-700">
            Главная
          </Link>
          <span>/</span>
          <strong className="text-slate-900">
            Сборочные узлы и комплектующие
          </strong>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> На главную
        </Link>
      </div>

      <section className="rounded-3xl bg-gradient-to-r from-[#174b35] to-[#1a3e63] p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-300">
              <Package className="h-4 w-4" /> Технический справочник цеха
            </span>
            <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold tracking-tight">
              Сборочные узлы и комплектующие
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Состав сборочных узлов: горки (фанера ФСФ и ПНД), площадки и
              комплектующие с указанием покрытий, материалов, масс и чертежей
              DXF / МП.
            </p>
          </div>
          <span className="rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-extrabold text-emerald-200">
            Узлов: {filteredSections.length} · Позиций: {totalRows}
          </span>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-900 shadow">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Поиск артикула (000016, 0005МП), детали, материала (ПНД, ФСФ, нержавейка) или узла..."
            className="w-full bg-transparent text-sm sm:text-base font-medium focus:outline-none"
          />
        </div>
      </section>

      <div className="mt-8 space-y-5">
        {filteredSections.map((sec) => {
          const isCollapsed = Boolean(collapsed[sec.title]);
          return (
            <section
              key={sec.title}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs"
            >
              <button
                type="button"
                onClick={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    [sec.title]: !prev[sec.title],
                  }))
                }
                className="flex w-full items-center justify-between gap-4 bg-slate-50 px-5 py-4 text-left hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {sec.title}
                  </h2>
                  <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-900">
                    {sec.rows.length} поз.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <span>{isCollapsed ? "Развернуть" : "Свернуть"}</span>
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </div>
              </button>

              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-extrabold uppercase text-slate-500">
                        <th className="px-4 py-3">Артикул / Чертежи</th>
                        <th className="px-4 py-3">Наименование</th>
                        <th className="px-4 py-3">Кол-во</th>
                        <th className="px-4 py-3">Покрытие</th>
                        <th className="px-4 py-3">Материал</th>
                        <th className="px-4 py-3">Масса 1 эл., кг</th>
                        <th className="px-4 py-3">Масса компл., кг</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sec.rows.map((row, idx) => {
                        const dxf = getDxfFilesForArticle(row.article);
                        const metal = getMetalFiles(row.article);
                        return (
                          <tr
                            key={`${row.article}-${idx}`}
                            className="hover:bg-emerald-50/40"
                          >
                            <td className="px-4 py-3 align-top">
                              <span
                                style={{ fontFamily: "var(--font-mono)" }}
                                className="inline-block rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-900"
                              >
                                {row.article}
                              </span>
                              {(dxf.main.length > 0 ||
                                dxf.mirror.length > 0 ||
                                metal.length > 0) && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {dxf.main.map((f) => (
                                    <a
                                      key={f.file}
                                      href={f.href}
                                      download={f.file}
                                      data-file-name={f.file}
                                      data-file-title={`${row.article} — ${row.name} (DXF)`}
                                      data-file-type="DXF"
                                      data-article={row.article}
                                      data-category={`Сборочные узлы · ${sec.title}`}
                                      className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-500"
                                    >
                                      <Download className="h-3 w-3" /> {f.file}
                                    </a>
                                  ))}
                                  {dxf.mirror.map((f) => (
                                    <a
                                      key={f.file}
                                      href={f.href}
                                      download={f.file}
                                      data-file-name={f.file}
                                      data-file-title={`${row.article} — Зеркальный DXF`}
                                      data-file-type="DXF"
                                      data-article={row.article}
                                      data-category={`Зеркальный DXF · ${sec.title}`}
                                      className="inline-flex items-center gap-1 rounded border border-emerald-400 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-900"
                                    >
                                      🪞 {f.file}
                                    </a>
                                  ))}
                                  {metal
                                    .filter(
                                      (mf) => mf.t === "pdf" || mf.t === "gif"
                                    )
                                    .map((mf) => (
                                      <a
                                        key={mf.f}
                                        href={`/metall/metall/${encodeURIComponent(
                                          mf.f
                                        )}`}
                                        download={mf.f}
                                        data-file-name={mf.f}
                                        data-file-title={`Чертёж металла ${row.article} (${mf.f})`}
                                        data-file-type={mf.t.toUpperCase()}
                                        data-article={row.article}
                                        data-category={`Металл · ${sec.title}`}
                                        className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-800 hover:bg-slate-100"
                                      >
                                        <Download className="h-3 w-3 text-emerald-700" />{" "}
                                        {mf.t.toUpperCase()}
                                      </a>
                                    ))}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-900 align-top">
                              {row.name}
                            </td>
                            <td className="px-4 py-3 font-extrabold text-slate-900 align-top">
                              {row.qty}
                            </td>
                            <td className="px-4 py-3 text-slate-600 align-top">
                              {row.coating || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-700 font-semibold align-top">
                              {row.material || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-600 align-top">
                              {row.weightOne || "—"}
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-900 align-top">
                              {row.weightTotal || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
