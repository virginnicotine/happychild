import Link from "next/link";
import { ArrowLeft, ArrowRight, Layers, Ruler, FileSpreadsheet } from "lucide-react";
import { SLIDE_PRODUCTS } from "@/lib/factory-data";

export default function SlidesCatalogPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6">
      <div className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link href="/" className="hover:text-emerald-700">Главная</Link>
        <span>/</span>
        <span className="text-slate-900">Горки</span>
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#174b35] via-[#205d42] to-[#2f7652] p-6 text-white shadow-xl sm:p-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-100">
            <Layers className="h-4 w-4" /> Техническая база предприятия
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">Горки</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-emerald-50 sm:text-base">
            Спецификации моделей ГСР с разделением по производственным группам.
            В карточках сохранены данные исходных Excel-файлов и доступно скачивание оригиналов.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-bold">{SLIDE_PRODUCTS.length} модели</span>
            <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-bold">Excel-спецификации</span>
          </div>
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {SLIDE_PRODUCTS.map((product) => (
          <article key={product.slug} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg">
            <Link href={`/slides/${product.slug}`} className="flex flex-1 flex-col">
              <div className="flex h-56 items-center justify-center bg-slate-50 p-5">
                <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-extrabold text-slate-900">{product.title}</h2>
                  <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-800">{product.code}</span>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <Ruler className="h-4 w-4 text-emerald-700" /> Габариты: {product.dimensions}
                </p>
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <FileSpreadsheet className="h-4 w-4" /> Исходная спецификация Excel
                </p>
              </div>
            </Link>
            <div className="border-t border-slate-100 p-4">
              <Link href={`/slides/${product.slug}`} className="flex items-center justify-between rounded-xl bg-[#174b35] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700">
                Открыть техническую карточку <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-600">
          <ArrowLeft className="h-4 w-4" /> На главную
        </Link>
      </div>
    </main>
  );
}
