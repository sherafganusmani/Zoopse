"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { apiRequest, getStoredToken } from "@/lib/api";

type AttendanceSession = {
  id: string;
  sessionDate: string;
  startsAt: string;
  endsAt: string;
  mode: string;
  lockedAt?: string | null;
};

export default function AttendancePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["attendance-sessions"],
    queryFn: () => apiRequest<AttendanceSession[]>("/attendance/sessions", { token: getStoredToken() }).then((res) => res.data)
  });

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Attendance</h1>
      </div>
      <Card className="mt-6 p-5">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading sessions...</p> : null}
        {error ? <p className="text-sm text-danger">{(error as Error).message}</p> : null}
        {data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-3 font-medium">Date</th>
                  <th className="py-3 font-medium">Time</th>
                  <th className="py-3 font-medium">Mode</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((session) => (
                  <tr key={session.id}>
                    <td className="py-3">{session.sessionDate}</td>
                    <td className="py-3">{session.startsAt} - {session.endsAt}</td>
                    <td className="py-3 capitalize">{session.mode}</td>
                    <td className="py-3">{session.lockedAt ? "Locked" : "Open"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {!isLoading && !error && !data?.length ? <p className="text-sm text-muted-foreground">No attendance sessions found.</p> : null}
      </Card>
    </AppShell>
  );
}
