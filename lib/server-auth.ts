import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "./firebase-admin";
import type { AppUser, Role } from "@/types";

export class ApiError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export async function requireUser(request: Request, roles?: Role[]): Promise<AppUser> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new ApiError("Please sign in.", 401);
  let uid: string;
  try { uid = (await adminAuth.verifyIdToken(header.slice(7), true)).uid; }
  catch { throw new ApiError("Your session expired. Please sign in again.", 401); }
  const snapshot = await adminDb.collection("users").doc(uid).get();
  const data = snapshot.data();
  if (!data || !["admin", "lecturer", "student"].includes(data.role) || data.disabled)
    throw new ApiError("Your account does not have access to this portal.", 403);
  if (roles && !roles.includes(data.role)) throw new ApiError("You do not have permission for this action.", 403);
  return { uid, displayName: data.displayName, email: data.email, role: data.role };
}
export function apiError(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error(error);
  return NextResponse.json({ error: "The request could not be completed. Please try again." }, { status: 500 });
}
