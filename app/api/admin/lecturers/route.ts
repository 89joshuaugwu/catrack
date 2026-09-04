import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
    const caller = await adminAuth.verifyIdToken(token);
    const callerProfile = await adminDb.collection("users").doc(caller.uid).get();
    if (callerProfile.data()?.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    const { displayName, email } = await request.json();
    if (!displayName || !email) return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    const temporaryPassword = crypto.randomUUID().slice(0, 12) + "Aa!";
    const record = await adminAuth.createUser({ displayName, email, password: temporaryPassword, emailVerified: false });
    await adminDb.collection("users").doc(record.uid).set({ uid: record.uid, displayName, email, role: "lecturer" });
    return NextResponse.json({ uid: record.uid, temporaryPassword }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not provision lecturer.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
