// Server-validated quiz timing — CONTEXT.md Section 2.
// The client's countdown is display-only; enforcement happens here.
import { Timestamp } from "firebase-admin/firestore";
import { adminDb as db } from "./firebase-admin";
import type { Answer, Question, Quiz } from "@/types";

export async function startQuizAttempt(
  quizId: string,
  uid: string
): Promise<{ startedAt: number; durationMinutes: number }> {
  const quizSnap = await db.collection("quizzes").doc(quizId).get();
  const quiz = quizSnap.data() as Quiz | undefined;
  if (!quiz) throw new Error("Quiz not found.");

  const now = Date.now();

  if (now < quiz.startWindow || now > quiz.endWindow) {
    throw new Error("This quiz is not currently available.");
  }

  const attemptRef = db
    .collection("quizzes")
    .doc(quizId)
    .collection("attempts")
    .doc(uid);

  if ((await attemptRef.get()).exists) {
    throw new Error("You have already taken this quiz.");
  }

  await attemptRef.set({
    startedAt: Timestamp.fromMillis(now),
    submittedAt: null,
    status: "in_progress",
    answers: [],
  });

  return { startedAt: now, durationMinutes: quiz.durationMinutes };
}

export async function submitQuizAttempt(
  quizId: string,
  uid: string,
  answers: Answer[]
): Promise<{ score: number }> {
  const attemptRef = db
    .collection("quizzes")
    .doc(quizId)
    .collection("attempts")
    .doc(uid);

  const attemptSnap = await attemptRef.get();
  const attempt = attemptSnap.data();
  if (!attempt) throw new Error("No attempt in progress for this quiz.");
  if (attempt.status === "submitted") {
    throw new Error("This attempt has already been submitted.");
  }

  const quizSnap = await db.collection("quizzes").doc(quizId).get();
  const quiz = quizSnap.data() as Quiz | undefined;
  if (!quiz) throw new Error("Quiz not found.");

  const startedAtMillis: number = attempt.startedAt.toMillis
    ? attempt.startedAt.toMillis()
    : attempt.startedAt;
  const elapsedMinutes = (Date.now() - startedAtMillis) / 60000;

  let lateSubmission = false;
  if (elapsedMinutes > quiz.durationMinutes + 0.5) {
    lateSubmission = true;
  }

  const score = gradeQuiz(answers, quiz.questions);

  await attemptRef.update({
    answers,
    submittedAt: Timestamp.now(),
    status: "submitted",
    score,
    lateSubmission,
  });

  return { score };
}

export function gradeQuiz(answers: Answer[], questions: Question[]): number {
  return answers.reduce((score, answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    return question && answer.selectedOptionId === question.correctOptionId
      ? score + 1
      : score;
  }, 0);
}
