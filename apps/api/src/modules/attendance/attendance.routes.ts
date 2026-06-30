import { Router } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { attendanceRecords, attendanceSessions } from "@campus/db";
import { db } from "../../db/client";
import { ApiError, ok } from "../../http/api-response";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { offset, pageQuerySchema } from "../../utils/pagination";

export const attendanceRouter = Router();

const createSessionSchema = z.object({
  collegeId: z.string().uuid(),
  subjectId: z.string().uuid(),
  facultyId: z.string().uuid(),
  divisionId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
  timetableSlotId: z.string().uuid().optional(),
  sessionDate: z.string().date(),
  startsAt: z.string().regex(/^\d{2}:\d{2}$/),
  endsAt: z.string().regex(/^\d{2}:\d{2}$/),
  mode: z.enum(["manual", "qr", "otp", "rfid", "biometric", "geo"]).default("manual"),
  remarks: z.string().max(1000).optional()
});

const markSchema = z.object({
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(["present", "absent", "late", "medical_leave", "od_leave", "holiday", "cancelled", "half_day"]),
      remarks: z.string().max(500).optional()
    })
  ).min(1)
});

attendanceRouter.use(requireAuth);

attendanceRouter.get("/sessions", validate(pageQuerySchema, "query"), requirePermission("attendance.read"), async (req, res) => {
  const { page, pageSize } = req.query as unknown as { page: number; pageSize: number };
  const rows = await db
    .select()
    .from(attendanceSessions)
    .orderBy(desc(attendanceSessions.sessionDate))
    .limit(pageSize)
    .offset(offset(page, pageSize));

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(attendanceSessions);
  return ok(req, res, rows, 200, { page, pageSize, total: Number(count) });
});

attendanceRouter.post("/sessions", validate(createSessionSchema), requirePermission("attendance.write"), async (req, res) => {
  const [created] = await db.insert(attendanceSessions).values(req.body).returning();
  return ok(req, res, created, 201);
});

attendanceRouter.post("/sessions/:sessionId/records", validate(z.object({ sessionId: z.string().uuid() }), "params"), validate(markSchema), requirePermission("attendance.write"), async (req, res) => {
  const [session] = await db.select().from(attendanceSessions).where(eq(attendanceSessions.id, req.params.sessionId)).limit(1);
  if (!session) {
    throw new ApiError(404, "SESSION_NOT_FOUND", "Attendance session was not found");
  }
  if (session.lockedAt) {
    throw new ApiError(409, "SESSION_LOCKED", "Attendance session is locked");
  }

  const values = req.body.records.map((record: { studentId: string; status: string; remarks?: string }) => ({
    sessionId: req.params.sessionId,
    studentId: record.studentId,
    status: record.status as typeof attendanceRecords.$inferInsert.status,
    remarks: record.remarks,
    markedByUserId: req.user!.id,
    source: session.mode
  }));

  const saved = await db
    .insert(attendanceRecords)
    .values(values)
    .onConflictDoUpdate({
      target: [attendanceRecords.sessionId, attendanceRecords.studentId],
      set: {
        status: sql`excluded.status`,
        remarks: sql`excluded.remarks`,
        markedByUserId: req.user!.id,
        updatedAt: sql`now()`
      }
    })
    .returning();

  return ok(req, res, saved);
});

attendanceRouter.post("/sessions/:sessionId/lock", validate(z.object({ sessionId: z.string().uuid() }), "params"), requirePermission("attendance.lock"), async (req, res) => {
  const [locked] = await db
    .update(attendanceSessions)
    .set({ lockedAt: new Date() })
    .where(and(eq(attendanceSessions.id, req.params.sessionId), sql`${attendanceSessions.lockedAt} is null`))
    .returning();

  if (!locked) {
    throw new ApiError(404, "SESSION_NOT_LOCKED", "Session was not found or is already locked");
  }

  return ok(req, res, locked);
});
