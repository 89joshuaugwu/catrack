"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { AppUser, Role } from "@/types";

export function useCurrentUser() {
  const [user, setUser] = useState<(AppUser & { firebaseUser: User }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (!active) return;
      setUser(null); setLoading(true); setError("");
      try {
        if (firebaseUser) {
          const data = await api<AppUser>("/api/profile");
          if (!data || !["admin","lecturer","student"].includes(data.role) || data.disabled)
            throw new Error("Your account is not provisioned or has been disabled. Contact your administrator.");
          if (active && auth.currentUser?.uid === firebaseUser.uid)
            setUser({ uid:firebaseUser.uid, email:data.email, displayName:data.displayName, role:data.role, firebaseUser });
        }
      } catch(e) { if(active) setError(e instanceof Error ? e.message : "Could not load your profile."); }
      finally { if(active) setLoading(false); }
    });
    return () => { active=false; unsubscribe(); };
  }, []);
  return { user, loading, error };
}
export function rolePath(role: Role) {
  return role === "student" ? "/dashboard/quizzes" : role === "lecturer" ? "/dashboard/lecturer/quizzes" : "/dashboard/admin/courses";
}
export async function api<T>(path: string, body?: unknown): Promise<T> {
  if (!auth.currentUser) throw new Error("Please sign in again.");
  const token = await auth.currentUser.getIdToken();
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type":"application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache:"no-store", signal:AbortSignal.timeout(25000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "The request failed.");
  return data as T;
}
