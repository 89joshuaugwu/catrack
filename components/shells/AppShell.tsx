"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
}

const NAV: Record<Role, NavItem[]> = {
  student: [
    { href: "/dashboard/quizzes", label: "Quizzes" },
    { href: "/dashboard/scores", label: "My Scores" },
  ],
  lecturer: [
    { href: "/dashboard/lecturer/quizzes", label: "My Quizzes" },
    { href: "/dashboard/lecturer/ca-overview", label: "CA Overview" },
  ],
  admin: [
    { href: "/dashboard/admin/courses", label: "Courses" },
    { href: "/dashboard/admin/lecturers", label: "Lecturers" },
  ],
};

export default function AppShell({
  role,
  userName,
  children,
}: {
  role: Role;
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const nav = NAV[role];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="CATrack" width={32} height={32} className="rounded" />
            <span className="font-display font-semibold text-lg">CATrack</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    active ? "bg-blue-50 text-primary" : "text-text-secondary hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary hidden sm:inline">{userName}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-text-secondary capitalize">
              {role}
            </span>
          </div>
        </div>

        <nav className="sm:hidden flex overflow-x-auto gap-1 px-4 pb-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
