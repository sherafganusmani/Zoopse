"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { apiRequest, getStoredToken } from "@/lib/api";

type Defaulter = {
  studentId: string;
  studentName: string;
  rollNumber: string;
  percentage: number;
};

export default function ReportsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["defaulters"],
    queryFn: () => apiRequest<Defaulter[]>("/reports/defaulters?threshold=75", { token: getStoredToken() }).then((res) => res.data)
  });

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">Reports</h1>
      <Card className="mt-6 p-5">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading defaulter report...</p> : null}
        {error ? <p className="text-sm text-danger">{(error as Error).message}</p> : null}
        {data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-3 font-medium">Student</th>
                  <th className="py-3 font-medium">Roll Number</th>
                  <th className="py-3 font-medium">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((row) => (
                  <tr key={row.studentId}>
                    <td className="py-3">{row.studentName}</td>
                    <td className="py-3">{row.rollNumber}</td>
                    <td className="py-3">{row.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {!isLoading && !error && !data?.length ? <p className="text-sm text-muted-foreground">No defaulters found.</p> : null}
      </Card>
    </AppShell>
  );
}
