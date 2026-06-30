import { Router } from "express";
import { ilike, or, sql } from "drizzle-orm";
import { departments, studentProfiles, users } from "@campus/db";
import { db } from "../../db/client";
import { ok } from "../../http/api-response";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { offset, pageQuerySchema } from "../../utils/pagination";

export const directoryRouter = Router();

directoryRouter.use(requireAuth);

directoryRouter.get("/departments", requirePermission("directory.manage"), async (req, res) => {
  const rows = await db.select().from(departments).orderBy(departments.name);
  return ok(req, res, rows);
});

directoryRouter.get("/students", validate(pageQuerySchema, "query"), requirePermission("attendance.read"), async (req, res) => {
  const { page, pageSize, search } = req.query as unknown as { page: number; pageSize: number; search?: string };
  const where = search ? or(ilike(users.fullName, `%${search}%`), ilike(studentProfiles.prn, `%${search}%`)) : undefined;

  const rows = await db
    .select({
      id: studentProfiles.id,
      fullName: users.fullName,
      email: users.email,
      rollNumber: studentProfiles.rollNumber,
      prn: studentProfiles.prn
    })
    .from(studentProfiles)
    .innerJoin(users, sql`${users.id} = ${studentProfiles.userId}`)
    .where(where)
    .limit(pageSize)
    .offset(offset(page, pageSize));

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(studentProfiles);
  return ok(req, res, rows, 200, { page, pageSize, total: Number(count) });
});
