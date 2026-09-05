import { NextResponse } from "next/server";
import { saveOrSubmitAttempt } from "@/lib/quiz-attempts";
import { apiError, requireUser } from "@/lib/server-auth";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request, ["student"]);
    const { id } = await params;
    const { answers } = await request.json();
    return NextResponse.json(await saveOrSubmitAttempt(id, user.uid, answers, false));
  } catch (error) { return apiError(error); }
}
