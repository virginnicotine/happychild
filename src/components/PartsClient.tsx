"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Wrench,
  ArrowLeft,
  Download,
  Eye,
  FolderArchive,
} from "lucide-react";
import { getDxfFilesForArticle } from "@/lib/factory-data";

export interface PartCatalogItem {
  product: string;
  group: string;
  article: string;
  name: string;
  qty: string;
  color?: string;
  image?: string;
}

export interface DetailGifItem {
  id: string;
  file: string;
  path: string;
}

function classifyPartCategory(p: PartCatalogItem): string {
  const g = String(p.group || "").toLowerCase();
  const n = String(p.name || "").toLowerCase();
  if (/зеркальн|\bлев(ая|ый|ое|ой)\b|\bправ(ая|ый|ое|ой)\b/i.test(n))
    return "Зеркальные и парные детали";
  if (g.includes("горк") || n.includes("горк")) return "Горки";
  if (/лавоч|скамей|урн|сидуш/.test(g + " " + n))
    return "Элементы благоустройства";
  if (g.includes("заглуш") || n.includes("заглуш")) return "Заглушки";
  if (g.includes("столб") || n.includes("столб")) return "Столбы";
  if (g.includes("металл") || /мп\b/i.test(p.article || ""))
    return "Металлические детали";
  if (g.includes("панел") || n.includes("панел")) return "Панели и фасады";
  if (g.includes("лестниц") || n.includes("ступен") || n.includes("тетив"))
    return "Лестницы";
  if (g.includes("площад") || n.includes("настил")) return "Площадки и настилы";
  return p.group || "Прочее";
}

export default function PartsClient({
  catalog,
  gifs,
  metalIndex,
  initialGroup = "all",
  initialQuery = "",
}: {
  catalog: PartCatalogItem[];
  gifs: DetailGifItem[];
  metalIndex: Record<string, Array<{ f: string; t: string }>>;
  initialGroup?: string;
  initialQuery?: string;
}) {
  const [selectedGroup, setSelectedGroup] = useState<string>(
    initialGroup || "all"
  );
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery || "");
  const [partNumberLookup, setPartNumberLookup] = useState<string>(
    initialQuery || ""
  );
  const [visibleCount, setVisibleCount] = useState<number>(48);
  const [lightbox, setLightbox] = useState<{
    src: string;
    title: string;
  } | null>(null);

  const gifMap = useMemo(() => {
    const map = new Map<string, DetailGifItem>();
    for (const g of gifs) {
      const clean = String(g.id || "")
        .trim()
        .toUpperCase()
        .replace(/^0+/, "");
      if (clean) map.set(clean, g);
    }
    return map;
  }, [gifs]);

  const getMetalFiles = (article?: string) => {
    if (!article) return [];
    const s = String(article).trim().toUpperCase().replace(/Ё/g, "Е");
    const m = s.match(/^0*(\d+)\s*[МM][ПP]/);
    if (!m) return [];
    const numKey = String(parseInt(m[1], 10));
    return metalIndex[numKey] || [];
  };

  const groupsList = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of catalog) {
      const cat = classifyPartCategory(item);
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [catalog]);

  const productsList = useMemo(() => {
    return Array.from(new Set(catalog.map((x) => x.product))).filter(Boolean);
  }, [catalog]);

  // Number lookup (e.g. 27 or 00027 -> 27.GIF)
  const lookupResult = useMemo(() => {
    const raw = partNumberLookup.trim().toUpperCase();
    if (!raw) return null;
    const cleanNum = raw.replace(/^0+/, "").replace(/\s*[МM][ПP]$/, "");
    const gif = gifMap.get(cleanNum) || null;
    const matches = catalog.filter((p) => {
      const art = String(p.article || "")
        .trim()
        .toUpperCase();
      return (
        art === raw ||
        art.replace(/^0+/, "") === cleanNum ||
        art.includes(raw)
      );
    });
    const dxf = getDxfFilesForArticle(matches[0]?.article || raw);
    const metal = getMetalFiles(matches[0]?.article || raw);
    return { raw, cleanNum, gif, matches, dxf, metal };
  }, [partNumberLookup, gifMap, catalog]);

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const qNoZeros = q.replace(/^0+/, "");

    return catalog.filter((item) => {
      if (selectedProduct !== "all" && item.product !== selectedProduct)
        return false;
      if (selectedGroup !== "all") {
        const cat = classifyPartCategory(item);
        if (
          cat.toLowerCase() !== selectedGroup.toLowerCase() &&
          !String(item.group || "")
            .toLowerCase()
            .includes(selectedGroup.toLowerCase())
        ) {
          return false;
        }
      }
      if (!q) return true;
      const art = String(item.article || "").toLowerCase();
      return (
        art.includes(q) ||
        (qNoZeros.length >= 2 && art.replace(/^0+/, "") === qNoZeros) ||
        String(item.name || "")
          .toLowerCase()
          .includes(q) ||
        String(item.group || "")
          .toLowerCase()
          .includes(q) ||
        String(item.product || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [catalog, selectedProduct, selectedGroup, searchQuery]);

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link href="/" className="hover:text-emerald-700">
            Главная
          </Link>
          <span>/</span>
          <strong className="text-slate-900">
            Библиотека деталей и чертежей
          </strong>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> На главную
        </Link>
      </div>

      {/* HERO */}
      <section className="rounded-3xl bg-gradient-to-r from-[#174b35] to-[#1a3e63] p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-300">
              <Wrench className="h-4 w-4" /> Единая библиотека деталей предприятия
            </span>
            <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold tracking-tight">
              Детали, эскизы GIF и чертежи раскроя
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Детали из технических карточек всех 9 городков ({catalog.length}{" "}
              позиций) и библиотека эскизов ({gifs.length} GIF). Ведущие нули не
              учитываются: <strong>00027</strong> и <strong>27.GIF</strong> —
              одна и та же деталь.
            </p>
          </div>

          <a
            href="/downloads/%D0%B1%D0%B8%D0%B1%D0%BB%D0%B8%D0%BE%D1%82%D0%B5%D0%BA%D0%B0-%D0%B8%D0%B7%D0%BE%D0%B1%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D0%B9-%D0%B4%D0%B5%D1%82%D0%B0%D0%BB%D0%B5%D0%B9.zip"
            download="библиотека-изображений-деталей.zip"
            data-file-name="библиотека-изображений-деталей.zip"
            data-file-title="Архив библиотеки изображений деталей (1804 GIF)"
            data-file-type="ZIP"
            data-article="АРХИВ-GIF"
            data-category="Библиотека деталей"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-300 shadow"
          >
            <FolderArchive className="h-4 w-4" />
            Скачать архив 1804 GIF (ZIP)
          </a>
        </div>
      </section>

      {/* PART BY NUMBER QUICK LOOKUP */}
      <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="text-lg font-extrabold text-slate-900">
            Быстрый поиск детали по номеру / артикулу
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Например: 27, 00027, 000161, 0013МП
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={partNumberLookup}
            onChange={(e) => setPartNumberLookup(e.target.value)}
            placeholder="Введите номер детали (например 27, 161, 0023МП)..."
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
          {partNumberLookup && (
            <button
              type="button"
              onClick={() => setPartNumberLookup("")}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Сбросить
            </button>
          )}
        </div>

        {lookupResult && (
          <div className="hc-reveal mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-5">
            <div className="flex flex-col md:flex-row gap-5">
              {lookupResult.gif ? (
                <button
                  type="button"
                  onClick={() =>
                    setLightbox({
                      src: "/" + lookupResult.gif!.path.replace(/^\.?\//, ""),
                      title: `Эскиз ${lookupResult.gif!.file}`,
                    })
                  }
                  className="flex h-40 w-48 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-2xs"
                >
                  <img
                    src={"/" + lookupResult.gif.path.replace(/^\.?\//, "")}
                    alt={lookupResult.gif.file}
                    className="max-h-full max-w-full object-contain"
                  />
                </button>
              ) : (
                <div className="flex h-40 w-48 shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-xs text-slate-400">
                  Эскиз GIF не найден
                </div>
              )}

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Результат по номеру «{lookupResult.raw}»
                  </h3>
                  {lookupResult.gif && (
                    <a
                      href={"/" + lookupResult.gif.path.replace(/^\.?\//, "")}
                      download={lookupResult.gif.file}
                      data-file-name={lookupResult.gif.file}
                      data-file-title={`Эскиз детали ${lookupResult.gif.file}`}
                      data-file-type="GIF"
                      data-article={lookupResult.raw}
                      data-category="Эскизы деталей GIF"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#174b35] px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      <Download className="h-3.5 w-3.5" /> Скачать{" "}
                      {lookupResult.gif.file}
                    </a>
                  )}
                </div>

                {/* DXF & Metal files for looked-up part */}
                {(lookupResult.dxf.main.length > 0 ||
                  lookupResult.dxf.mirror.length > 0 ||
                  lookupResult.metal.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {lookupResult.dxf.main.map((f) => (
                      <a
                        key={f.file}
                        href={f.href}
                        download={f.file}
                        data-file-name={f.file}
                        data-file-title={`Чертёж DXF ${f.file}`}
                        data-file-type="DXF"
                        data-article={lookupResult.raw}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-500"
                      >
                        <Download className="h-3.5 w-3.5" /> DXF: {f.file}
                      </a>
                    ))}
                    {lookupResult.dxf.mirror.map((f) => (
                      <a
                        key={f.file}
                        href={f.href}
                        download={f.file}
                        data-file-name={f.file}
                        data-file-title={`Зеркальный DXF ${f.file}`}
                        data-file-type="DXF"
                        data-article={lookupResult.raw}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-900"
                      >
                        🪞 {f.label}: {f.file}
                      </a>
                    ))}
                  </div>
                )}

                {lookupResult.matches.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-500">
                      Входит в состав городков ({lookupResult.matches.length}):
                    </div>
                    {lookupResult.matches.slice(0, 6).map((m, i) => (
                      <div
                        key={i}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs"
                      >
                        <div>
                          <strong className="text-slate-900">
                            {m.article}
                          </strong>{" "}
                          — {m.name}{" "}
                          <span className="text-slate-500">
                            ({m.product} · {m.group})
                          </span>
                        </div>
                        <span className="font-extrabold text-emerald-800">
                          {m.qty}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    В таблицах спецификаций городков точного совпадения нет (доступен эскиз GIF).
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FILTERS & PARTS CATALOG */}
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Каталог деталей по разделам ({filteredCatalog.length})
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 w-full sm:w-80">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Фильтр по артикулу или названию..."
              className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Раздел деталей:
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedGroup("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-colors ${
                selectedGroup === "all"
                  ? "bg-[#174b35] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Все разделы ({catalog.length})
            </button>
            {groupsList.map(([grp, count]) => (
              <button
                key={grp}
                type="button"
                onClick={() => setSelectedGroup(grp)}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-colors ${
                  selectedGroup.toLowerCase() === grp.toLowerCase()
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {grp} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Playground Filter Pills */}
        <div className="mt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Городок:
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedProduct("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-colors ${
                selectedProduct === "all"
                  ? "bg-[#174b35] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Все городки
            </button>
            {productsList.map((prod) => (
              <button
                key={prod}
                type="button"
                onClick={() => setSelectedProduct(prod)}
                style={{ fontFamily: "var(--font-mono)" }}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-colors ${
                  selectedProduct === prod
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {prod}
              </button>
            ))}
          </div>
        </div>

        {/* Parts Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCatalog.slice(0, visibleCount).map((item, idx) => {
            const dxf = getDxfFilesForArticle(item.article);
            const metal = getMetalFiles(item.article);
            const cleanNum = String(item.article || "")
              .trim()
              .replace(/^0+/, "")
              .replace(/\s*[МM][ПP]$/i, "");
            const matchedGif = gifMap.get(cleanNum);
            const imgPath = item.image
              ? "/" + item.image.replace(/^\.?\//, "")
              : matchedGif
              ? "/" + matchedGif.path.replace(/^\.?\//, "")
              : null;

            return (
              <article
                key={`${item.product}-${item.article}-${idx}`}
                className="hc-card-anim flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-white hover:border-emerald-400"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      style={{ fontFamily: "var(--font-mono)" }}
                      className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-900"
                    >
                      {item.article || "Без артикула"}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {item.product} · {item.qty}
                    </span>
                  </div>

                  {imgPath && (
                    <button
                      type="button"
                      onClick={() =>
                        setLightbox({
                          src: imgPath,
                          title: `${item.article} — ${item.name}`,
                        })
                      }
                      className="mt-3 flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2"
                    >
                      <img
                        src={imgPath}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </button>
                  )}

                  <h3 className="mt-3 text-sm font-extrabold text-slate-900">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Раздел: {classifyPartCategory(item)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 flex flex-wrap gap-1.5">
                  {dxf.main.map((f) => (
                    <a
                      key={f.file}
                      href={f.href}
                      download={f.file}
                      data-file-name={f.file}
                      data-file-title={`${item.article} — ${item.name} (DXF)`}
                      data-file-type="DXF"
                      data-article={item.article}
                      data-category="Библиотека деталей · DXF"
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-500"
                    >
                      <Download className="h-3.5 w-3.5" /> DXF ({f.file})
                    </a>
                  ))}
                  {dxf.mirror.map((f) => (
                    <a
                      key={f.file}
                      href={f.href}
                      download={f.file}
                      data-file-name={f.file}
                      data-file-title={`${item.article} — Зеркальный DXF`}
                      data-file-type="DXF"
                      data-article={item.article}
                      data-category="Зеркальные чертежи DXF"
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-400 bg-emerald-50 px-2.5 py-1.5 text-xs font-extrabold text-emerald-900"
                    >
                      🪞 {f.file}
                    </a>
                  ))}
                  {metal
                    .filter((mf) => mf.t === "pdf" || mf.t === "gif")
                    .map((mf) => (
                      <a
                        key={mf.f}
                        href={`/metall/metall/${encodeURIComponent(mf.f)}`}
                        download={mf.f}
                        data-file-name={mf.f}
                        data-file-title={`Металл ${item.article} (${mf.f})`}
                        data-file-type={mf.t.toUpperCase()}
                        data-article={item.article}
                        data-category="Металлические детали МП"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate-800 hover:bg-slate-100"
                      >
                        <Download className="h-3.5 w-3.5 text-emerald-700" />{" "}
                        {mf.t.toUpperCase()}
                      </a>
                    ))}
                  {imgPath && (
                    <button
                      type="button"
                      onClick={() =>
                        setLightbox({
                          src: imgPath,
                          title: `${item.article} — ${item.name}`,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      <Eye className="h-3.5 w-3.5" /> Эскиз
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {filteredCatalog.length > visibleCount && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((v) => v + 48)}
              className="rounded-xl bg-[#174b35] px-6 py-3 text-xs sm:text-sm font-extrabold text-white hover:bg-emerald-700"
            >
              Показать ещё ({filteredCatalog.length - visibleCount} осталось)
            </button>
          </div>
        )}
      </section>

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
