import { db } from "@/db";
import {
  employees,
  employeeDownloads,
  employeeComplaints,
  adminWarnings,
  auditLogs,
} from "@/db/schema";
import { sql, count } from "drizzle-orm";

let initialized = false;

export async function ensureFactoryDb() {
  if (initialized) return;

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        login TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        department TEXT NOT NULL DEFAULT 'Производственный цех',
        position TEXT NOT NULL DEFAULT 'Рабочий цеха',
        blocked BOOLEAN NOT NULL DEFAULT FALSE,
        password_hash TEXT NOT NULL DEFAULT 'demo',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS employee_downloads (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL,
        employee_login TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_title TEXT NOT NULL,
        file_type TEXT NOT NULL DEFAULT 'DXF',
        file_url TEXT NOT NULL,
        article TEXT DEFAULT '',
        category TEXT DEFAULT 'Чертежи и документация',
        downloaded_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS employee_complaints (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL,
        employee_login TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        contact TEXT DEFAULT '',
        page TEXT DEFAULT 'Главная страница',
        status TEXT NOT NULL DEFAULT 'new',
        admin_reply TEXT DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_warnings (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL,
        employee_login TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        issued_by TEXT NOT NULL DEFAULT 'Дарья Алексеевна (Администратор)',
        reason TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'warning',
        acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        actor_login TEXT NOT NULL,
        actor_name TEXT NOT NULL,
        action TEXT NOT NULL,
        target_login TEXT DEFAULT '',
        details TEXT DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    const [{ value: existingCount }] = await db
      .select({ value: count() })
      .from(employees);

    if (existingCount === 0) {
      const insertedEmployees = await db
        .insert(employees)
        .values([
          {
            login: "smirnov",
            name: "Алексей Смирнов",
            role: "user",
            department: "Цех металлоконструкций и сборки",
            position: "Слесарь-сборщик МП · 4 разряд",
            blocked: false,
          },
          {
            login: "petrov",
            name: "Иван Петров",
            role: "user",
            department: "Деревообрабатывающий и ЧПУ цех",
            position: "Оператор ЧПУ / Столяр",
            blocked: false,
          },
          {
            login: "volkov",
            name: "Сергей Волков",
            role: "manager",
            department: "Производственный отдел",
            position: "Начальник смены / Мастер цеха",
            blocked: false,
          },
          {
            login: "admin",
            name: "Дарья Алексеевна",
            role: "admin",
            department: "Администрация ИТ и техбазы",
            position: "Администратор системы",
            blocked: false,
          },
        ])
        .returning();

      const smirnov = insertedEmployees.find((e) => e.login === "smirnov")!;
      const petrov = insertedEmployees.find((e) => e.login === "petrov")!;
      const volkov = insertedEmployees.find((e) => e.login === "volkov")!;
      const adminUser = insertedEmployees.find((e) => e.login === "admin")!;

      // Seed recent downloads for employees
      await db.insert(employeeDownloads).values([
        {
          employeeId: smirnov.id,
          employeeLogin: smirnov.login,
          fileName: "161-л.DXF",
          fileTitle: "Панель Окно верхнее (994х1210х21 мм) — Левый",
          fileType: "DXF",
          fileUrl: "/downloads/dxf/161-%D0%BB.DXF",
          article: "000161",
          category: "Чертёж DXF · Панели и фасады",
        },
        {
          employeeId: smirnov.id,
          employeeLogin: smirnov.login,
          fileName: "161-п.DXF",
          fileTitle: "Панель Окно верхнее (994х1210х21 мм) — Правый зеркальный",
          fileType: "DXF",
          fileUrl: "/downloads/dxf/161-%D0%BF.DXF",
          article: "000161",
          category: "Чертёж DXF · Зеркальные чертежи",
        },
        {
          employeeId: smirnov.id,
          employeeLogin: smirnov.login,
          fileName: "23.GIF",
          fileTitle: "Ступенька лесенки (600х140х18) — Эскиз детали",
          fileType: "GIF",
          fileUrl: "/detail-images/23.GIF",
          article: "000023",
          category: "Библиотека деталей · Лестницы",
        },
        {
          employeeId: smirnov.id,
          employeeLogin: smirnov.login,
          fileName: "110.DXF",
          fileTitle: "Площадка двойная 1500х800 (СБ) — Раскрой настила",
          fileType: "DXF",
          fileUrl: "/downloads/dxf/110.DXF",
          article: "0044СБ",
          category: "Сборочные узлы · Площадки",
        },
        {
          employeeId: smirnov.id,
          employeeLogin: smirnov.login,
          fileName: "ИКССР-1.08_2023(новые цвета).xlsx",
          fileTitle: "Спецификация ИКССР-1.08 · новые цвета 2023",
          fileType: "XLSX",
          fileUrl: "/downloads/%D0%98%D0%9A%D0%A1%D0%A1%D0%A0-1.08_2023(%D0%BD%D0%BE%D0%B2%D1%8B%D0%B5%20%D1%86%D0%B2%D0%B5%D1%82%D0%B0).xlsx",
          article: "ИКССР-1.08",
          category: "Документация и загрузки",
        },
        {
          employeeId: petrov.id,
          employeeLogin: petrov.login,
          fileName: "163-п.DXF",
          fileTitle: "Боковина крыши двойного домика (822х770х21 мм) — Зеркальный",
          fileType: "DXF",
          fileUrl: "/downloads/dxf/163-%D0%BF.DXF",
          article: "000163",
          category: "Чертёж DXF · Зеркальные чертежи",
        },
        {
          employeeId: petrov.id,
          employeeLogin: petrov.login,
          fileName: "29.DXF",
          fileTitle: "Деталь 000029 — Основной чертёж раскроя",
          fileType: "DXF",
          fileUrl: "/downloads/dxf/29.DXF",
          article: "000029",
          category: "Чертёж DXF · ЧПУ раскрой",
        },
        {
          employeeId: volkov.id,
          employeeLogin: volkov.login,
          fileName: "ИКССР-1.07_2023(новые цвета).xlsx",
          fileTitle: "Спецификация ИКССР-1.07 · новые цвета 2023",
          fileType: "XLSX",
          fileUrl: "/downloads/%D0%98%D0%9A%D0%A1%D0%A1%D0%A0-1.07_2023(%D0%BD%D0%BE%D0%B2%D1%8B%D0%B5%20%D1%86%D0%B2%D0%B5%D1%82%D0%B0).xlsx",
          article: "ИКССР-1.07",
          category: "Документация и загрузки",
        },
        {
          employeeId: adminUser.id,
          employeeLogin: adminUser.login,
          fileName: "библиотека-изображений-деталей.zip",
          fileTitle: "Архив библиотеки изображений деталей (1804 GIF)",
          fileType: "ZIP",
          fileUrl: "/downloads/%D0%B1%D0%B8%D0%B1%D0%BB%D0%B8%D0%BE%D1%82%D0%B5%D0%BA%D0%B0-%D0%B8%D0%B7%D0%BE%D0%B1%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D0%B9-%D0%B4%D0%B5%D1%82%D0%B0%D0%BB%D0%B5%D0%B9.zip",
          article: "АРХИВ-GIF",
          category: "Документация и загрузки",
        },
      ]);

      // Seed employee complaints
      await db.insert(employeeComplaints).values([
        {
          employeeId: smirnov.id,
          employeeLogin: smirnov.login,
          employeeName: smirnov.name,
          subject: "Уточнение по креплению горки 0006МП в узле Горка 900 ПНД",
          message:
            "В таблице сборочных узлов для Горки 900 ПНД указана масса крепления 1,46 кг, но в цех поступила партия с новой перфорацией под М8. Проверьте, пожалуйста, актуальность PDF-чертежа.",
          contact: "Внутр. 204, цех МП",
          page: "Сборочные узлы · Горка 900 ПНД",
          status: "reviewing",
          adminReply:
            "Принято в работу: конструкторский отдел сверяет ревизию 0006МП, обновим PDF до конца смены.",
        },
        {
          employeeId: smirnov.id,
          employeeLogin: smirnov.login,
          employeeName: smirnov.name,
          subject: "Зеркальный файл 163-п.DXF для ИКССР-1.07",
          message:
            "Раньше скачивался только основной файл 163.DXF, спасибо что вынесли зеркальные чертежи в отдельный зелёный блок — теперь на ЧПУ путаницы нет!",
          contact: "Цех сборки №2",
          page: "Карточка ИКССР-1.07",
          status: "resolved",
          adminReply: "Спасибо за обратную связь! Зеркальные DXF закреплены во всех карточках.",
        },
        {
          employeeId: petrov.id,
          employeeLogin: petrov.login,
          employeeName: petrov.name,
          subject: "Добавить фасадную накладку для лавочки со спинкой",
          message:
            "На столярном участке спрашивают чертёж бруса 1500 мм для парковых лавочек в разделе благоустройства. Можно ли закрепить артикул в блоке Лавочки?",
          contact: "Столярный участок, пост 3",
          page: "Элементы благоустройства · Лавочки",
          status: "new",
          adminReply: "",
        },
      ]);

      // Seed admin warnings for employees
      await db.insert(adminWarnings).values([
        {
          employeeId: smirnov.id,
          employeeLogin: smirnov.login,
          employeeName: smirnov.name,
          issuedBy: "Дарья Алексеевна (Администратор сайта)",
          reason:
            "Внимание по смене: при сборке городков ИКССР-1.08 и ИКССР-1.09 используйте только актуальную спецификацию «новые цвета 2023» (RAL 7024 / 1037 / 5024). Старые распечатки из цеха необходимо сдать мастеру.",
          severity: "warning",
          acknowledged: false,
        },
        {
          employeeId: smirnov.id,
          employeeLogin: smirnov.login,
          employeeName: smirnov.name,
          issuedBy: "Дарья Алексеевна (Администратор сайта)",
          reason:
            "Напоминание: перед отправкой деталей 000161 и 000163 на покраску обязательно проверяйте маркировку «Левый / Правый (зеркальный)» по чертежу из базы.",
          severity: "info",
          acknowledged: true,
        },
        {
          employeeId: petrov.id,
          employeeLogin: petrov.login,
          employeeName: petrov.name,
          issuedBy: "Дарья Алексеевна (Администратор сайта)",
          reason:
            "Просьба не передавать файлы раскроя DXF со старых флешек — скачивайте актуальную ревизию напрямую из карточки изделия перед запуском станка.",
          severity: "warning",
          acknowledged: false,
        },
      ]);

      // Seed audit logs
      await db.insert(auditLogs).values([
        {
          actorLogin: "admin",
          actorName: "Дарья Алексеевна",
          action: "warning",
          targetLogin: "smirnov",
          details: "Отправлено предупреждение о переходе на спецификацию цветов 2023",
        },
        {
          actorLogin: "admin",
          actorName: "Дарья Алексеевна",
          action: "complaint",
          targetLogin: "smirnov",
          details: "Обращение #2 переведено в статус «Решена»",
        },
      ]);
    }

    initialized = true;
  } catch (err) {
    console.error("Database initialization warning:", err);
  }
}
