"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  AlertTriangle,
  MessageSquareWarning,
  ShieldCheck,
  Phone,
  Sparkles,
  Download,
  CheckCircle2,
  X,
  Copy,
  ExternalLink,
  HardHat,
  Crown,
  Wrench,
  Home,
  Layers,
  Trees,
  Package,
} from "lucide-react";

export interface ActiveEmployee {
  login: string;
  name: string;
  role: "user" | "manager" | "admin";
  position: string;
}

export const DEFAULT_EMPLOYEES: ActiveEmployee[] = [
  {
    login: "smirnov",
    name: "Алексей Смирнов",
    role: "user",
    position: "Слесарь-сборщик МП",
  },
  {
    login: "petrov",
    name: "Иван Петров",
    role: "user",
    position: "Оператор ЧПУ / Столяр",
  },
  {
    login: "volkov",
    name: "Сергей Волков",
    role: "manager",
    position: "Мастер цеха",
  },
  {
    login: "admin",
    name: "Дарья Алексеевна",
    role: "admin",
    position: "Администратор сайта",
  },
];

export function getStoredEmployeeLogin(): string {
  if (typeof window === "undefined") return "smirnov";
  return localStorage.getItem("hc_active_employee_login") || "smirnov";
}

export function setStoredEmployeeLogin(login: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("hc_active_employee_login", login);
  window.dispatchEvent(
    new CustomEvent("hc-employee-changed", { detail: { login } })
  );
}

export async function recordEmployeeDownload(params: {
  fileName: string;
  fileTitle: string;
  fileType: string;
  fileUrl: string;
  article?: string;
  category?: string;
}) {
  const login = getStoredEmployeeLogin();
  try {
    await fetch("/api/cabinet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "record_download",
        login,
        ...params,
      }),
    });
    window.dispatchEvent(
      new CustomEvent("hc-toast", {
        detail: {
          text: `Скачивание «${params.fileName}» добавлено в ваш Личный кабинет`,
          kind: "success",
        },
      })
    );
    window.dispatchEvent(new CustomEvent("hc-downloads-updated"));
  } catch (e) {
    console.error("Failed to record download:", e);
  }
}

export default function FactoryHeader() {
  const pathname = usePathname();
  const [activeLogin, setActiveLogin] = useState<string>("smirnov");
  const [warningCount, setWarningCount] = useState<number>(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [cursorGlow, setCursorGlow] = useState(true);
  const [toast, setToast] = useState<{
    text: string;
    kind: "success" | "error";
  } | null>(null);

  // Report form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Custom cursor follower coordinates
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

  const activeEmployee =
    DEFAULT_EMPLOYEES.find((e) => e.login === activeLogin) ||
    DEFAULT_EMPLOYEES[0];

  const showToast = (text: string, kind: "success" | "error" = "success") => {
    setToast({ text, kind });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  useEffect(() => {
    const saved = getStoredEmployeeLogin();
    setActiveLogin(saved);

    const handleEmpChange = (e: Event) => {
      const custom = e as CustomEvent<{ login: string }>;
      if (custom.detail?.login) {
        setActiveLogin(custom.detail.login);
      } else {
        setActiveLogin(getStoredEmployeeLogin());
      }
    };

    const handleToast = (e: Event) => {
      const custom = e as CustomEvent<{
        text: string;
        kind?: "success" | "error";
      }>;
      if (custom.detail?.text) {
        showToast(custom.detail.text, custom.detail.kind || "success");
      }
    };

    window.addEventListener("hc-employee-changed", handleEmpChange);
    window.addEventListener("hc-toast", handleToast);
    return () => {
      window.removeEventListener("hc-employee-changed", handleEmpChange);
      window.removeEventListener("hc-toast", handleToast);
    };
  }, []);

  // Fetch unacknowledged warning badge count for current employee
  useEffect(() => {
    let active = true;
    fetch(`/api/cabinet?login=${encodeURIComponent(activeLogin)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const unreadWarnings = Array.isArray(d.myWarnings)
          ? d.myWarnings.filter(
              (w: { acknowledged?: boolean }) => !w.acknowledged
            ).length
          : 0;
        setWarningCount(unreadWarnings);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [activeLogin, pathname]);

  // Global listener for download links to automatically log downloads into employee cabinet
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href") || "";
      const isDownloadAttr =
        anchor.hasAttribute("download") ||
        anchor.hasAttribute("data-track-download");
      const isFileHref = /\.(dxf|pdf|xlsx?|zip|rar|gif)(\?|#|$)/i.test(href);

      if (!isDownloadAttr && !isFileHref) return;
      if (anchor.hasAttribute("data-no-track")) return;

      const extMatch = href.match(/\.([a-z0-9]+)(?:\?|#|$)/i);
      const ext = (
        anchor.getAttribute("data-file-type") ||
        extMatch?.[1] ||
        "ФАЙЛ"
      ).toUpperCase();
      const rawFileName =
        anchor.getAttribute("data-file-name") ||
        decodeURIComponent(href.split("/").pop() || "чертеж");
      const fileTitle =
        anchor.getAttribute("data-file-title") ||
        anchor.textContent?.trim() ||
        rawFileName;
      const article = anchor.getAttribute("data-article") || "";
      const category =
        anchor.getAttribute("data-category") || document.title || "Техбаза";

      recordEmployeeDownload({
        fileName: rawFileName,
        fileTitle,
        fileType: ext,
        fileUrl: href,
        article,
        category,
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Smooth custom cursor ring tracking
  useEffect(() => {
    if (!cursorGlow) return;
    const onMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const el = e.target as HTMLElement | null;
      const interactive = Boolean(
        el?.closest(
          "a, button, summary, input, select, textarea, [role='button'], .hc-card-anim"
        )
      );
      setIsHoveringInteractive(interactive);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [cursorGlow]);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/cabinet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_complaint",
          login: activeLogin,
          subject: subject.trim() || "Обращение от сотрудника цеха",
          message: message.trim(),
          contact: contact.trim(),
          page: typeof document !== "undefined" ? document.title : pathname,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка отправки");
      setSubject("");
      setMessage("");
      setContact("");
      setReportOpen(false);
      showToast(
        "Обращение отправлено администратору и сохранено в вашем Личном кабинете"
      );
      window.dispatchEvent(new CustomEvent("hc-complaints-updated"));
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Не удалось отправить обращение",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = (value: string, label: string) => {
    navigator.clipboard
      ?.writeText(value)
      .then(() => showToast(`Скопировано (${label}): ${value}`))
      .catch(() => showToast(value));
  };

  return (
    <>
      {/* Custom Decorative Cursor Ring (desktop pointer devices) */}
      {cursorGlow && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[9999] hidden md:block transition-transform duration-150 ease-out"
          style={{
            left: 0,
            top: 0,
            transform: `translate3d(${mousePos.x - (isHoveringInteractive ? 20 : 13)}px, ${
              mousePos.y - (isHoveringInteractive ? 20 : 13)
            }px, 0)`,
          }}
        >
          <div
            className={`rounded-full border transition-all duration-150 ${
              isHoveringInteractive
                ? "h-10 w-10 border-emerald-400/80 bg-emerald-400/15 shadow-[0_0_16px_rgba(56,189,248,0.35)]"
                : "h-[26px] w-[26px] border-emerald-500/50 bg-emerald-500/5"
            }`}
          />
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#174b35]/95 text-white backdrop-blur-md shadow-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3.5 rounded-xl pr-2 focus:outline-none"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-400/30 bg-[#1c3b5e] shadow-inner transition-transform duration-200 group-hover:scale-105">
              <img
                src="/assets/brand-logo.png"
                alt="Счастливый ребёнок"
                className="h-9 w-9 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <strong className="text-sm sm:text-base font-extrabold tracking-wide text-white group-hover:text-emerald-200 transition-colors">
                СЧАСТЛИВЫЙ РЕБЁНОК
              </strong>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300/90">
                Единая техническая система завода
              </span>
            </div>
          </Link>

          {/* Quick Navigation for Factory Workers */}
          <nav
            aria-label="Основная навигация"
            className="hidden lg:flex items-center gap-1 rounded-xl bg-[#16314f] p-1 border border-slate-700/70"
          >
            <Link
              href="/"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                pathname === "/"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              Главная
            </Link>
            <Link
              href="/playgrounds"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                pathname.startsWith("/playgrounds") ||
                pathname.startsWith("/product")
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Городки (9)
            </Link>
            <Link
              href="/parts?group=%D0%93%D0%BE%D1%80%D0%BA%D0%B8"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Горки
            </Link>
            <Link
              href="/elements"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                pathname.startsWith("/elements")
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Trees className="h-3.5 w-3.5 text-emerald-300" />
              Благоустройство
            </Link>
            <Link
              href="/parts"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                pathname.startsWith("/parts")
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Wrench className="h-3.5 w-3.5" />
              Детали (1804)
            </Link>
            <Link
              href="/assemblies"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                pathname.startsWith("/assemblies")
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              Узлы СБ
            </Link>
          </nav>

          {/* Right Action Controls + Personal Cabinet */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Employee Quick Selector so workers/evaluators can test employee vs admin view */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-700 bg-[#173251] px-2.5 py-1.5 text-xs">
              <HardHat className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <label htmlFor="header-employee-select" className="sr-only">
                Профиль сотрудника
              </label>
              <select
                id="header-employee-select"
                value={activeLogin}
                onChange={(e) => setStoredEmployeeLogin(e.target.value)}
                className="bg-transparent font-semibold text-slate-100 focus:outline-none cursor-pointer pr-1"
                title="Быстрое переключение профиля сотрудника для проверки кабинета"
              >
                {DEFAULT_EMPLOYEES.map((emp) => (
                  <option
                    key={emp.login}
                    value={emp.login}
                    className="bg-[#174b35] text-white"
                  >
                    {emp.role === "admin" ? "👑 " : "👷 "}
                    {emp.name} ({emp.role === "admin" ? "Админ" : emp.position})
                  </option>
                ))}
              </select>
            </div>

            {/* Personal Cabinet Link with Warning / Download indicator */}
            <Link
              href="/cabinet"
              className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition-all shadow-sm ${
                pathname.startsWith("/cabinet")
                  ? "bg-emerald-500 text-slate-950 shadow-emerald-500/20"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
              }`}
            >
              {activeEmployee.role === "admin" ? (
                <Crown className="h-4 w-4 shrink-0" />
              ) : (
                <User className="h-4 w-4 shrink-0" />
              )}
              <span>Личный кабинет</span>
              {warningCount > 0 && (
                <span
                  title="Непрочитанные предупреждения от администратора"
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[11px] font-extrabold text-slate-950 shadow"
                >
                  ! {warningCount}
                </span>
              )}
            </Link>

            {/* Report a Problem Button */}
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-600/80 bg-[#1a3758] px-3 py-2 text-xs font-semibold text-slate-100 hover:border-amber-400/60 hover:bg-[#22456d] transition-all"
            >
              <MessageSquareWarning className="h-3.5 w-3.5 text-amber-300" />
              <span className="hidden md:inline">Сообщить о проблеме</span>
              <span className="md:hidden">Жалоба</span>
            </button>

            {/* Creator / Admin Info Button */}
            <button
              type="button"
              onClick={() => setCreatorOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-600/80 bg-[#1a3758] px-2.5 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-400/60 hover:bg-[#22456d] transition-all"
              title="Контакты администратора и создателя системы"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              <span className="hidden xl:inline">Админ: Дарья</span>
            </button>

            {/* Cursor Ring Toggle */}
            <button
              type="button"
              onClick={() => setCursorGlow((v) => !v)}
              className={`hidden md:flex items-center gap-1 rounded-xl border px-2.5 py-2 text-xs font-semibold transition-all ${
                cursorGlow
                  ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200"
                  : "border-slate-700 bg-slate-800/60 text-slate-400"
              }`}
              title="Переключить подсветку курсора"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 flex max-w-md items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold shadow-2xl transition-all ${
            toast.kind === "error"
              ? "border-red-300 bg-red-950/95 text-red-100"
              : "border-emerald-400/40 bg-[#174b35]/95 text-white"
          }`}
        >
          {toast.kind === "error" ? (
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
          ) : (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Report Problem / Submit Complaint Modal */}
      {reportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReportOpen(false);
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 text-slate-900 shadow-2xl">
            <button
              type="button"
              onClick={() => setReportOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <MessageSquareWarning className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Обратная связь цеха
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Сообщить о проблеме или неточности
                </h3>
              </div>
            </div>

            <p className="mb-4 text-sm text-slate-600">
              Вы вошли как{" "}
              <strong className="text-slate-900">{activeEmployee.name}</strong>.
              Ваше обращение сразу отобразится в вашем{" "}
              <Link
                href="/cabinet"
                onClick={() => setReportOpen(false)}
                className="font-bold text-emerald-700 underline"
              >
                Личном кабинете
              </Link>{" "}
              и поступит администратору сайта.
            </p>

            <form onSubmit={handleSubmitComplaint} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1">
                  Тема обращения / Артикул детали
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Например: Неточность в чертеже 0023МП или ИКССР-1.08"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1">
                  Описание проблемы
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Опишите, что нужно исправить, какой файл добавить или проверить..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1">
                  Цех / Участок или телефон для связи (необязательно)
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Например: Столярный участок, пост 2"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#16385c] px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Отправка..." : "Отправить жалобу"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Creator / Site Admin Modal */}
      {creatorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreatorOpen(false);
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
            <button
              type="button"
              onClick={() => setCreatorOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4">
              <img
                src="/assets/admin-avatar.jpg"
                alt="Дарья Алексеевна"
                className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow"
              />
              <div>
                <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                  Администратор сайта
                </span>
                <h3 className="mt-1 text-xl font-extrabold text-slate-900">
                  Дарья Алексеевна
                </h3>
                <p className="text-xs text-slate-500">
                  Создатель и администратор техсистемы
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-500 block">Имя и отчество</span>
                <strong className="mt-0.5 block text-sm text-slate-900">
                  Дарья Алексеевна
                </strong>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-500 block">Время работы</span>
                <strong className="mt-0.5 block text-sm text-slate-900">
                  09:00 – 21:00
                </strong>
              </div>
              <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Телефон</span>
                  <strong className="mt-0.5 block text-sm text-slate-900">
                    +7 930 849 97 90
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => copyText("+7 930 849 97 90", "Телефон")}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Copy className="h-3.5 w-3.5" /> Копировать
                </button>
              </div>
              <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">E-mail</span>
                  <strong className="mt-0.5 block text-sm text-slate-900">
                    kl1huq@icloud.com
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => copyText("kl1huq@icloud.com", "E-mail")}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Copy className="h-3.5 w-3.5" /> Копировать
                </button>
              </div>
              <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Сайт</span>
                  <a
                    href="https://guns.lol/auramalayya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:underline"
                  >
                    guns.lol/auramalayya <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyText("https://guns.lol/auramalayya", "Сайт")
                  }
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Copy className="h-3.5 w-3.5" /> Копировать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
