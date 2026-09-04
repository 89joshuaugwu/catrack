"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Wire up to Firebase Auth (signInWithEmailAndPassword) once your
      // project's config is in .env.local — see lib/firebase.ts.
      await new Promise((r) => setTimeout(r, 400));
      router.push("/dashboard");
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm grid gap-5">
        <div className="flex flex-col items-center gap-3 mb-2">
          <Image src="/logo.png" alt="CATrack" width={56} height={56} className="rounded-xl" />
          <h1 className="font-display text-xl font-semibold">Sign in to CATrack</h1>
          <p className="text-sm text-text-secondary text-center">
            No public sign-up — accounts are provisioned by your admin or lecturer.
          </p>
        </div>

        <label className="grid gap-1 text-sm">
          Email
          <input
            type="email"
            required
            className="min-h-12 px-3 rounded-lg border border-border"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@esut.edu.ng"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Password
          <input
            type="password"
            required
            className="min-h-12 px-3 rounded-lg border border-border"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <Button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
