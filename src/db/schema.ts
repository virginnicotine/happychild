import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  login: text("login").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // 'user' | 'manager' | 'admin'
  department: text("department").notNull().default("Производственный цех"),
  position: text("position").notNull().default("Рабочий цеха"),
  blocked: boolean("blocked").notNull().default(false),
  passwordHash: text("password_hash").notNull().default("demo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const employeeDownloads = pgTable("employee_downloads", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  employeeLogin: text("employee_login").notNull(),
  fileName: text("file_name").notNull(),
  fileTitle: text("file_title").notNull(),
  fileType: text("file_type").notNull().default("DXF"), // 'DXF' | 'PDF' | 'XLSX' | 'ZIP' | 'RAR' | 'GIF'
  fileUrl: text("file_url").notNull(),
  article: text("article").default(""),
  category: text("category").default("Чертежи и документация"),
  downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
});

export const employeeComplaints = pgTable("employee_complaints", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  employeeLogin: text("employee_login").notNull(),
  employeeName: text("employee_name").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  contact: text("contact").default(""),
  page: text("page").default("Главная страница"),
  status: text("status").notNull().default("new"), // 'new' | 'reviewing' | 'resolved' | 'rejected'
  adminReply: text("admin_reply").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminWarnings = pgTable("admin_warnings", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  employeeLogin: text("employee_login").notNull(),
  employeeName: text("employee_name").notNull(),
  issuedBy: text("issued_by").notNull().default("Дарья Алексеевна (Администратор)"),
  reason: text("reason").notNull(),
  severity: text("severity").notNull().default("warning"), // 'info' | 'warning' | 'critical'
  acknowledged: boolean("acknowledged").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actorLogin: text("actor_login").notNull(),
  actorName: text("actor_name").notNull(),
  action: text("action").notNull(),
  targetLogin: text("target_login").default(""),
  details: text("details").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
