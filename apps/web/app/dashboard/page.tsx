"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowUpRight, CalendarClock } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { fetchDashboard } from "@/lib/api";

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ["dashboard"], queryFn: fetchDashboard });

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Overview</p>
          <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">Attendance Command Center</h1>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          <CalendarClock size={18} />
          Quick Action
        </button>
      </div>

      {isLoading ? <DashboardSkeleton /> : null}
      {error ? (
        <Card className="flex items-center gap-3 p-4 text-sm text-danger">
          <AlertTriangle size={18} />
          {(error as Error).message}
        </Card>
      ) : null}

      {data ? (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.metrics.map((metric, index) => (
              <motion.div key={metric.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                <Card className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="mt-2 text-3xl font-semibold">
                        {metric.value}
                        {metric.unit === "%" ? "%" : ""}
                      </p>
                    </div>
                    <span className="rounded-md bg-success/12 p-2 text-success">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <Card className="p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Attendance Trend</h2>
                <p className="text-sm text-muted-foreground">Lecture-wise signal from the database</p>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.attendanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="present" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.18)" />
                    <Area type="monotone" dataKey="absent" stroke="hsl(var(--danger))" fill="hsl(var(--danger) / 0.12)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Department Performance</h2>
                <p className="text-sm text-muted-foreground">Subject to actual attendance records</p>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.departmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>

          <Card className="p-5">
            <h2 className="text-lg font-semibold">Notification Center</h2>
            <div className="mt-4 divide-y divide-border">
              {data.notifications.length ? (
                data.notifications.map((notice) => (
                  <div key={notice.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{notice.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(notice.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="rounded-md border border-border px-2 py-1 text-xs capitalize">{notice.severity}</span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-sm text-muted-foreground">No notifications found.</p>
              )}
            </div>
          </Card>
        </div>
      ) : null}
    </AppShell>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-32 animate-pulse bg-muted" />
        ))}
      </div>
      <Card className="h-96 animate-pulse bg-muted" />
    </div>
  );
}
