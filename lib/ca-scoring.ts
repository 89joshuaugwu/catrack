// Weighted CA aggregation — CONTEXT.md Section 3.
// Each quiz's raw score is normalized to its assigned weight *before*
// summing, so a lecturer genuinely controls how much each quiz counts
// toward the final CA total, regardless of how many questions it has.
import type { Attempt, Quiz } from "@/types";

export function computeCAScore(
  attempts: Pick<Attempt, "quizId" | "score">[],
  quizzes: Pick<Quiz, "id" | "maxScore" | "weight">[],
  caCeiling: number
): number {
  const total = attempts.reduce((sum, attempt) => {
    const quiz = quizzes.find((q) => q.id === attempt.quizId);
    if (!quiz || !quiz.maxScore) return sum;
    const normalized = (attempt.score / quiz.maxScore) * quiz.weight;
    return sum + normalized;
  }, 0);

  return Math.min(total, caCeiling);
}
