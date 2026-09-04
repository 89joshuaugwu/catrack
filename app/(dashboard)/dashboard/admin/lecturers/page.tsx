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
      <h1 className="font-display text-2xl mb-6">Lecturers</h1>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="ledger">
          {lecturers.map((l) => (
            <div key={l.uid} className="ledger-row flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{l.name}</p>
                <p className="text-sm text-text-secondary">{l.email}</p>
              </div>
            </div>
          ))}
        </div>

        <Card className="grid gap-3 h-fit">
          <p className="font-medium">Provision lecturer account</p>
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
