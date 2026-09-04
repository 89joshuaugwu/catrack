import { NextRequest, NextResponse } from "next/server";
import { submitQuizAttempt } from "@/lib/quiz-attempts";
import { adminAuth } from "@/lib/firebase-admin";
import type { Answer } from "@/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const { answers } = (await req.json()) as { answers: Answer[] };
    const result = await submitQuizAttempt(id, decoded.uid, answers);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not submit quiz attempt." },
      { status: 400 }
    );
  }
}
