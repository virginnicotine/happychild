"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Layers,
  Eye,
} from "lucide-react";
import {
  PLAYGROUND_PRODUCTS,
  getDxfFilesForArticle,
} from "@/lib/factory-data";

const RAL_HEX: Record<string, string> = {
  "7024": "#4b4f54",
  "1037": "#f2a900",
  "5024": "#73879a",
  "7047": "#c9cacc",
  "8014": "#4b3a2f",
  "6018": "#57a639",
  "2008": "#ed5b2f",
  "1023": "#f5c400",
  "9007": "#878581",
  "9005": "#0e0e10",
  "7015": "#51565c",
  "5017": "#063971",
  "3020": "#bb1e10",
};

function getColorBadge(raw: unknown) {
  if (raw === null || raw === undefined || raw === "") return null;
  const s = String(raw).trim();
  const key = s.replace(/^RAL\s*/i, "");
  if (RAL_HEX[key]) return { label: `RAL ${key}`, hex: RAL_HEX[key] };
  if (/черн/i.test(s)) return { label: s, hex: "#14181b" };
  if (/жёлт|желт/i.test(s)) return { label: s, hex: "#f4c400" };
  if (/сер/i.test(s)) return { label: s, hex: "#9da5aa" };
  if (/противоскол/i.test(s)) return { label: s, hex: "#68737b" };
  return { label: s, hex: "#64748b" };
}

export interface SpecRecord {
  row: number;
  number?: string | number;
  article?: string;
  name?: string;
  group?: string;
  qty?: string | number;
  color?: string | number;
  ingredients?: string;
  length?: number | string | null;
  width?: number | string | null;
  height?: number | string | null;
  volume?: number | string | null;
  total_volume?: number | string | null;
  fasteners?: string | null;
  images?: Array<{ path: string }>;
}

export interface SpecData {
  code: string;
  display_code?: string;
  dimensions?: string;
  main_images?: Array<{ path: string }>;
  groups?: Array<{ title: string; records: SpecRecord[] }>;
  records?: SpecRecord[];
}

export default function ProductSpecClient({
  spec,
  metalIndex,
}: {
  spec: SpecData;
  metalIndex: Record<string, Array<{ f: string; t: string }>>;
}) {
  const [filter, setFilter] = useState("");
  const [lightbox, setLightbox] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const currentProduct =
    PLAYGROUND_PRODUCTS.find((p) => p.specCode === spec.code) ||
    PLAYGROUND_PRODUCTS[0];

  const getMetalFiles = (article?: string) => {
    if (!article) return [];
    const s = String(article).trim().toUpperCase().replace(/Ё/g, "Е");
    const m = s.match(/^0*(\d+)\s*[МM][ПP]/);
    if (!m) return [];
    const numKey = String(parseInt(m[1], 10));
    return metalIndex[numKey] || [];
  };

  const filteredGroups = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const groups = spec.groups || [];
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        records: (g.records || []).filter((r) =>
          [r.article, r.name, r.color, r.ingredients, r.fasteners, g.title]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q)
        ),
      }))
      .filter((g) => g.records.length > 0);
  }, [spec.groups, filter]);

  const toggleGroup = (title: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6">
      {/* Breadcrumbs + Model Switcher */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
          <Link href="/" className="hover:text-emerald-700">
            Главная
          </Link>
          <span>/</span>
          <Link href="/playgrounds" className="hover:text-emerald-700">
            Детские городки
          </Link>
          <span>/</span>
          <strong className="text-slate-900">{currentProduct.code}</strong>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {PLAYGROUND_PRODUCTS.map((p) => (
            <Link
              key={p.specCode}
              href={`/product/${p.specCode}`}
              style={{ fontFamily: "var(--font-mono)" }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                p.specCode === spec.code
                  ? "bg-[#174b35] text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {p.specCode}
            </Link>
          ))}
        </div>
      </div>

      {/* HERO BANNER */}
      <section className="rounded-3xl bg-gradient-to-br from-[#174b35] to-[#1a3c61] p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-300">
              <Layers className="h-4 w-4" /> Техническая карточка изделия
            </span>
            <h1 className="mt-1.5 text-2xl sm:text-4xl font-extrabold tracking-tight">
              Детский игровой городок {currentProduct.code}
            </h1>
            <p className="mt-2 text-sm text-slate-200">
              Габариты изделия:{" "}
              <strong className="text-white">
                {spec.dimensions || currentProduct.dimensions}
              </strong>{" "}
              · Внесено в систему: <strong>Дарья Алексеевна</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentProduct.excelFile && (
              <a
                href={`/downloads/${encodeURIComponent(
                  currentProduct.excelFile
                )}`}
                download={currentProduct.excelFile}
                data-file-name={currentProduct.excelFile}
                data-file-title={`Спецификация ${currentProduct.code}`}
                data-file-type="XLSX"
                data-article={currentProduct.code}
                data-category="Спецификации городков"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-xs sm:text-sm font-extrabold text-slate-950 hover:bg-emerald-300 transition-colors shadow"
              >
                <Download className="h-4 w-4" />
                Скачать спецификацию Excel
              </a>
            )}
            <Link
              href="/playgrounds"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" /> Все городки
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN IMAGES GALLERY */}
      {spec.main_images && spec.main_images.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-slate-900">
              Основные виды и схемы ({spec.main_images.length})
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Нажмите на схему для увеличения
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spec.main_images.map((img, i) => {
              const cleanPath = "/" + img.path.replace(/^\.?\//, "");
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setLightbox({
                      src: cleanPath,
                      title: `${currentProduct.code} — Схема / Вид ${i + 1}`,
                    })
                  }
                  className="hc-card-anim group relative flex h-60 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"
                >
                  <img
                    src={cleanPath}
                    alt={`${currentProduct.code} — ${i + 1}`}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute bottom-3 left-3 rounded-lg bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold text-white">
                    ВИД / СХЕМА · 0{i + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* SPECIFICATION FILTER & COLLAPSIBLE GROUPS */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
              Спецификация и чертежи деталей
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Состав изделия по группам
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 shadow-2xs w-full sm:w-96">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Фильтр по артикулу, названию, цвету RAL..."
              className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredGroups.map((group) => {
            const isCollapsed = Boolean(collapsedGroups[group.title]);
            return (
              <div
                key={group.title}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className="flex w-full items-center justify-between gap-4 bg-slate-50 px-5 py-4 text-left hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm sm:text-base font-extrabold text-slate-900">
                      {group.title}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-900">
                      {group.records.length} поз.
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
                  <div className="divide-y divide-slate-100">
                    {group.records.map((rec, idx) => {
                      const dxf = getDxfFilesForArticle(rec.article);
                      const metalFiles = getMetalFiles(rec.article);
                      const colorBadge = getColorBadge(rec.color);
                      const firstImg = rec.images?.[0]?.path
                        ? "/" + rec.images[0].path.replace(/^\.?\//, "")
                        : null;

                      return (
                        <article
                          key={`${rec.row}-${idx}`}
                          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-slate-50/60 transition-colors"
                        >
                          <div className="flex items-start gap-4 min-w-0 flex-1">
                            <span
                              style={{ fontFamily: "var(--font-mono)" }}
                              className="mt-1 text-xs font-bold text-slate-400 w-6 shrink-0"
                            >
                              {rec.number || idx + 1}
                            </span>

                            {firstImg ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setLightbox({
                                    src: firstImg,
                                    title: `${rec.article || ""} — ${rec.name}`,
                                  })
                                }
                                className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1 hover:border-emerald-400"
                              >
                                <img
                                  src={firstImg}
                                  alt={rec.name || ""}
                                  className="max-h-full max-w-full object-contain"
                                />
                              </button>
                            ) : (
                              <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-400 text-center">
                                без фото
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  style={{ fontFamily: "var(--font-mono)" }}
                                  className="rounded-lg bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-900"
                                >
                                  {rec.article || "Без артикула"}
                                </span>
                                {colorBadge && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-bold text-slate-700">
                                    <i
                                      className="h-3 w-3 rounded-full inline-block border border-black/10"
                                      style={{
                                        backgroundColor: colorBadge.hex,
                                      }}
                                    />
                                    {colorBadge.label}
                                  </span>
                                )}
                              </div>

                              <h3 className="mt-1 text-sm sm:text-base font-extrabold text-slate-900">
                                {rec.name}
                              </h3>

                              {/* Technical Details Expandable */}
                              {(rec.length ||
                                rec.width ||
                                rec.height ||
                                rec.ingredients ||
                                rec.fasteners) && (
                                <details className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                                  <summary className="font-bold text-emerald-800 select-none">
                                    Технические данные и габариты ▾
                                  </summary>
                                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                                    {rec.length && (
                                      <div>
                                        Длина: <b>{rec.length} м</b>
                                      </div>
                                    )}
                                    {rec.width && (
                                      <div>
                                        Ширина: <b>{rec.width} м</b>
                                      </div>
                                    )}
                                    {rec.height && (
                                      <div>
                                        Высота: <b>{rec.height} м</b>
                                      </div>
                                    )}
                                    {rec.volume && (
                                      <div>
                                        Объём: <b>{rec.volume} м³</b>
                                      </div>
                                    )}
                                    {rec.ingredients && (
                                      <div className="col-span-2 sm:col-span-4">
                                        Входящие узлы:{" "}
                                        <b>{rec.ingredients}</b>
                                      </div>
                                    )}
                                    {rec.fasteners && (
                                      <div className="col-span-2 sm:col-span-4">
                                        Метизы: <b>{rec.fasteners}</b>
                                      </div>
                                    )}
                                  </div>
                                </details>
                              )}

                              {/* DXF & Metal Download Buttons */}
                              {(dxf.main.length > 0 ||
                                dxf.mirror.length > 0 ||
                                metalFiles.length > 0) && (
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  {dxf.main.map((f) => (
                                    <a
                                      key={f.file}
                                      href={f.href}
                                      download={f.file}
                                      data-file-name={f.file}
                                      data-file-title={`${rec.article} — ${rec.name} (${f.label})`}
                                      data-file-type="DXF"
                                      data-article={rec.article}
                                      data-category={`Карточка ${currentProduct.code}`}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-500"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      DXF: {f.label} ({f.file})
                                    </a>
                                  ))}

                                  {dxf.mirror.map((f) => (
                                    <a
                                      key={f.file}
                                      href={f.href}
                                      download={f.file}
                                      data-file-name={f.file}
                                      data-file-title={`${rec.article} — Зеркальный (${f.file})`}
                                      data-file-type="DXF"
                                      data-article={rec.article}
                                      data-category={`Зеркальный DXF · ${currentProduct.code}`}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-900 hover:bg-emerald-100"
                                    >
                                      🪞 {f.label} · {f.file}
                                    </a>
                                  ))}

                                  {metalFiles
                                    .filter(
                                      (mf) => mf.t === "pdf" || mf.t === "gif"
                                    )
                                    .map((mf) => {
                                      const href = `/metall/metall/${encodeURIComponent(
                                        mf.f
                                      )}`;
                                      return (
                                        <a
                                          key={mf.f}
                                          href={href}
                                          download={mf.f}
                                          data-file-name={mf.f}
                                          data-file-title={`Чертёж металла ${rec.article} (${mf.f})`}
                                          data-file-type={mf.t.toUpperCase()}
                                          data-article={rec.article}
                                          data-category={`Металл МП · ${currentProduct.code}`}
                                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-800 hover:bg-slate-100"
                                        >
                                          <Download className="h-3.5 w-3.5 text-emerald-700" />
                                          {mf.t.toUpperCase()}: {mf.f}
                                        </a>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 md:pl-4 shrink-0">
                            <div className="rounded-xl bg-slate-100 px-3.5 py-2 text-right">
                              <strong className="text-base font-extrabold text-slate-900">
                                {rec.qty}
                              </strong>{" "}
                              <span className="text-xs font-semibold text-slate-500">
                                шт.
                              </span>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="max-w-4xl w-full rounded-2xl bg-white p-5 shadow-2xl"
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
            <div className="flex items-center justify-center bg-slate-50 rounded-xl p-4">
              <img
                src={lightbox.src}
                alt={lightbox.title}
                className="max-h-[75vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
