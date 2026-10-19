"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  MessageSquareWarning,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Clock,
  ArrowLeft,
  Send,
  ShieldAlert,
  Crown,
  Users,
  FileText,
  HardHat,
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getStoredEmployeeLogin,
  setStoredEmployeeLogin,
} from "@/components/FactoryHeader";

interface Employee {
  id: number;
  login: string;
  name: string;
  role: "user" | "manager" | "admin";
  department: string;
  position: string;
  blocked: boolean;
}

interface DownloadItem {
  id: number;
  employeeLogin: string;
  fileName: string;
  fileTitle: string;
  fileType: string;
  fileUrl: string;
  article: string;
  category: string;
  downloadedAt: string;
}

interface ComplaintItem {
  id: number;
  employeeLogin: string;
  employeeName: string;
  subject: string;
  message: string;
  contact: string;
  page: string;
  status: string;
  adminReply: string;
  createdAt: string;
}

interface WarningItem {
  id: number;
  employeeLogin: string;
  employeeName: string;
  issuedBy: string;
  reason: string;
  severity: string;
  acknowledged: boolean;
  createdAt: string;
}

interface AuditItem {
  id: number;
  actorLogin: string;
  actorName: string;
  action: string;
  targetLogin: string;
  details: string;
  createdAt: string;
}

export default function CabinetPage() {
  const [activeLogin, setActiveLogin] = useState<string>("smirnov");
  const [loading, setLoading] = useState<boolean>(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [myDownloads, setMyDownloads] = useState<DownloadItem[]>([]);
  const [myComplaints, setMyComplaints] = useState<ComplaintItem[]>([]);
  const [myWarnings, setMyWarnings] = useState<WarningItem[]>([]);

  // Admin data
  const [allComplaints, setAllComplaints] = useState<ComplaintItem[]>([]);
  const [allWarnings, setAllWarnings] = useState<WarningItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [adminSectionOpen, setAdminSectionOpen] = useState<boolean>(false);

  // New complaint form
  const [newComplaintOpen, setNewComplaintOpen] = useState<boolean>(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // Admin issue warning form
  const [warnTargetLogin, setWarnTargetLogin] = useState("smirnov");
  const [warnReason, setWarnReason] = useState("");
  const [warnSeverity, setWarnSeverity] = useState("warning");
  const [issuingWarning, setIssuingWarning] = useState(false);

  // New employee registration modal/collapsible
  const [registerOpen, setRegisterOpen] = useState(false);
  const [regName, setRegName] = useState("");
  const [regLogin, setRegLogin] = useState("");
  const [regDept, setRegDept] = useState("Сборочный цех");
  const [regPos, setRegPos] = useState("Слесарь-сборщик");

  const fetchCabinetData = useCallback(async (loginToLoad: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/cabinet?login=${encodeURIComponent(loginToLoad)}`
      );
      const data = await res.json();
      if (data.employee) {
        setEmployee(data.employee);
        setEmployeesList(data.employees || []);
        setMyDownloads(data.myDownloads || []);
        setMyComplaints(data.myComplaints || []);
        setMyWarnings(data.myWarnings || []);
        setAllComplaints(data.allComplaints || []);
        setAllWarnings(data.allWarnings || []);
        setAuditLogs(data.audit || []);
        if (data.employee.role === "admin") {
          setAdminSectionOpen(true);
        }
      }
    } catch (e) {
      console.error("Failed to load cabinet:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = getStoredEmployeeLogin();
    setActiveLogin(saved);
    fetchCabinetData(saved);

    const onEmpChange = (e: Event) => {
      const custom = e as CustomEvent<{ login: string }>;
      const nextLogin = custom.detail?.login || getStoredEmployeeLogin();
      setActiveLogin(nextLogin);
      fetchCabinetData(nextLogin);
    };

    const onRefresh = () => fetchCabinetData(getStoredEmployeeLogin());

    window.addEventListener("hc-employee-changed", onEmpChange);
    window.addEventListener("hc-downloads-updated", onRefresh);
    window.addEventListener("hc-complaints-updated", onRefresh);
    return () => {
      window.removeEventListener("hc-employee-changed", onEmpChange);
      window.removeEventListener("hc-downloads-updated", onRefresh);
      window.removeEventListener("hc-complaints-updated", onRefresh);
    };
  }, [fetchCabinetData]);

  const handleSwitchEmployee = (login: string) => {
    setStoredEmployeeLogin(login);
    setActiveLogin(login);
    fetchCabinetData(login);
  };

  const handleAcknowledgeWarning = async (warningId: number) => {
    await fetch("/api/cabinet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "acknowledge_warning",
        login: activeLogin,
        warningId,
      }),
    });
    fetchCabinetData(activeLogin);
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmittingComplaint(true);
    try {
      const res = await fetch("/api/cabinet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_complaint",
          login: activeLogin,
          subject: subject.trim() || "Обращение из личного кабинета",
          message: message.trim(),
          contact: contact.trim(),
          page: "Личный кабинет сотрудника",
        }),
      });
      if (res.ok) {
        setSubject("");
        setMessage("");
        setContact("");
        setNewComplaintOpen(false);
        fetchCabinetData(activeLogin);
      }
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleIssueWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warnReason.trim()) return;
    setIssuingWarning(true);
    try {
      const res = await fetch("/api/cabinet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "issue_warning",
          login: activeLogin,
          targetLogin: warnTargetLogin,
          reason: warnReason.trim(),
          severity: warnSeverity,
        }),
      });
      if (res.ok) {
        setWarnReason("");
        fetchCabinetData(activeLogin);
        window.dispatchEvent(
          new CustomEvent("hc-toast", {
            detail: {
              text: "Предупреждение отправлено в личный кабинет сотрудника",
              kind: "success",
            },
          })
        );
      }
    } finally {
      setIssuingWarning(false);
    }
  };

  const handleUpdateComplaintStatus = async (
    complaintId: number,
    status: string,
    adminReply?: string
  ) => {
    await fetch("/api/cabinet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_complaint",
        login: activeLogin,
        complaintId,
        status,
        adminReply,
      }),
    });
    fetchCabinetData(activeLogin);
  };

  const handleUpdateEmployee = async (
    employeeId: number,
    patch: { role?: string; blocked?: boolean }
  ) => {
    await fetch("/api/cabinet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_employee",
        login: activeLogin,
        employeeId,
        ...patch,
      }),
    });
    fetchCabinetData(activeLogin);
  };

  const handleRegisterEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regLogin.trim()) return;
    const res = await fetch("/api/cabinet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register_employee",
        newLogin: regLogin.trim(),
        name: regName.trim(),
        department: regDept.trim(),
        position: regPos.trim(),
      }),
    });
    const data = await res.json();
    if (res.ok && data.employee) {
      setRegName("");
      setRegLogin("");
      setRegisterOpen(false);
      handleSwitchEmployee(data.employee.login);
    } else if (data.error) {
      alert(data.error);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
            ✓ Решена
          </span>
        );
      case "reviewing":
        return (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900">
            ⏳ На рассмотрении
          </span>
        );
      case "rejected":
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-extrabold text-red-800">
            × Отклонена
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-900">
            ● Новая
          </span>
        );
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6">
      {/* Breadcrumb & Back Link */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link href="/" className="hover:text-emerald-700">
            Главная
          </Link>
          <span>/</span>
          <strong className="text-slate-900">Личный кабинет сотрудника</strong>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" /> Вернуться в техбазу
        </Link>
      </div>

      {/* EMPLOYEE PROFILE HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#174b35] via-[#173658] to-[#2f7652] p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-emerald-400/40 bg-[#21476e] text-3xl font-extrabold shadow-inner overflow-hidden">
              {employee?.role === "admin" ? (
                <img
                  src="/assets/admin-avatar.jpg"
                  alt={employee.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <HardHat className="h-10 w-10 text-amber-300" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-400/20 border border-emerald-300/30 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-200">
                  Личный кабинет сотрудника завода
                </span>
                <span className="rounded-full bg-emerald-400/20 border border-emerald-300/30 px-3 py-0.5 text-xs font-extrabold text-emerald-200">
                  {employee?.role === "admin"
                    ? "👑 Администратор сайта"
                    : employee?.role === "manager"
                    ? "📋 Руководитель / Мастер"
                    : "👷 Сотрудник цеха"}
                </span>
              </div>

              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
                {employee ? employee.name : "Загрузка профиля..."}
              </h1>
              <p className="mt-1 text-sm text-slate-200">
                {employee?.position} · {employee?.department}
              </p>
            </div>
          </div>

          {/* Employee Switcher & New Employee Button */}
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-200 mb-2">
              Просмотр кабинета от лица сотрудника:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {employeesList.map((emp) => (
                <button
                  key={emp.login}
                  type="button"
                  onClick={() => handleSwitchEmployee(emp.login)}
                  className={`rounded-xl px-3 py-2 text-xs font-extrabold transition-all ${
                    activeLogin === emp.login
                      ? "bg-emerald-400 text-slate-950 shadow"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {emp.role === "admin" ? "👑 " : "👷 "}
                  {emp.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setRegisterOpen((v) => !v)}
                className="inline-flex items-center gap-1 rounded-xl border border-emerald-300/40 bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-100 hover:bg-emerald-500/30"
              >
                <Plus className="h-3.5 w-3.5" /> Новый сотрудник
              </button>
            </div>
          </div>
        </div>

        {/* Register new employee collapsible */}
        {registerOpen && (
          <form
            onSubmit={handleRegisterEmployee}
            className="hc-reveal mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-white/20 bg-slate-900/60 p-4 sm:grid-cols-5"
          >
            <input
              type="text"
              required
              placeholder="Имя и фамилия"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-slate-300"
            />
            <input
              type="text"
              required
              placeholder="Логин (латиницей)"
              value={regLogin}
              onChange={(e) => setRegLogin(e.target.value)}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-slate-300"
            />
            <input
              type="text"
              placeholder="Цех / отдел"
              value={regDept}
              onChange={(e) => setRegDept(e.target.value)}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-slate-300"
            />
            <input
              type="text"
              placeholder="Должность"
              value={regPos}
              onChange={(e) => setRegPos(e.target.value)}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-slate-300"
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-400 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-emerald-300"
            >
              Создать профиль
            </button>
          </form>
        )}
      </section>

      {/* QUICK STATS ROW */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="hc-card-anim flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500">
              Последние скачивания
            </span>
            <strong className="block text-2xl font-extrabold text-slate-900">
              {myDownloads.length}{" "}
              <span className="text-xs font-semibold text-slate-500">
                файлов
              </span>
            </strong>
          </div>
        </div>

        <div className="hc-card-anim flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
            <MessageSquareWarning className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500">
              Мои жалобы и обращения
            </span>
            <strong className="block text-2xl font-extrabold text-slate-900">
              {myComplaints.length}{" "}
              <span className="text-xs font-semibold text-slate-500">
                обращений
              </span>
            </strong>
          </div>
        </div>

        <div
          className={`hc-card-anim flex items-center gap-4 rounded-2xl border p-5 shadow-2xs ${
            myWarnings.some((w) => !w.acknowledged)
              ? "border-amber-400 bg-amber-50/70"
              : "border-slate-200 bg-white"
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              myWarnings.length > 0
                ? "bg-amber-200 text-amber-900"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600">
              Предупреждения от админа сайта
            </span>
            <strong className="block text-2xl font-extrabold text-slate-900">
              {myWarnings.length}{" "}
              <span className="text-xs font-semibold text-slate-500">
                {myWarnings.length === 0 ? "(нет замечаний)" : "в профиле"}
              </span>
            </strong>
          </div>
        </div>
      </div>

      {/* =====================================================================
          БЛОК 1 КАБИНЕТА: ПРЕДУПРЕЖДЕНИЯ ОТ АДМИНА САЙТА (ЕСЛИ ТАКОВЫЕ ЕСТЬ)
         ===================================================================== */}
      <section className="mt-8 rounded-3xl border-2 border-amber-300/80 bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
                Уведомления от администрации системы
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                ⚠️ Предупреждения от администратора сайта
              </h2>
            </div>
          </div>

          <span className="rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1 text-xs font-extrabold text-amber-900">
            {myWarnings.length > 0
              ? `Записей: ${myWarnings.length}`
              : "Предупреждений нет"}
          </span>
        </div>

        <div className="mt-5">
          {myWarnings.length > 0 ? (
            <div className="space-y-3.5">
              {myWarnings.map((warn) => (
                <article
                  key={warn.id}
                  className={`hc-card-anim flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 ${
                    warn.acknowledged
                      ? "border-slate-200 bg-slate-50/70"
                      : "border-amber-400 bg-amber-50/60 shadow-xs"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-[11px] font-extrabold uppercase ${
                          warn.acknowledged
                            ? "bg-slate-200 text-slate-700"
                            : "bg-amber-400 text-slate-950"
                        }`}
                      >
                        {warn.acknowledged
                          ? "Прочитано сотрудником"
                          : "Новое предупреждение"}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        Выдал: {warn.issuedBy}
                      </span>
                      <span className="text-xs text-slate-400">
                        · {formatDate(warn.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                      {warn.reason}
                    </p>
                  </div>

                  {!warn.acknowledged ? (
                    <button
                      type="button"
                      onClick={() => handleAcknowledgeWarning(warn.id)}
                      className="shrink-0 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 transition-colors shadow-2xs"
                    >
                      ✓ Ознакомлен
                    </button>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> Подтверждено
                    </span>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-sm font-bold text-emerald-900">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
              <span>
                У вас нет активных предупреждений от администратора сайта. Все
                рабочие процессы выполняются без замечаний!
              </span>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          БЛОК 2 И БЛОК 3 КАБИНЕТА:
          - ПОСЛЕДНИЕ СКАЧИВАНИЯ СОТРУДНИКА
          - ЕГО ЖАЛОБЫ И ОБРАЩЕНИЯ
         ===================================================================== */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* БЛОК 2: ПОСЛЕДНИЕ СКАЧИВАНИЯ */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                    История загрузок сотрудника
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    📥 Мои последние скачивания
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fetchCabinetData(activeLogin)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Обновить
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Все скачанные вами чертежи раскроя DXF, PDF-чертежи металла,
              эскизы деталей и спецификации Excel автоматически сохраняются
              здесь для быстрого повторного доступа.
            </p>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  Загрузка списка скачиваний...
                </div>
              ) : myDownloads.length > 0 ? (
                myDownloads.map((dl) => (
                  <div
                    key={dl.id}
                    className="hc-card-anim flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 hover:border-emerald-300 hover:bg-white"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        style={{ fontFamily: "var(--font-mono)" }}
                        className={`mt-0.5 flex h-10 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                          dl.fileType === "DXF"
                            ? "bg-emerald-100 text-emerald-900"
                            : dl.fileType === "XLSX"
                            ? "bg-emerald-100 text-emerald-900"
                            : dl.fileType === "PDF"
                            ? "bg-red-100 text-red-900"
                            : "bg-indigo-100 text-indigo-900"
                        }`}
                      >
                        {dl.fileType}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {dl.article && (
                            <span
                              style={{ fontFamily: "var(--font-mono)" }}
                              className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-800"
                            >
                              {dl.article}
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-slate-500">
                            {dl.category}
                          </span>
                        </div>
                        <strong className="mt-0.5 block truncate text-sm font-extrabold text-slate-900">
                          {dl.fileTitle}
                        </strong>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(dl.downloadedAt)}</span>
                          <span>· Файл: {dl.fileName}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={dl.fileUrl}
                      download={dl.fileName}
                      data-no-track="true"
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#174b35] px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Скачать</span>
                    </a>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  У этого сотрудника пока нет скачанных файлов. Перейдите в{" "}
                  <Link href="/parts" className="font-bold text-emerald-700 underline">
                    каталог деталей
                  </Link>{" "}
                  или{" "}
                  <Link
                    href="/playgrounds"
                    className="font-bold text-emerald-700 underline"
                  >
                    городков
                  </Link>
                  , чтобы скачать чертёж.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Нужен другой чертёж или спецификация?</span>
            <Link
              href="/parts"
              className="font-extrabold text-emerald-700 hover:underline"
            >
              Перейти к чертежам деталей →
            </Link>
          </div>
        </section>

        {/* БЛОК 3: МОИ ЖАЛОБЫ И ОБРАЩЕНИЯ */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <MessageSquareWarning className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                    Обратная связь с администратором
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    📨 Мои жалобы и обращения
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setNewComplaintOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-indigo-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Написать жалобу</span>
              </button>
            </div>

            {/* Inline form to submit a new complaint */}
            {newComplaintOpen && (
              <form
                onSubmit={handleSubmitComplaint}
                className="hc-reveal mt-4 space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4"
              >
                <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">
                  Новое обращение от лица: {employee?.name}
                </div>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Тема / Артикул детали (например: Вопрос по 0044СБ)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900"
                />
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Опишите проблему или замечание по чертежу / сайту..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900"
                />
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Участок / пост или телефон (необязательно)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setNewComplaintOpen(false)}
                    className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={submittingComplaint}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-indigo-500"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {submittingComplaint ? "Отправка..." : "Отправить"}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-4 space-y-3.5">
              {loading ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  Загрузка обращений...
                </div>
              ) : myComplaints.length > 0 ? (
                myComplaints.map((comp) => (
                  <article
                    key={comp.id}
                    className="hc-card-anim rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-400">
                        {formatDate(comp.createdAt)} · {comp.page}
                      </span>
                      {statusBadge(comp.status)}
                    </div>
                    <h3 className="mt-2 text-sm sm:text-base font-extrabold text-slate-900">
                      {comp.subject}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {comp.message}
                    </p>
                    {comp.adminReply && (
                      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-950">
                        <strong className="block font-extrabold text-emerald-900">
                          Ответ администратора (Дарья Алексеевна):
                        </strong>
                        <span className="mt-0.5 block">{comp.adminReply}</span>
                      </div>
                    )}
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  Вы ещё не отправляли жалоб или обращений. Нажмите «Написать
                  жалобу», если заметили неточность в чертежах или работе сайта.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================================
          ПАНЕЛЬ УПРАВЛЕНИЯ АДМИНИСТРАТОРА САЙТА (Выдача предупреждений,
          обработка всех жалоб и управление ролями сотрудников)
         ===================================================================== */}
      <section className="mt-10 rounded-3xl border-2 border-slate-300 bg-white overflow-hidden shadow-md">
        <button
          type="button"
          onClick={() => setAdminSectionOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 bg-[#174b35] px-6 py-5 text-left text-white hover:bg-[#163252] transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                Панель администратора сайта (Дарья Алексеевна)
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold">
                Управление предупреждениями, всеми жалобами и доступами сотрудников
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold">
            <span>{adminSectionOpen ? "Свернуть" : "Открыть панель админа"}</span>
            {adminSectionOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>

        {adminSectionOpen && (
          <div className="hc-reveal p-6 sm:p-8 space-y-8 bg-slate-50/60">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* 1. ВЫДАТЬ ПРЕДУПРЕЖДЕНИЕ СОТРУДНИКУ */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-600" />
                  Выдать предупреждение сотруднику
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Предупреждение мгновенно отобразится в личном кабинете выбранного сотрудника.
                </p>

                <form onSubmit={handleIssueWarning} className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Кому (сотрудник)
                      </label>
                      <select
                        value={warnTargetLogin}
                        onChange={(e) => setWarnTargetLogin(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                      >
                        {employeesList.map((u) => (
                          <option key={u.login} value={u.login}>
                            {u.name} ({u.login} — {u.position})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Важность
                      </label>
                      <select
                        value={warnSeverity}
                        onChange={(e) => setWarnSeverity(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                      >
                        <option value="warning">⚠️ Предупреждение по работе</option>
                        <option value="critical">🚨 Строгое замечание</option>
                        <option value="info">ℹ️ Инструктаж / Напоминание</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Текст предупреждения от администратора
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={warnReason}
                      onChange={(e) => setWarnReason(e.target.value)}
                      placeholder="Например: Проверяйте ревизию чертежа перед запуском ЧПУ..."
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={issuingWarning}
                    className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 transition-colors"
                  >
                    {issuingWarning
                      ? "Отправка..."
                      : "Выдать предупреждение сотруднику"}
                  </button>
                </form>
              </div>

              {/* 2. УПРАВЛЕНИЕ СОТРУДНИКАМИ */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-700" />
                  Сотрудники в системе ({employeesList.length})
                </h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="pb-2 font-bold">Сотрудник</th>
                        <th className="pb-2 font-bold">Роль</th>
                        <th className="pb-2 font-bold">Статус</th>
                        <th className="pb-2 font-bold">Действие</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {employeesList.map((u) => (
                        <tr key={u.id}>
                          <td className="py-2.5 pr-2">
                            <strong className="block text-slate-900">
                              {u.name}
                            </strong>
                            <span className="text-[11px] text-slate-500">
                              {u.login} · {u.position}
                            </span>
                          </td>
                          <td className="py-2.5 pr-2">
                            <select
                              value={u.role}
                              onChange={(e) =>
                                handleUpdateEmployee(u.id, {
                                  role: e.target.value,
                                })
                              }
                              className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-bold"
                            >
                              <option value="user">Сотрудник</option>
                              <option value="manager">Руководитель</option>
                              <option value="admin">Администратор</option>
                            </select>
                          </td>
                          <td className="py-2.5 pr-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                                u.blocked
                                  ? "bg-red-100 text-red-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {u.blocked ? "Заблокирован" : "Активен"}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateEmployee(u.id, {
                                  blocked: !u.blocked,
                                })
                              }
                              className="rounded-lg border border-slate-300 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                            >
                              {u.blocked ? "Разблокировать" : "Блокировать"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 3. ВСЕ ЖАЛОБЫ СОТРУДНИКОВ (ДЛЯ АДМИНА) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Все обращения сотрудников ({allComplaints.length})
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {allComplaints.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-emerald-900">
                          От: {c.employeeName} ({c.employeeLogin})
                        </span>
                        {statusBadge(c.status)}
                      </div>
                      <h4 className="mt-1.5 text-sm font-extrabold text-slate-900">
                        {c.subject}
                      </h4>
                      <p className="mt-1 text-xs text-slate-600">{c.message}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateComplaintStatus(
                            c.id,
                            "reviewing",
                            "Обращение принято в работу администратором."
                          )
                        }
                        className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 hover:bg-amber-200"
                      >
                        В работу
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateComplaintStatus(
                            c.id,
                            "resolved",
                            "Проблема проверена и исправлена в базе."
                          )
                        }
                        className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900 hover:bg-emerald-200"
                      >
                        ✓ Решена
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateComplaintStatus(c.id, "rejected")
                        }
                        className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold text-red-900 hover:bg-red-200"
                      >
                        Отклонить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
