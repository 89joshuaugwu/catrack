import { NextResponse } from "next/server";
import { startQuizAttempt } from "@/lib/quiz-attempts";
import { apiError, requireUser } from "@/lib/server-auth";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request, ["student"]);
    const { id } = await params;
    
    return NextResponse.json(await startQuizAttempt(id, user.uid));
  } catch (error) { return apiError(error); }
}
