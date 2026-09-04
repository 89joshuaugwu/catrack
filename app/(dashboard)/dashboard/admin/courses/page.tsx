"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import AppShell from "@/components/shells/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { demoUser, mockCourses } from "@/lib/mock-data";

export default function AdminCoursesPage() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [caCeiling, setCaCeiling] = useState(30);

  return (
    <AppShell role="admin" userName={demoUser.admin.displayName}>
      <div className="mb-8"><p className="eyebrow">Registry workspace</p><h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Course catalogue</h1><p className="mt-2 text-text-secondary">Set the CA ceiling and keep course records ready for assessment.</p></div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="surface rounded-2xl p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-bold">Active courses</h2><span className="text-xs font-bold text-text-secondary">{mockCourses.length} courses</span></div><div className="ledger">
          {mockCourses.map((c) => (
            <div key={c.id} className="ledger-row flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{c.code}</p>
                <p className="text-sm text-text-secondary">{c.name}</p>
              </div>
              <span className="text-sm text-text-secondary font-tnum">CA / {c.caCeiling}</span>
            </div>
          ))}
        </div></div>

        <Card className="grid gap-3 h-fit">
          <div><p className="font-display text-lg font-bold">Add a course</p><p className="mt-1 text-sm text-text-secondary">Make it available for assessment setup.</p></div>
          <input
            className="min-h-12 px-3 rounded-lg border border-border"
            placeholder="Course code (e.g. CSC301)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <input
            className="min-h-12 px-3 rounded-lg border border-border"
            placeholder="Course name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="grid gap-1 text-sm">
            CA ceiling
            <input
              type="number"
              className="min-h-12 px-3 rounded-lg border border-border"
              value={caCeiling}
              onChange={(e) => setCaCeiling(Number(e.target.value))}
            />
          </label>
          <Button
            onClick={() => {
              toast.success("Course saved — sample data only in this demo build.");
              setName("");
              setCode("");
            }}
          >
            Save course
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
