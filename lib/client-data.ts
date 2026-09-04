"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AppUser, Role } from "@/types";

export function useCurrentUser() {
  const [user, setUser] = useState<(AppUser & { firebaseUser: User }) | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) { setUser(null); setLoading(false); return; }
    const snapshot = await getDoc(doc(db, "users", firebaseUser.uid));
    if (snapshot.exists()) setUser({ ...(snapshot.data() as AppUser), firebaseUser });
    else setUser(null);
    setLoading(false);
  }), []);
  return { user, loading };
}

export function rolePath(role: Role) {
  return role === "student" ? "/dashboard/quizzes" : role === "lecturer" ? "/dashboard/lecturer/quizzes" : "/dashboard/admin/courses";
}
