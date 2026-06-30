import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const userStatus = pgEnum("user_status", ["active", "invited", "suspended", "archived"]);
export const attendanceStatus = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
  "medical_leave",
  "od_leave",
  "holiday",
  "cancelled",
  "half_day"
]);
export const leaveStatus = pgEnum("leave_status", ["draft", "submitted", "approved", "rejected", "cancelled"]);
export const noticePriority = pgEnum("notice_priority", ["normal", "important", "urgent"]);
export const paymentStatus = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
};

export const colleges = pgTable("colleges", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  domain: varchar("domain", { length: 180 }),
  logoUrl: text("logo_url"),
  timezone: varchar("timezone", { length: 80 }).default("Asia/Kolkata").notNull(),
  address: text("address"),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps
});

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 80 }).notNull().unique(),
  description: text("description"),
  ...timestamps
});

export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  description: text("description"),
  ...timestamps
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id").references(() => roles.id, { onDelete: "cascade" }).notNull(),
    permissionId: uuid("permission_id").references(() => permissions.id, { onDelete: "cascade" }).notNull()
  },
  (table) => ({ pk: primaryKey({ columns: [table.roleId, table.permissionId] }) })
);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").references(() => roles.id).notNull(),
  email: varchar("email", { length: 180 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  passwordHash: text("password_hash").notNull(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  avatarUrl: text("avatar_url"),
  status: userStatus("status").default("active").notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  ...timestamps
}, (table) => ({
  emailCollegeIdx: uniqueIndex("users_college_email_idx").on(table.collegeId, table.email)
}));

export const departments = pgTable("departments", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  code: varchar("code", { length: 32 }).notNull(),
  hodUserId: uuid("hod_user_id").references(() => users.id),
  ...timestamps
});

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 140 }).notNull(),
  code: varchar("code", { length: 32 }).notNull(),
  durationYears: integer("duration_years").notNull(),
  ...timestamps
});

export const branches = pgTable("branches", {
  id: uuid("id").defaultRandom().primaryKey(),
  departmentId: uuid("department_id").references(() => departments.id, { onDelete: "cascade" }).notNull(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 140 }).notNull(),
  code: varchar("code", { length: 32 }).notNull(),
  ...timestamps
});

export const academicYears = pgTable("academic_years", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 32 }).notNull(),
  startsOn: date("starts_on").notNull(),
  endsOn: date("ends_on").notNull(),
  isCurrent: boolean("is_current").default(false).notNull(),
  ...timestamps
});

export const divisions = pgTable("divisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  branchId: uuid("branch_id").references(() => branches.id, { onDelete: "cascade" }).notNull(),
  academicYearId: uuid("academic_year_id").references(() => academicYears.id, { onDelete: "cascade" }).notNull(),
  semester: integer("semester").notNull(),
  name: varchar("name", { length: 16 }).notNull(),
  ...timestamps
});

export const batches = pgTable("batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  divisionId: uuid("division_id").references(() => divisions.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 40 }).notNull(),
  ...timestamps
});

export const facultyProfiles = pgTable("faculty_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  departmentId: uuid("department_id").references(() => departments.id).notNull(),
  employeeCode: varchar("employee_code", { length: 64 }).notNull(),
  designation: varchar("designation", { length: 120 }).notNull(),
  joiningDate: date("joining_date"),
  ...timestamps
});

export const parentProfiles = pgTable("parent_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  occupation: varchar("occupation", { length: 120 }),
  ...timestamps
});

export const studentProfiles = pgTable("student_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  parentId: uuid("parent_id").references(() => parentProfiles.id),
  divisionId: uuid("division_id").references(() => divisions.id).notNull(),
  batchId: uuid("batch_id").references(() => batches.id),
  rollNumber: varchar("roll_number", { length: 32 }).notNull(),
  prn: varchar("prn", { length: 64 }).notNull().unique(),
  admissionDate: date("admission_date"),
  ...timestamps
});

export const subjects = pgTable("subjects", {
  id: uuid("id").defaultRandom().primaryKey(),
  branchId: uuid("branch_id").references(() => branches.id, { onDelete: "cascade" }).notNull(),
  code: varchar("code", { length: 32 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  semester: integer("semester").notNull(),
  credits: numeric("credits", { precision: 4, scale: 1 }).notNull(),
  isLab: boolean("is_lab").default(false).notNull(),
  ...timestamps
});

export const timetableSlots = pgTable("timetable_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  divisionId: uuid("division_id").references(() => divisions.id).notNull(),
  batchId: uuid("batch_id").references(() => batches.id),
  subjectId: uuid("subject_id").references(() => subjects.id).notNull(),
  facultyId: uuid("faculty_id").references(() => facultyProfiles.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  startsAt: varchar("starts_at", { length: 8 }).notNull(),
  endsAt: varchar("ends_at", { length: 8 }).notNull(),
  room: varchar("room", { length: 80 }),
  isLab: boolean("is_lab").default(false).notNull(),
  ...timestamps
});

export const attendanceSessions = pgTable("attendance_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  timetableSlotId: uuid("timetable_slot_id").references(() => timetableSlots.id),
  subjectId: uuid("subject_id").references(() => subjects.id).notNull(),
  facultyId: uuid("faculty_id").references(() => facultyProfiles.id).notNull(),
  divisionId: uuid("division_id").references(() => divisions.id).notNull(),
  batchId: uuid("batch_id").references(() => batches.id),
  sessionDate: date("session_date").notNull(),
  startsAt: varchar("starts_at", { length: 8 }).notNull(),
  endsAt: varchar("ends_at", { length: 8 }).notNull(),
  mode: varchar("mode", { length: 40 }).default("manual").notNull(),
  lockedAt: timestamp("locked_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  remarks: text("remarks"),
  ...timestamps
});

export const attendanceRecords = pgTable("attendance_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").references(() => attendanceSessions.id, { onDelete: "cascade" }).notNull(),
  studentId: uuid("student_id").references(() => studentProfiles.id, { onDelete: "cascade" }).notNull(),
  status: attendanceStatus("status").notNull(),
  markedByUserId: uuid("marked_by_user_id").references(() => users.id).notNull(),
  markedAt: timestamp("marked_at", { withTimezone: true }).defaultNow().notNull(),
  source: varchar("source", { length: 40 }).default("manual").notNull(),
  remarks: text("remarks"),
  ...timestamps
}, (table) => ({
  sessionStudentIdx: uniqueIndex("attendance_session_student_idx").on(table.sessionId, table.studentId)
}));

export const attendanceLogs = pgTable("attendance_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  attendanceRecordId: uuid("attendance_record_id").references(() => attendanceRecords.id, { onDelete: "cascade" }).notNull(),
  actorUserId: uuid("actor_user_id").references(() => users.id).notNull(),
  previousStatus: attendanceStatus("previous_status"),
  nextStatus: attendanceStatus("next_status").notNull(),
  reason: text("reason"),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const holidays = pgTable("holidays", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  holidayDate: date("holiday_date").notNull(),
  appliesTo: jsonb("applies_to").default({}).notNull(),
  ...timestamps
});

export const leaveApplications = pgTable("leave_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  applicantUserId: uuid("applicant_user_id").references(() => users.id).notNull(),
  approverUserId: uuid("approver_user_id").references(() => users.id),
  startsOn: date("starts_on").notNull(),
  endsOn: date("ends_on").notNull(),
  type: varchar("type", { length: 60 }).notNull(),
  status: leaveStatus("status").default("submitted").notNull(),
  reason: text("reason").notNull(),
  documentUrl: text("document_url"),
  reviewerComment: text("reviewer_comment"),
  ...timestamps
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  ownerUserId: uuid("owner_user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  type: varchar("type", { length: 60 }).notNull(),
  url: text("url").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  ...timestamps
});

export const assignments = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "cascade" }).notNull(),
  facultyId: uuid("faculty_id").references(() => facultyProfiles.id).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  attachmentUrl: text("attachment_url"),
  ...timestamps
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  recipientUserId: uuid("recipient_user_id").references(() => users.id),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  channel: varchar("channel", { length: 40 }).notNull(),
  priority: noticePriority("priority").default("normal").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  ...timestamps
});

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  generatedByUserId: uuid("generated_by_user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 80 }).notNull(),
  filters: jsonb("filters").default({}).notNull(),
  fileUrl: text("file_url"),
  ...timestamps
});

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 120 }).notNull(),
  value: jsonb("value").notNull(),
  isEncrypted: boolean("is_encrypted").default(false).notNull(),
  ...timestamps
}, (table) => ({
  collegeKeyIdx: uniqueIndex("settings_college_key_idx").on(table.collegeId, table.key)
}));

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  action: varchar("action", { length: 140 }).notNull(),
  entity: varchar("entity", { length: 120 }).notNull(),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata").default({}).notNull(),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  refreshTokenHash: text("refresh_token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  ...timestamps
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }).notNull(),
  planName: varchar("plan_name", { length: 80 }).notNull(),
  status: varchar("status", { length: 40 }).notNull(),
  seats: integer("seats").notNull(),
  currentPeriodEndsAt: timestamp("current_period_ends_at", { withTimezone: true }).notNull(),
  ...timestamps
});

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id, { onDelete: "cascade" }).notNull(),
  invoiceNumber: varchar("invoice_number", { length: 80 }).notNull().unique(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: paymentStatus("status").default("pending").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  ...timestamps
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  provider: varchar("provider", { length: 80 }).notNull(),
  providerPaymentId: varchar("provider_payment_id", { length: 160 }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: paymentStatus("status").default("pending").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  ...timestamps
});

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }),
  openedByUserId: uuid("opened_by_user_id").references(() => users.id),
  subject: varchar("subject", { length: 180 }).notNull(),
  status: varchar("status", { length: 40 }).default("open").notNull(),
  priority: varchar("priority", { length: 40 }).default("normal").notNull(),
  description: text("description").notNull(),
  ...timestamps
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  collegeId: uuid("college_id").references(() => colleges.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  event: varchar("event", { length: 140 }).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
