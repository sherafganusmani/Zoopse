"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarCheck, FileBarChart, GraduationCap, LayoutDashboard, Search, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/directory", label: "Directory", icon: Users },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-border bg-card/74 px-4 py-5 backdrop-blur lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap size={22} />
          </span>
          <span>
            <span className="block text-sm font-semibold">Campus Suite</span>
            <span className="block text-xs text-muted-foreground">Attendance SaaS</span>
          </span>
        </Link>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  active && "bg-primary/10 font-medium text-primary"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-border bg-background/82 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <div className="relative max-w-2xl flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-muted-foreground" size={18} />
              <Input aria-label="Global search" className="pl-10" placeholder="Search students, faculty, subjects, attendance" />
            </div>
            <button aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card">
              <Bell size={18} />
            </button>
            <div className="hidden h-10 items-center rounded-md border border-border bg-card px-3 text-sm font-medium md:flex">Profile</div>
          </div>
        </header>
        <div className="px-4 py-6 md:px-6">{children}</div>
      </main>
    </div>
  );
}
