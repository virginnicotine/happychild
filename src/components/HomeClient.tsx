"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Layers,
  Sparkles,
  Trees,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Wrench,
  CircleDot,
  Columns3,
  Package,
  History,
  FileSpreadsheet,
  Download,
  UserCheck,
  Armchair,
  Trash2,
  PanelTop,
  FileCode2,
  Eye,
  FolderArchive,
  CheckCircle2,
} from "lucide-react";
import {
  PLAYGROUND_PRODUCTS,
  SLIDE_PRODUCTS,
  LANDSCAPING_SUBCATEGORIES,
  SPEC_EXCEL_FILES,
  ARCHIVE_DOWNLOAD_FILES,
  CHANGELOG_ENTRIES,
} from "@/lib/factory-data";

interface SearchablePart {
  product: string;
  group: string;
  article: string;
  name: string;
  qty: string;
  image?: string;
}

export default function HomeClient({
  partsSample,
}: {
  partsSample: SearchablePart[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // State for the 3 main categories & expandable sections
  const [landscapingOpen, setLandscapingOpen] = useState(false);
  const [activeLandscapingTab, setActiveLandscapingTab] = useState<
    "all" | "benches" | "urns" | "facades"
  >("all");

  // Collapsible bottom block 1: Металл, Заглушки, Столбы, Сборочные узлы
  const [workshopSectionsOpen, setWorkshopSectionsOpen] = useState(false);

  // Collapsible bottom block 2: Последние изменения + Документация и загрузки
  const [updatesAndDocsOpen, setUpdatesAndDocsOpen] = useState(false);

  // Image modal preview state
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  // Instant search across playgrounds, landscaping, and parts
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      type: string;
      title: string;
      subtitle: string;
      href: string;
      badge?: string;
    }> = [];

    for (const p of PLAYGROUND_PRODUCTS) {
      if (
        p.code.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.info.toLowerCase().includes(q) ||
        p.keys.some((k) => k.toLowerCase().includes(q))
      ) {
        results.push({
          type: "Детский городок",
          title: p.title,
          subtitle: p.info,
          href: `/product/${encodeURIComponent(p.specCode)}`,
          badge: p.code,
        });
      }
    }

    for (const p of SLIDE_PRODUCTS) {
      if (
        p.code.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.dimensions.toLowerCase().includes(q) ||
        p.keys.some((k) => k.toLowerCase().includes(q))
      ) {
        results.push({
          type: "Горка",
          title: p.title,
          subtitle: p.dimensions,
          href: `/slides/${p.slug}`,
          badge: p.code,
        });
      }
    }

    for (const sub of LANDSCAPING_SUBCATEGORIES) {
      for (const item of sub.items) {
        if (
          item.article.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          sub.title.toLowerCase().includes(q)
        ) {
          results.push({
            type: `Благоустройство · ${sub.shortTitle}`,
            title: `${item.article} — ${item.name}`,
            subtitle: `${item.dimensions} · ${item.material}`,
            href: `/elements?tab=${sub.id}`,
            badge: item.article,
          });
        }
      }
    }

    const cleanNum = q.replace(/^0+/, "");
    for (const part of partsSample) {
      const artLower = (part.article || "").toLowerCase();
      const artClean = artLower.replace(/^0+/, "");
      if (
        artLower.includes(q) ||
        (cleanNum.length >= 2 && artClean === cleanNum) ||
        (part.name || "").toLowerCase().includes(q) ||
        (part.group || "").toLowerCase().includes(q)
      ) {
        results.push({
          type: `Деталь · ${part.group}`,
          title: `${part.article || "Б/Н"} — ${part.name}`,
          subtitle: `${part.product} · Количество: ${part.qty}`,
          href: `/parts?q=${encodeURIComponent(part.article || part.name)}`,
          badge: part.product,
        });
        if (results.length >= 12) break;
      }
    }

    return results.slice(0, 12);
  }, [searchQuery, partsSample]);

  const filteredLandscaping = useMemo(() => {
    if (activeLandscapingTab === "all") return LANDSCAPING_SUBCATEGORIES;
    return LANDSCAPING_SUBCATEGORIES.filter(
      (s) => s.id === activeLandscapingTab
    );
  }, [activeLandscapingTab]);

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6">
      {/* HERO BLOCK */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#174b35] via-[#205d42] to-[#2f7652] p-6 sm:p-10 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-12 h-48 w-48 rounded-full bg-emerald-400/10 blur-2xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Техническая база предприятия «Счастливый ребёнок»
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.12] tracking-tight">
              База изделий, чертежей и технической документации
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-200/90 leading-relaxed">
              Простой и понятный доступ для сотрудников цеха: чертежи раскроя{" "}
              <strong className="text-white">DXF</strong> (включая зеркальные),
              чертежи металла <strong className="text-white">МП (PDF)</strong>,
              спецификации городков и личный кабинет.
            </p>
          </div>

          {/* Quick Cabinet Card for Workers */}
          <div className="hc-card-anim shrink-0 rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5 backdrop-blur-md lg:w-80">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                  Рабочее место сотрудника
                </span>
                <h2 className="text-base font-extrabold text-white">
                  Личный кабинет
                </h2>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-slate-200 leading-relaxed">
              Ваши <strong>последние скачивания</strong> чертежей, статус{" "}
              <strong>обращений (жалоб)</strong> и{" "}
              <strong>предупреждения от админа</strong>.
            </p>
            <Link
              href="/cabinet"
              className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-300 transition-colors shadow"
            >
              Открыть личный кабинет <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative z-20 mt-7 max-w-3xl">
          <div className="flex flex-col sm:flex-row gap-2 rounded-2xl bg-white p-2 shadow-lg">
            <div className="flex flex-1 items-center gap-2.5 px-3 py-1.5">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск городка (1.08), детали (000161, 0013МП), горки, лавочки или чертежа..."
                className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  Очистить
                </button>
              )}
            </div>
            <Link
              href={
                searchQuery.trim()
                  ? `/parts?q=${encodeURIComponent(searchQuery.trim())}`
                  : "/parts"
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-[#258653] px-6 py-3 text-sm font-extrabold text-white hover:bg-emerald-500 transition-colors"
            >
              <span>Найти в базе</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Search Instant Results Dropdown */}
          {searchQuery.trim() && (
            <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-500">
                <span>Результаты быстрого поиска по запросу «{searchQuery}»</span>
                <span>Найдено: {searchResults.length}</span>
              </div>
              {searchResults.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {searchResults.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-emerald-50/80 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                            {item.type}
                          </span>
                          {item.badge && (
                            <span
                              style={{ fontFamily: "var(--font-mono)" }}
                              className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800"
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-900">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.subtitle}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-emerald-600" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-5 text-center text-sm text-slate-500">
                  Точных совпадений не найдено. Попробуйте ввести номер детали
                  без нулей (например, <b>27</b> или <b>161</b>) или{" "}
                  <Link
                    href={`/parts?q=${encodeURIComponent(searchQuery)}`}
                    className="font-bold text-emerald-700 underline"
                  >
                    открыть поиск по всем 1804 деталям →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          1. ОСНОВНЫЕ КАТЕГОРИИ (РОВНО 3 БЛОКА НА ГЛАВНОЙ СТРАНИЦЕ):
             1) Детские городки
             2) Горки
             3) Элементы благоустройства (Лавочки + Урны + Фасадные элементы)
         ===================================================================== */}
      <section className="mt-10" aria-labelledby="main-categories-heading">
        <div className="flex flex-wrap items-end justify-between gap-2 mb-5">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
              Главные производственные направления
            </span>
            <h2
              id="main-categories-heading"
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900"
            >
              Основные категории продукции
            </h2>
          </div>
          <span className="rounded-full border border-slate-300 bg-white px-3.5 py-1 text-xs font-bold text-slate-600 shadow-2xs">
            3 основных блока
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* БЛОК 1: ДЕТСКИЕ ГОРОДКИ */}
          <div className="hc-card-anim group relative flex flex-col justify-between rounded-2xl border-2 border-slate-200/90 bg-white p-6 shadow-xs hover:border-emerald-400">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner transition-transform duration-200 group-hover:scale-105">
                  <Layers className="h-7 w-7" />
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  {PLAYGROUND_PRODUCTS.length} изделий
                </span>
              </div>

              <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                Детские городки
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Серии <strong>ИКССР 1.06 – 1.16.Н</strong>. Полные технические
                карточки, схемы сборки, цвета по RAL, метизы и чертежи раскроя.
              </p>

              {/* Quick pills for popular playgrounds */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {PLAYGROUND_PRODUCTS.slice(0, 6).map((p) => (
                  <Link
                    key={p.code}
                    href={`/product/${p.specCode}`}
                    style={{ fontFamily: "var(--font-mono)" }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  >
                    {p.code}
                  </Link>
                ))}
                <Link
                  href="/playgrounds"
                  className="rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                >
                  Все {PLAYGROUND_PRODUCTS.length} →
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/playgrounds"
                className="flex w-full items-center justify-between rounded-xl bg-[#174b35] px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
              >
                <span>Открыть каталог городков</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* БЛОК 2: ГОРКИ */}
          <div className="hc-card-anim group relative flex flex-col justify-between rounded-2xl border-2 border-slate-200/90 bg-white p-6 shadow-xs hover:border-emerald-400">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner transition-transform duration-200 group-hover:scale-105">
                  <Sparkles className="h-7 w-7" />
                </div>

              </div>

              <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                Горки
              </h3>
              <span className="mt-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
                {SLIDE_PRODUCTS.length} модели в базе
              </span>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Технические карточки горок ГСР: состав по разделам, артикулы,
                количества, цвета, размеры, крепёж и исходные Excel-спецификации.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {SLIDE_PRODUCTS.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/slides/${p.slug}`}
                    style={{ fontFamily: "var(--font-mono)" }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  >
                    {p.code}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/slides"
                className="flex w-full items-center justify-between rounded-xl bg-[#174b35] px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
              >
                <span>Открыть каталог горок</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* БЛОК 3: ЭЛЕМЕНТЫ БЛАГОУСТРОЙСТВА (Объединённый блок: Лавочки + Урны + Фасадные элементы) */}
          <div
            className={`hc-card-anim group relative flex flex-col justify-between rounded-2xl border-2 p-6 shadow-xs transition-all ${
              landscapingOpen
                ? "border-emerald-500 bg-emerald-50/30 ring-4 ring-emerald-500/10"
                : "border-slate-200/90 bg-white hover:border-emerald-400"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner transition-transform duration-200 group-hover:scale-105">
                  <Trees className="h-7 w-7" />
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  3 раздела в 1 блоке
                </span>
              </div>

              <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                Элементы благоустройства
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Объединённый раздел предприятия:{" "}
                <strong className="text-slate-900">Лавочки</strong>,{" "}
                <strong className="text-slate-900">Урны</strong> и{" "}
                <strong className="text-slate-900">Фасадные элементы</strong>{" "}
                (окна, рамы, декоративные панели).
              </p>

              {/* Sub-category badges */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveLandscapingTab("benches");
                    setLandscapingOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors"
                >
                  <Armchair className="h-3.5 w-3.5 text-emerald-600" />
                  Лавочки (4)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveLandscapingTab("urns");
                    setLandscapingOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 text-emerald-600" />
                  Урны (3)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveLandscapingTab("facades");
                    setLandscapingOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors"
                >
                  <PanelTop className="h-3.5 w-3.5 text-emerald-600" />
                  Фасадные элементы (8)
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLandscapingOpen((v) => !v)}
                aria-expanded={landscapingOpen}
                className="flex flex-1 items-center justify-between rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition-colors"
              >
                <span>
                  {landscapingOpen
                    ? "Свернуть подразделы"
                    : "Раскрыть: Лавочки, Урны, Фасады"}
                </span>
                {landscapingOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                )}
              </button>
              <Link
                href="/elements"
                title="Открыть на отдельной странице"
                className="flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* РАСКРЫВАЮЩИЙСЯ БЛОК «ЭЛЕМЕНТЫ БЛАГОУСТРОЙСТВА» (Лавочки + Урны + Фасадные элементы) */}
        {landscapingOpen && (
          <div className="hc-reveal mt-5 rounded-3xl border-2 border-emerald-500/40 bg-white p-6 sm:p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                  <Trees className="h-4 w-4" /> Объединённый блок благоустройства
                </span>
                <h3 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Элементы благоустройства: Лавочки, Урны и Фасадные элементы
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveLandscapingTab("all")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition-colors ${
                    activeLandscapingTab === "all"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Все 3 раздела (15)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLandscapingTab("benches")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition-colors ${
                    activeLandscapingTab === "benches"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  🪑 Лавочки
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLandscapingTab("urns")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition-colors ${
                    activeLandscapingTab === "urns"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  🗑️ Урны
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLandscapingTab("facades")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition-colors ${
                    activeLandscapingTab === "facades"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  🏠 Фасадные элементы
                </button>
                <button
                  type="button"
                  onClick={() => setLandscapingOpen(false)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Свернуть ▴
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-8">
              {filteredLandscaping.map((sub) => (
                <div key={sub.id} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 px-4 py-3 border border-slate-200">
                    <div>
                      <h4 className="text-lg font-extrabold text-slate-900">
                        {sub.title}
                      </h4>
                      <p className="text-xs text-slate-600">{sub.description}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-900">
                      {sub.badge}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {sub.items.map((item) => (
                      <div
                        key={item.article + item.name}
                        className="hc-card-anim flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"
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
                                setLightboxImage({
                                  src: item.image!,
                                  title: `${item.article} — ${item.name}`,
                                })
                              }
                              className="mt-3 flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2 hover:border-emerald-300"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </button>
                          )}

                          <h5 className="mt-3 text-sm font-extrabold text-slate-900 leading-snug">
                            {item.name}
                          </h5>

                          <div className="mt-2 space-y-1 text-xs text-slate-600">
                            <div>
                              <span className="text-slate-400">Размер:</span>{" "}
                              <strong>{item.dimensions}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400">Материал:</span>{" "}
                              {item.material}
                            </div>
                            <div>
                              <span className="text-slate-400">Покрытие:</span>{" "}
                              {item.coating}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {item.dxfFile && (
                            <a
                              href={`/downloads/dxf/${encodeURIComponent(
                                item.dxfFile
                              )}`}
                              download={item.dxfFile}
                              data-file-name={item.dxfFile}
                              data-file-title={`${item.article} — ${item.name} (DXF)`}
                              data-file-type="DXF"
                              data-article={item.article}
                              data-category={`Благоустройство · ${sub.shortTitle}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
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
                              data-file-title={`${item.article} — Зеркальный (${item.mirrorDxfFile})`}
                              data-file-type="DXF"
                              data-article={item.article}
                              data-category="Зеркальные чертежи DXF"
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
                            >
                              🪞 Зеркал. ({item.mirrorDxfFile})
                            </a>
                          )}
                          {item.image && (
                            <button
                              type="button"
                              onClick={() =>
                                setLightboxImage({
                                  src: item.image!,
                                  title: `${item.article} — ${item.name}`,
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              <Eye className="h-3.5 w-3.5" /> Эскиз
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================================
          2. НИЖНИЕ СКРЫТЫЕ РАСКРЫВАЮЩИЕСЯ БЛОКИ (ДЛЯ УДОБСТВА РАБОЧИХ):
             Блок А: Остальные разделы (Металл, Заглушки, Столбы, Сборочные узлы)
             Блок Б: «Последние изменения» и «Документация и загрузки» (2 раздела)
         ===================================================================== */}
      <section className="mt-12 space-y-5" aria-label="Дополнительные разделы и документация">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Дополнительные технические блоки (открываются по нажатию)
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Цеховые разделы, изменения и документация
            </h2>
          </div>
        </div>

        {/* СКРЫТЫЙ БЛОК №1: МЕТАЛЛ, ЗАГЛУШКИ, СТОЛБЫ, СБОРОЧНЫЕ УЗЛЫ */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setWorkshopSectionsOpen((v) => !v)}
            aria-expanded={workshopSectionsOpen}
            className="hc-card-anim flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-slate-50/90"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#174b35] text-emerald-300 shadow-sm">
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-900">
                    4 раздела внутри
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Нажмите, чтобы {workshopSectionsOpen ? "скрыть" : "открыть"} список разделов
                  </span>
                </div>
                <h3 className="mt-1 text-lg sm:text-xl font-extrabold text-slate-900">
                  Комплектующие и разделы цеха: Металл, Заглушки, Столбы, Сборочные узлы
                </h3>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
                  Металлические детали (МП), пластиковые заглушки всех типоразмеров, деревянные столбы с закладными и справочник сборочных узлов.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-800">
              <span>{workshopSectionsOpen ? "Свернуть" : "Открыть разделы"}</span>
              {workshopSectionsOpen ? (
                <ChevronUp className="h-5 w-5 text-emerald-700" />
              ) : (
                <ChevronDown className="h-5 w-5 text-emerald-700" />
              )}
            </div>
          </button>

          {workshopSectionsOpen && (
            <div className="hc-reveal border-t border-slate-200 bg-slate-50/70 p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Металлические детали */}
                <Link
                  href="/parts?group=%D0%9C%D0%B5%D1%82%D0%B0%D0%BB%D0%BB%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B5%20%D0%B4%D0%B5%D1%82%D0%B0%D0%BB%D0%B8"
                  className="hc-card-anim group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-400"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <span
                        style={{ fontFamily: "var(--font-mono)" }}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700"
                      >
                        Индекс МП
                      </span>
                    </div>
                    <h4 className="mt-4 text-base font-extrabold text-slate-900 group-hover:text-emerald-700">
                      Металлические детали
                    </h4>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      Детали с индексом «МП», поручни, перекладины, рукоходы, порталы, чертежи PDF и GIF.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-extrabold text-emerald-700">
                    <span>Открыть раздел</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>

                {/* 2. Заглушки */}
                <Link
                  href="/parts?group=%D0%97%D0%B0%D0%B3%D0%BB%D1%83%D1%88%D0%BA%D0%B8"
                  className="hc-card-anim group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-400"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                        <CircleDot className="h-5 w-5" />
                      </div>
                      <span
                        style={{ fontFamily: "var(--font-mono)" }}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700"
                      >
                        М6 · М8–10 · 100×100
                      </span>
                    </div>
                    <h4 className="mt-4 text-base font-extrabold text-slate-900 group-hover:text-indigo-700">
                      Заглушки
                    </h4>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      Все типоразмеры пластиковых заглушек: К4М6КС, К4М8КС, 100-100.11КК и нормы расхода.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-extrabold text-indigo-700">
                    <span>Открыть раздел</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>

                {/* 3. Столбы */}
                <Link
                  href="/parts?group=%D0%A1%D1%82%D0%BE%D0%BB%D0%B1%D1%8B"
                  className="hc-card-anim group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-400"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                        <Columns3 className="h-5 w-5" />
                      </div>
                      <span
                        style={{ fontFamily: "var(--font-mono)" }}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700"
                      >
                        95 позиций
                      </span>
                    </div>
                    <h4 className="mt-4 text-base font-extrabold text-slate-900 group-hover:text-amber-800">
                      Столбы
                    </h4>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      Несущие столбы из клееного бруса 100×100 мм (от 150 до 3300 мм) и закладные опоры 0013МП.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-extrabold text-amber-800">
                    <span>Открыть раздел</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>

                {/* 4. Сборочные узлы */}
                <Link
                  href="/assemblies"
                  className="hc-card-anim group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-400"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                        <Package className="h-5 w-5" />
                      </div>
                      <span
                        style={{ fontFamily: "var(--font-mono)" }}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700"
                      >
                        13 узлов · 102 поз.
                      </span>
                    </div>
                    <h4 className="mt-4 text-base font-extrabold text-slate-900 group-hover:text-emerald-800">
                      Сборочные узлы
                    </h4>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      Ведомости сборочных единиц: горки ФСФ и ПНД, площадки 800×800 и 1500×800, массы и материалы.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-extrabold text-emerald-800">
                    <span>Открыть справочник</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </div>

              {/* Link to full 1804 GIF parts library */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700">
                  <FileCode2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Нужен поиск детали по номеру (например, <b>00027</b> →{" "}
                    <b>27.GIF</b>) или вся база из 1804 эскизов?
                  </span>
                </div>
                <Link
                  href="/parts"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-800 hover:bg-emerald-100"
                >
                  Перейти в единую библиотеку деталей →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* СКРЫТЫЙ БЛОК №2: «ПОСЛЕДНИЕ ИЗМЕНЕНИЯ» И «ДОКУМЕНТАЦИЯ И ЗАГРУЗКИ» (ВЫВОДИТ ДВА РАЗДЕЛА ПРИ НАЖАТИИ) */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setUpdatesAndDocsOpen((v) => !v)}
            aria-expanded={updatesAndDocsOpen}
            className="hc-card-anim flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-slate-50/90"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#16385c] text-amber-300 shadow-sm">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                    2 раздела внутри
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Нажмите, чтобы {updatesAndDocsOpen ? "скрыть" : "вывести два раздела"}
                  </span>
                </div>
                <h3 className="mt-1 text-lg sm:text-xl font-extrabold text-slate-900">
                  Последние изменения · Документация и загрузки
                </h3>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
                  Журнал последних изменений в техбазе предприятия и скачивание Excel-спецификаций городков и архивов.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-800">
              <span>{updatesAndDocsOpen ? "Свернуть" : "Открыть 2 раздела"}</span>
              {updatesAndDocsOpen ? (
                <ChevronUp className="h-5 w-5 text-emerald-700" />
              ) : (
                <ChevronDown className="h-5 w-5 text-emerald-700" />
              )}
            </div>
          </button>

          {updatesAndDocsOpen && (
            <div className="hc-reveal border-t border-slate-200 bg-slate-50/70 p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* РАЗДЕЛ 1 ВНУТРИ БЛОКА: ПОСЛЕДНИЕ ИЗМЕНЕНИЯ */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                          <History className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                            Раздел 1
                          </span>
                          <h4 className="text-lg font-extrabold text-slate-900">
                            Последние изменения
                          </h4>
                        </div>
                      </div>
                      <Link
                        href="/changelog"
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
                      >
                        Вся история →
                      </Link>
                    </div>

                    {/* Changelog Updates */}
                    <div className="mt-4 space-y-3">
                      {CHANGELOG_ENTRIES.slice(0, 2).map((entry) => (
                        <div
                          key={entry.date + entry.title}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-3.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-slate-900">
                              {entry.title}
                            </span>
                            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              {entry.date}
                            </span>
                          </div>
                          <ul className="mt-2 space-y-1 text-xs text-slate-600 list-disc list-inside">
                            {entry.items.slice(0, 3).map((it, i) => (
                              <li key={i}>{it}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Recent Playground Cards */}
                    <div className="mt-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Недавно обновлённые карточки городков:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {PLAYGROUND_PRODUCTS.slice()
                          .reverse()
                          .slice(0, 6)
                          .map((prod) => (
                            <Link
                              key={prod.code}
                              href={`/product/${prod.specCode}`}
                              className="hc-card-anim flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 hover:border-emerald-400"
                            >
                              <div>
                                <strong
                                  style={{ fontFamily: "var(--font-mono)" }}
                                  className="text-xs font-extrabold text-slate-900 block"
                                >
                                  {prod.code}
                                </strong>
                                <span className="text-[11px] text-slate-500">
                                  Техкарта доступна
                                </span>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
                            </Link>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* РАЗДЕЛ 2 ВНУТРИ БЛОКА: ДОКУМЕНТАЦИЯ И ЗАГРУЗКИ */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                          <Download className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                            Раздел 2
                          </span>
                          <h4 className="text-lg font-extrabold text-slate-900">
                            Документация и загрузки
                          </h4>
                        </div>
                      </div>
                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                        Фиксируется в кабинете
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Спецификации городков · Excel ({SPEC_EXCEL_FILES.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                        {SPEC_EXCEL_FILES.map((item) => (
                          <a
                            key={item.file}
                            href={`/downloads/${encodeURIComponent(item.file)}`}
                            download={item.file}
                            data-file-name={item.file}
                            data-file-title={item.title}
                            data-file-type="XLSX"
                            data-article={`ИКССР-${item.code}`}
                            data-category="Документация и загрузки · Excel"
                            className="hc-card-anim flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 hover:border-emerald-400 hover:bg-emerald-50/40"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                style={{ fontFamily: "var(--font-mono)" }}
                                className="shrink-0 rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-900"
                              >
                                XLSX
                              </span>
                              <div className="truncate">
                                <strong className="block truncate text-xs font-bold text-slate-900">
                                  {item.title}
                                </strong>
                                <small className="block truncate text-[10px] text-slate-500">
                                  {item.note}
                                </small>
                              </div>
                            </div>
                            <Download className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Архивы и материалы предприятия
                      </div>
                      <div className="space-y-2">
                        {ARCHIVE_DOWNLOAD_FILES.map((arch) => (
                          <a
                            key={arch.file}
                            href={arch.href}
                            download={arch.file}
                            data-file-name={arch.file}
                            data-file-title={arch.title}
                            data-file-type={arch.icon}
                            data-article="АРХИВ"
                            data-category="Архивы предприятия"
                            className="hc-card-anim flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 hover:border-emerald-400 hover:bg-emerald-50/40"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[11px] font-extrabold text-emerald-900">
                                {arch.icon}
                              </span>
                              <div className="truncate">
                                <strong className="block truncate text-xs font-bold text-slate-900">
                                  {arch.title}
                                </strong>
                                <small className="block truncate text-[11px] text-slate-500">
                                  {arch.note}
                                </small>
                              </div>
                            </div>
                            <Download className="h-4 w-4 shrink-0 text-emerald-700" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal for Part Images */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-3xl w-full rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <strong className="text-sm font-extrabold text-slate-900">
                {lightboxImage.title}
              </strong>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Закрыть ×
              </button>
            </div>
            <div className="flex items-center justify-center bg-slate-50 rounded-xl p-6 min-h-[280px]">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="max-h-[65vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
