"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { apiRequest, getStoredToken } from "@/lib/api";

type Setting = {
  id: string;
  key: string;
  value: unknown;
  isEncrypted: boolean;
};

export default function SettingsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: () => apiRequest<Setting[]>("/settings", { token: getStoredToken() }).then((res) => res.data)
  });

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card className="mt-6 p-5">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading settings...</p> : null}
        {error ? <p className="text-sm text-danger">{(error as Error).message}</p> : null}
        {data?.length ? (
          <div className="divide-y divide-border">
            {data.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium">{setting.key}</p>
                  <p className="text-sm text-muted-foreground">{setting.isEncrypted ? "Encrypted value" : JSON.stringify(setting.value)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {!isLoading && !error && !data?.length ? <p className="text-sm text-muted-foreground">No settings found.</p> : null}
      </Card>
    </AppShell>
  );
}
