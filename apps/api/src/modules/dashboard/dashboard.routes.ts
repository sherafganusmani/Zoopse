import { Router } from "express";
import { pool } from "../../db/client";
import { ok } from "../../http/api-response";
import { requireAuth } from "../../middlewares/auth";

export const dashboardRouter = Router();

dashboardRouter.get("/overview", requireAuth, async (req, res) => {
  const collegeWhere = req.user?.collegeId ? "where s.college_id = $1" : "";
  const params = req.user?.collegeId ? [req.user.collegeId] : [];

  const attendanceSummaryResult = await pool.query(`
    select
      count(*)::int as total,
      coalesce(round(100.0 * count(*) filter (where status = 'present') / nullif(count(*), 0), 2), 0)::float as present_percentage,
      count(*) filter (where status = 'absent')::int as absent_count,
      count(*) filter (where status = 'late')::int as late_count
    from attendance_records
  `);
  const attendanceSummary = attendanceSummaryResult.rows[0];

  const attendanceTrend = await pool.query(`
    select s.session_date::text as date,
      count(*) filter (where r.status = 'present')::int as present,
      count(*) filter (where r.status = 'absent')::int as absent,
      count(*) filter (where r.status = 'late')::int as late
    from attendance_sessions s
    left join attendance_records r on r.session_id = s.id
    ${collegeWhere}
    group by s.session_date
    order by s.session_date desc
    limit 14
  `, params);

  const departmentPerformance = await pool.query(`
    select d.name as department,
      coalesce(round(100.0 * count(*) filter (where ar.status = 'present') / nullif(count(*), 0), 2), 0)::float as percentage,
      count(distinct sp.id)::int as students
    from departments d
    left join branches b on b.department_id = d.id
    left join divisions dv on dv.branch_id = b.id
    left join student_profiles sp on sp.division_id = dv.id
    left join attendance_records ar on ar.student_id = sp.id
    group by d.id
    order by percentage desc
    limit 8
  `);

  const notifications = await pool.query(`
    select id::text, title, priority as severity, created_at as "createdAt"
    from notifications
    order by created_at desc
    limit 6
  `);

  return ok(req, res, {
    metrics: [
      { label: "Attendance", value: Number(attendanceSummary?.present_percentage ?? 0), trend: 0, unit: "%" },
      { label: "Records", value: Number(attendanceSummary?.total ?? 0), trend: 0, unit: "count" },
      { label: "Absences", value: Number(attendanceSummary?.absent_count ?? 0), trend: 0, unit: "count" },
      { label: "Late Marks", value: Number(attendanceSummary?.late_count ?? 0), trend: 0, unit: "count" }
    ],
    attendanceTrend: attendanceTrend.rows,
    departmentPerformance: departmentPerformance.rows,
    notifications: notifications.rows
  });
});
