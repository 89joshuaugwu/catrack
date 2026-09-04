"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import AppShell from "@/components/shells/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { demoUser } from "@/lib/mock-data";

const lecturers = [{ uid: "lec1", name: "Dr. Uzo Eze", email: "u.eze@esut.edu.ng" }];

export default function AdminLecturersPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <AppShell role="admin" userName={demoUser.admin.displayName}>
      <div className="mb-8"><p className="eyebrow">Registry workspace</p><h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Lecturer accounts</h1><p className="mt-2 text-text-secondary">Provision access for staff who create and review assessments.</p></div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="surface rounded-2xl p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-bold">Current lecturers</h2><span className="text-xs font-bold text-text-secondary">{lecturers.length} active</span></div><div className="ledger">
          {lecturers.map((l) => (
            <div key={l.uid} className="ledger-row flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{l.name}</p>
                <p className="text-sm text-text-secondary">{l.email}</p>
              </div>
            </div>
          ))}
        </div></div>

        <Card className="grid gap-3 h-fit">
          <div><p className="font-display text-lg font-bold">Provision access</p><p className="mt-1 text-sm text-text-secondary">Create a staff account for the assessment portal.</p></div>
          <input
            className="min-h-12 px-3 rounded-lg border border-border"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            className="min-h-12 px-3 rounded-lg border border-border"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            onClick={() => {
              toast.success("Lecturer invited — sample data only in this demo build.");
              setName("");
              setEmail("");
            }}
          >
            Create account
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
