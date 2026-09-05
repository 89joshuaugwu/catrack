import { Timestamp } from "firebase-admin/firestore";
import { adminDb as db } from "./firebase-admin";
import { ApiError } from "./server-auth";
import { gradeAnswers, millis, studentQuiz, validateAnswers } from "./assessment";
import type { Answer, Quiz } from "@/types";

export const gradeQuiz = gradeAnswers;
function review(quiz:Quiz) { return quiz.allowReview && Date.now() >= millis(quiz.endWindow) ? quiz.questions.map(q=>({questionId:q.id,correctOptionId:q.correctOptionId})) : []; }
export async function startQuizAttempt(quizId: string, uid: string) {
  const ref = db.collection("quizzes").doc(quizId);
  return db.runTransaction(async tx => {
    const quizDoc = await tx.get(ref);
    if (!quizDoc.exists) throw new ApiError("Quiz not found.", 404);
    const q = quizDoc.data()!;
    const quiz = { ...q, id: quizId, maxScore:q.questions.length, startWindow: millis(q.startWindow), endWindow: millis(q.endWindow) } as Quiz;
    const attemptRef = ref.collection("attempts").doc(uid);
    const existing = await tx.get(attemptRef);
    const now = Date.now();
    if (existing.exists) {
      const a = existing.data()!;
      return { quiz: studentQuiz(quiz), startedAt: millis(a.startedAt), serverNow: now,
        durationMinutes: quiz.durationMinutes, answers: a.answers ?? [],
        result: a.status === "submitted" ? { score:a.score, maxScore:quiz.maxScore, lateSubmission:!!a.lateSubmission, review:review(quiz) } : null };
    }
    if (quiz.status !== "published" || now < quiz.startWindow || now >= quiz.endWindow)
      throw new ApiError("This quiz is not currently available.");
    if (!quiz.questions?.length) throw new ApiError("This quiz has no questions.");
    tx.create(attemptRef, { startedAt:Timestamp.fromMillis(now), submittedAt:null, status:"in_progress", answers:[] });
    return { quiz:studentQuiz(quiz), startedAt:now, serverNow:now, durationMinutes:quiz.durationMinutes, answers:[], result:null };
  });
}
export async function saveOrSubmitAttempt(quizId: string, uid: string, input: unknown, submit: boolean) {
  const quizRef = db.collection("quizzes").doc(quizId);
  const ref = quizRef.collection("attempts").doc(uid);
  return db.runTransaction(async tx => {
    const [quizDoc, attemptDoc] = await Promise.all([tx.get(quizRef), tx.get(ref)]);
    if (!quizDoc.exists || !attemptDoc.exists) throw new ApiError("Start this quiz before answering.", 404);
    const quiz = quizDoc.data() as Quiz;
    quiz.maxScore = quiz.questions.length;
    const attempt = attemptDoc.data()!;
    if (attempt.status === "submitted") return { score:attempt.score, maxScore:quiz.maxScore, lateSubmission:!!attempt.lateSubmission, review:review(quiz) };
    const now = Date.now();
    const deadline = Math.min(millis(attempt.startedAt) + quiz.durationMinutes * 60000, millis(quiz.endWindow));
    let answers: Answer[];
    try { answers = validateAnswers(input, quiz.questions); } catch(e) { throw new ApiError((e as Error).message); }
    if (!submit) {
      if (now > deadline) throw new ApiError("Time is up. Submit your saved answers.");
      tx.update(ref, { answers });
      return { saved:true };
    }
    // After the transport grace, only previously saved answers can count.
    const lateSubmission = now > deadline + 30000;
    if (lateSubmission) answers = attempt.answers ?? [];
    const score = gradeAnswers(answers, quiz.questions);
    tx.update(ref, { answers, submittedAt:Timestamp.fromMillis(now), status:"submitted", score, lateSubmission });
    return { score, maxScore:quiz.maxScore, lateSubmission, review:review(quiz) };
  });
}
export async function submitQuizAttempt(quizId: string, uid: string, answers: Answer[]) {
  return saveOrSubmitAttempt(quizId, uid, answers, true);
}
