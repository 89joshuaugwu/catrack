"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardCheck, GraduationCap, Settings2, Users } from "lucide-react";
import type { Role } from "@/types";

interface NavItem { href: string; label: string; icon: typeof BookOpen; }
const NAV: Record<Role, NavItem[]> = {
  student: [{ href: "/dashboard/quizzes", label: "My quizzes", icon: ClipboardCheck }, { href: "/dashboard/scores", label: "CA progress", icon: GraduationCap }],
  lecturer: [{ href: "/dashboard/lecturer/students", label: "Students", icon: Users }, { href: "/dashboard/lecturer/quizzes", label: "Quiz library", icon: ClipboardCheck }, { href: "/dashboard/lecturer/ca-overview", label: "Class progress", icon: GraduationCap }],
  admin: [{ href: "/dashboard/lecturer/quizzes", label: "Quizzes", icon: ClipboardCheck }, { href: "/dashboard/lecturer/ca-overview", label: "Results", icon: GraduationCap }, { href: "/dashboard/admin/students", label: "Students", icon: Users }, { href: "/dashboard/admin/courses", label: "Courses", icon: BookOpen }, { href: "/dashboard/admin/lecturers", label: "Lecturers", icon: Users }],
};
export default function AppShell({ role, userName, children }: { role: Role; userName: string; children: React.ReactNode }) {
  const pathname = usePathname(); const nav = NAV[role];
  return <div className="min-h-screen bg-bg">
    <header className="sticky top-0 z-20 border-b border-border/80 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6"><Link href="/dashboard" className="flex items-center gap-3"><Image src="/logo.png" alt="CATrack" width={36} height={36} className="rounded-xl shadow-sm" /><span className="font-display text-lg font-bold tracking-tight">CATrack</span></Link><div className="flex items-center gap-3"><button className="min-h-12 px-2 text-sm text-primary" onClick={async()=>{try{await signOut(auth);window.location.assign("/auth/login");}catch{toast.error("Could not sign out. Please retry.");}}}>Sign out</button><div className="hidden text-right sm:block"><p className="text-sm font-semibold leading-tight">{userName}</p><p className="mt-0.5 text-xs capitalize text-text-secondary">{role} workspace</p></div><div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-sm font-bold text-primary">{userName.slice(0, 1)}</div></div></div></header>
    <div className="mx-auto flex max-w-7xl"><aside className="hidden w-60 shrink-0 border-r border-border/80 px-4 py-7 lg:block"><p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[.14em] text-text-secondary">Workspace</p><nav className="grid gap-1">{nav.map(({ href, label, icon: Icon }) => { const active = pathname.startsWith(href); return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${active ? "bg-primary text-white shadow-sm shadow-blue-600/20" : "text-text-secondary hover:bg-white hover:text-text-primary"}`}><Icon size={18} />{label}</Link>; })}</nav><div className="mt-8 border-t border-border pt-5"><p className="flex items-center gap-2 px-3 text-xs text-text-secondary"><Settings2 size={14} /> Assessment portal</p></div></aside><main className="min-w-0 flex-1 px-4 pt-7 pb-28 sm:px-6 lg:px-10 lg:py-9">{children}</main></div>
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-white/95 px-3 py-2 backdrop-blur lg:hidden">{nav.map(({ href, label, icon: Icon }) => { const active = pathname.startsWith(href); return <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold ${active ? "text-primary" : "text-text-secondary"}`}><Icon size={19}/>{label}</Link>; })}</nav>
  </div>;
}
