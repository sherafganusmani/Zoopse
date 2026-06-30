import type { ApiResponse, DashboardOverview } from "@campus/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

type RequestOptions = RequestInit & {
  token?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
      ...options.headers
    },
    cache: "no-store"
  });

  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error?.message ?? "Request failed");
  }

  return payload as ApiResponse<T>;
}

export function getStoredToken() {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.localStorage.getItem("accessToken") ?? undefined;
}

export async function fetchDashboard() {
  return apiRequest<DashboardOverview>("/dashboard/overview", { token: getStoredToken() }).then((res) => res.data);
}
