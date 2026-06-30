"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { apiRequest, getStoredToken } from "@/lib/api";

type Department = {
  id: string;
  name: string;
  code: string;
};

export default function DirectoryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiRequest<Department[]>("/directory/departments", { token: getStoredToken() }).then((res) => res.data)
  });

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">Directory</h1>
      <Card className="mt-6 p-5">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading departments...</p> : null}
        {error ? <p className="text-sm text-danger">{(error as Error).message}</p> : null}
        {data?.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.map((department) => (
              <div key={department.id} className="rounded-md border border-border p-4">
                <p className="font-medium">{department.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{department.code}</p>
              </div>
            ))}
          </div>
        ) : null}
        {!isLoading && !error && !data?.length ? <p className="text-sm text-muted-foreground">No departments found.</p> : null}
      </Card>
    </AppShell>
  );
}
