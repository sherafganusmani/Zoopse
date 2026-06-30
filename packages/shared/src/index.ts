export const roles = [
  "super_admin",
  "college_admin",
  "principal",
  "hod",
  "faculty",
  "lab_assistant",
  "class_teacher",
  "student",
  "parent"
] as const;

export type Role = (typeof roles)[number];

export const permissions = [
  "college.manage",
  "billing.manage",
  "settings.manage",
  "directory.manage",
  "timetable.manage",
  "attendance.read",
  "attendance.write",
  "attendance.lock",
  "reports.export",
  "leave.approve",
  "materials.manage",
  "notifications.send",
  "audit.read"
] as const;

export type Permission = (typeof permissions)[number];

export type ApiMeta = {
  requestId: string;
  timestamp: string;
  page?: number;
  pageSize?: number;
  total?: number;
};

export type ApiResponse<T> = {
  success: true;
  data: T;
  meta: ApiMeta;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ApiMeta;
};

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "medical_leave"
  | "od_leave"
  | "holiday"
  | "cancelled"
  | "half_day";

export type DashboardMetric = {
  label: string;
  value: number;
  trend: number;
  unit?: "%" | "count" | "currency";
};

export type DashboardOverview = {
  metrics: DashboardMetric[];
  attendanceTrend: Array<{ date: string; present: number; absent: number; late: number }>;
  departmentPerformance: Array<{ department: string; percentage: number; students: number }>;
  notifications: Array<{ id: string; title: string; severity: "info" | "warning" | "critical"; createdAt: string }>;
};

export type PageQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
};
