import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  employees,
  employeeDownloads,
  employeeComplaints,
  adminWarnings,
  auditLogs,
} from "@/db/schema";
import { ensureFactoryDb } from "@/lib/db-seed";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureFactoryDb();

  const loginParam =
    req.nextUrl.searchParams.get("login")?.trim().toLowerCase() || "smirnov";

  const allEmployees = await db
    .select()
    .from(employees)
    .orderBy(employees.id);

  let currentEmployee =
    allEmployees.find((e) => e.login.toLowerCase() === loginParam) ||
    allEmployees[0];

  const myDownloads = await db
    .select()
    .from(employeeDownloads)
    .where(eq(employeeDownloads.employeeLogin, currentEmployee.login))
    .orderBy(desc(employeeDownloads.downloadedAt))
    .limit(50);

  const myComplaints = await db
    .select()
    .from(employeeComplaints)
    .where(eq(employeeComplaints.employeeLogin, currentEmployee.login))
    .orderBy(desc(employeeComplaints.createdAt))
    .limit(50);

  const myWarnings = await db
    .select()
    .from(adminWarnings)
    .where(eq(adminWarnings.employeeLogin, currentEmployee.login))
    .orderBy(desc(adminWarnings.createdAt))
    .limit(50);

  const allComplaints = await db
    .select()
    .from(employeeComplaints)
    .orderBy(desc(employeeComplaints.createdAt))
    .limit(100);

  const allWarnings = await db
    .select()
    .from(adminWarnings)
    .orderBy(desc(adminWarnings.createdAt))
    .limit(100);

  const allDownloads = await db
    .select()
    .from(employeeDownloads)
    .orderBy(desc(employeeDownloads.downloadedAt))
    .limit(100);

  const recentAudit = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(50);

  return NextResponse.json({
    employee: currentEmployee,
    employees: allEmployees,
    myDownloads,
    myComplaints,
    myWarnings,
    allComplaints,
    allWarnings,
    allDownloads,
    audit: recentAudit,
  });
}

export async function POST(req: NextRequest) {
  await ensureFactoryDb();

  try {
    const body = await req.json();
    const action = String(body.action || "");
    const login = String(body.login || "smirnov").trim().toLowerCase();

    const allEmployees = await db.select().from(employees);
    const actor =
      allEmployees.find((e) => e.login.toLowerCase() === login) ||
      allEmployees[0];

    if (action === "record_download") {
      const fileName = String(body.fileName || "Чертёж").trim();
      const fileTitle = String(body.fileTitle || fileName).trim();
      const fileType = String(body.fileType || "DXF")
        .trim()
        .toUpperCase();
      const fileUrl = String(body.fileUrl || "#").trim();
      const article = String(body.article || "").trim();
      const category = String(
        body.category || "Чертежи и техническая документация"
      ).trim();

      const [inserted] = await db
        .insert(employeeDownloads)
        .values({
          employeeId: actor.id,
          employeeLogin: actor.login,
          fileName,
          fileTitle,
          fileType,
          fileUrl,
          article,
          category,
        })
        .returning();

      return NextResponse.json({ ok: true, download: inserted });
    }

    if (action === "submit_complaint") {
      const subject =
        String(body.subject || "").trim() || "Обращение по техбазе";
      const message = String(body.message || "").trim();
      const contact = String(body.contact || "").trim();
      const page = String(body.page || "Техническая система").trim();

      if (message.length < 3) {
        return NextResponse.json(
          { error: "Опишите проблему подробнее (минимум 3 символа)" },
          { status: 400 }
        );
      }

      const [inserted] = await db
        .insert(employeeComplaints)
        .values({
          employeeId: actor.id,
          employeeLogin: actor.login,
          employeeName: actor.name,
          subject,
          message,
          contact,
          page,
          status: "new",
        })
        .returning();

      await db.insert(auditLogs).values({
        actorLogin: actor.login,
        actorName: actor.name,
        action: "submit_complaint",
        targetLogin: "admin",
        details: `Новое обращение: ${subject}`,
      });

      return NextResponse.json({ ok: true, complaint: inserted });
    }

    if (action === "acknowledge_warning") {
      const warningId = Number(body.warningId);
      if (!warningId) {
        return NextResponse.json(
          { error: "Не указан ID предупреждения" },
          { status: 400 }
        );
      }
      await db
        .update(adminWarnings)
        .set({ acknowledged: true })
        .where(eq(adminWarnings.id, warningId));

      return NextResponse.json({ ok: true });
    }

    if (action === "issue_warning") {
      const targetLogin = String(body.targetLogin || "")
        .trim()
        .toLowerCase();
      const reason = String(body.reason || "").trim();
      const severity = String(body.severity || "warning").trim();

      const target = allEmployees.find(
        (e) => e.login.toLowerCase() === targetLogin
      );
      if (!target || reason.length < 3) {
        return NextResponse.json(
          { error: "Выберите сотрудника и укажите текст предупреждения" },
          { status: 400 }
        );
      }

      const [inserted] = await db
        .insert(adminWarnings)
        .values({
          employeeId: target.id,
          employeeLogin: target.login,
          employeeName: target.name,
          issuedBy: `${actor.name} (Администратор сайта)`,
          reason,
          severity,
          acknowledged: false,
        })
        .returning();

      await db.insert(auditLogs).values({
        actorLogin: actor.login,
        actorName: actor.name,
        action: "warning",
        targetLogin: target.login,
        details: `Выдано предупреждение сотруднику ${target.name}: ${reason}`,
      });

      return NextResponse.json({ ok: true, warning: inserted });
    }

    if (action === "update_complaint") {
      const complaintId = Number(body.complaintId);
      const status = String(body.status || "resolved");
      const adminReply = String(body.adminReply || "").trim();

      const updateData: { status: string; adminReply?: string } = { status };
      if (adminReply) updateData.adminReply = adminReply;

      await db
        .update(employeeComplaints)
        .set(updateData)
        .where(eq(employeeComplaints.id, complaintId));

      await db.insert(auditLogs).values({
        actorLogin: actor.login,
        actorName: actor.name,
        action: "complaint",
        targetLogin: "",
        details: `Статус обращения #${complaintId} изменён на «${status}»`,
      });

      return NextResponse.json({ ok: true });
    }

    if (action === "update_employee") {
      const targetId = Number(body.employeeId);
      const role = body.role ? String(body.role) : undefined;
      const blocked =
        typeof body.blocked === "boolean" ? body.blocked : undefined;

      const patch: Partial<typeof employees.$inferInsert> = {};
      if (role && ["user", "manager", "admin"].includes(role)) {
        patch.role = role;
      }
      if (typeof blocked === "boolean") {
        patch.blocked = blocked;
      }

      await db.update(employees).set(patch).where(eq(employees.id, targetId));

      await db.insert(auditLogs).values({
        actorLogin: actor.login,
        actorName: actor.name,
        action: "employee_update",
        targetLogin: String(targetId),
        details: `Обновлены права пользователя ID ${targetId}: ${JSON.stringify(patch)}`,
      });

      return NextResponse.json({ ok: true });
    }

    if (action === "register_employee") {
      const newLogin = String(body.newLogin || "")
        .trim()
        .toLowerCase();
      const name = String(body.name || "").trim();
      const department =
        String(body.department || "").trim() || "Производственный цех";
      const position = String(body.position || "").trim() || "Сотрудник цеха";

      if (!newLogin || newLogin.length < 3 || !name) {
        return NextResponse.json(
          { error: "Укажите имя и логин (от 3 символов)" },
          { status: 400 }
        );
      }

      const exists = allEmployees.some(
        (e) => e.login.toLowerCase() === newLogin
      );
      if (exists) {
        return NextResponse.json(
          { error: "Сотрудник с таким логином уже зарегистрирован" },
          { status: 400 }
        );
      }

      const [created] = await db
        .insert(employees)
        .values({
          login: newLogin,
          name,
          role: "user",
          department,
          position,
          blocked: false,
        })
        .returning();

      return NextResponse.json({ ok: true, employee: created });
    }

    return NextResponse.json(
      { error: "Неизвестное действие" },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Ошибка сервера";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
