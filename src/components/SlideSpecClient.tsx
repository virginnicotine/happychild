"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Search, ChevronDown, ChevronUp, Layers, Ruler, FileSpreadsheet } from "lucide-react";

type Detail = { label: string; value: string | number };
type RecordItem = {
  row: number;
  number?: string | number | null;
  article?: string | number | null;
  name?: string | number | null;
  qty?: string | number | null;
  color?: string | number | null;
  length?: string | number | null;
  width?: string | number | null;
  height?: string | number | null;
  volume?: string | number | null;
  images?: { path: string }[];
  details?: Detail[];
};
export type SlideSpec = {
  code: string;
  title: string;
  dimensions: string;
  source_file: string;
  groups: { title: string; records: RecordItem[] }[];
};

function show(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}
function dimension(r: RecordItem) {
  const vals = [r.length, r.width, r.height].filter(v => v !== null && v !== undefined && v !== "");
  return vals.length ? vals.join(" × ") + " м" : "";
}
function colorLabel(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  const raw = String(value);
  return /^\d{4}$/.test(raw) ? `RAL ${raw}` : raw;
}

export default function SlideSpecClient({ spec }: { spec: SlideSpec }) {
  const [filter, setFilter] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const groups = useMemo(() => {
    const q = filter.trim().toLocaleLowerCase("ru");
    if (!q) return spec.groups;
    return spec.groups.map(g => ({
      ...g,
      records: g.records.filter(r =>
        [g.title, r.article, r.name, r.qty, r.color, r.length, r.width, r.height,
          ...(r.details || []).flatMap(d => [d.label, d.value])]
          .filter(v => v !== null && v !== undefined)
          .join(" ").toLocaleLowerCase("ru").includes(q)
      ),
    })).filter(g => g.records.length);
  }, [filter, spec.groups]);

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
          <Link href="/" className="hover:text-emerald-700">Главная</Link><span>/</span>
          <Link href="/slides" className="hover:text-emerald-700">Горки</Link><span>/</span>
          <strong className="text-slate-900">{spec.code}</strong>
        </div>
        <Link href="/slides" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-600">
          <ArrowLeft className="h-4 w-4" /> Все горки
        </Link>
      </div>

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#174b35] via-[#205d42] to-[#2f7652] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-200">
              <Layers className="h-4 w-4" /> Техническая карточка изделия
            </span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{spec.title}</h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-emerald-50">
              <Ruler className="h-4 w-4" /> Габариты: <strong className="text-white">{spec.dimensions}</strong>
            </p>
            <p className="mt-2 text-xs text-emerald-100">Данные перенесены из исходной спецификации; номера строк Excel сохранены для сверки.</p>
          </div>
          <a href={spec.source_file} download className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#174b35] transition-colors hover:bg-emerald-50">
            <Download className="h-4 w-4" /> Скачать Excel
          </a>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Спецификация</span>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">Состав изделия по разделам</h2>
          </div>
          <label className="flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 sm:max-w-sm">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Поиск по артикулу, названию, цвету..." className="w-full bg-transparent text-sm outline-none" />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {groups.map(g => <button key={g.title} onClick={() => setCollapsed(p => ({...p,[g.title]:false}))} className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100">{g.title} <span className="opacity-70">({g.records.length})</span></button>)}
        </div>
      </section>

      <div className="mt-5 space-y-4">
        {groups.map((group, gi) => {
          const groupKey = `${group.title}-${gi}`;
          const isCollapsed = Boolean(collapsed[groupKey]);
          return (
            <section key={`${group.title}-${gi}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button type="button" onClick={() => setCollapsed(p => ({...p,[groupKey]:!p[groupKey]}))} className="flex w-full items-center justify-between gap-4 bg-slate-50 px-4 py-4 text-left transition-colors hover:bg-emerald-50 sm:px-5">
                <span className="flex flex-wrap items-center gap-3">
                  <strong className="text-sm font-extrabold text-slate-900 sm:text-base">{group.title}</strong>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-900">{group.records.length} поз.</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-slate-600">{isCollapsed ? "Развернуть" : "Свернуть"}{isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}</span>
              </button>
              {!isCollapsed && <div className="divide-y divide-slate-100">
                {group.records.map((r, i) => (
                  <article key={`${r.row}-${i}`} className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {r.number !== null && r.number !== undefined && <span className="text-xs font-bold text-slate-400">№ {r.number}</span>}
                        {r.article !== null && r.article !== undefined && r.article !== "" && <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs font-extrabold text-slate-700">{r.article}</span>}
                        {colorLabel(r.color) && <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">{colorLabel(r.color)}</span>}
                      </div>
                      <h3 className="mt-2 whitespace-pre-line text-sm font-bold leading-relaxed text-slate-900 sm:text-base">{show(r.name)}</h3>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {r.qty !== null && r.qty !== undefined && r.qty !== "" && <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-slate-700">Количество: <b>{r.qty}</b></span>}
                        {dimension(r) && <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-slate-700">Размер: <b>{dimension(r)}</b></span>}
                        {r.volume !== null && r.volume !== undefined && r.volume !== "" && <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-slate-700">Объём: <b>{r.volume}</b></span>}
                      </div>
                      {!!r.details?.length && <details className="mt-3">
                        <summary className="cursor-pointer text-xs font-bold text-emerald-800">Дополнительные данные из Excel</summary>
                        <dl className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {r.details.map((d,j) => <div key={j} className="rounded-lg bg-slate-50 p-2"><dt className="text-[11px] text-slate-500">{d.label}</dt><dd className="mt-0.5 break-words text-xs font-semibold text-slate-800">{d.value}</dd></div>)}
                        </dl>
                      </details>}
                      <p className="mt-2 text-[11px] text-slate-400">Строка исходного Excel: {r.row}</p>
                    </div>
                    {!!r.images?.length && <div className="flex flex-wrap items-start gap-2 sm:max-w-[220px] sm:justify-end">
                      {r.images.map((img,j) => <a key={j} href={img.path} target="_blank" rel="noreferrer" className="flex h-28 w-28 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 hover:border-emerald-400"><img src={img.path} alt={`Изображение строки ${r.row}`} className="max-h-full max-w-full object-contain" /></a>)}
                    </div>}
                  </article>
                ))}
              </div>}
            </section>
          );
        })}
        {!groups.length && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">По запросу ничего не найдено.</div>}
      </div>
      <p className="mt-6 text-xs leading-relaxed text-slate-500">Справочная база переносит значения из Excel без изменения исходных файлов. Для официальной сверки используйте кнопку «Скачать Excel».</p>
    </main>
  );
}
