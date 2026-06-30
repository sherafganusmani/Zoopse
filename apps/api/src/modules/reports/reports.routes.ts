import { Router } from "express";
import { pool } from "../../db/client";
import { ok } from "../../http/api-response";
import { requireAuth, requirePermission } from "../../middlewares/auth";

export const reportsRouter = Router();

reportsRouter.use(requireAuth);

reportsRouter.get("/defaulters", requirePermission("reports.export"), async (req, res) => {
  const threshold = Number(req.query.threshold ?? 75);
  const result = await pool.query(`
    select sp.id::text as "studentId", u.full_name as "studentName", sp.roll_number as "rollNumber",
      coalesce(round(100.0 * count(*) filter (where ar.status = 'present') / nullif(count(*), 0), 2), 0)::float as percentage
    from student_profiles sp
    inner join users u on u.id = sp.user_id
    left join attendance_records ar on ar.student_id = sp.id
    group by sp.id, u.full_name, sp.roll_number
    having coalesce(round(100.0 * count(*) filter (where ar.status = 'present') / nullif(count(*), 0), 2), 0) < $1
    order by percentage asc
  `, [threshold]);

  return ok(req, res, result.rows);
});

reportsRouter.get("/attendance-trend", requirePermission("attendance.read"), async (req, res) => {
  const result = await pool.query(`
    select s.session_date::text as date,
      coalesce(round(100.0 * count(*) filter (where r.status = 'present') / nullif(count(*), 0), 2), 0)::float as percentage
    from attendance_sessions s
    left join attendance_records r on r.session_id = s.id
    group by s.session_date
    order by s.session_date asc
  `);

  return ok(req, res, result.rows);
});
