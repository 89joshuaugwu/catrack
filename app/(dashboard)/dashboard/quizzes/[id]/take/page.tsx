import { notFound } from "next/navigation";
import QuizTakingInterface from "@/components/organisms/QuizTakingInterface";
import { mockQuizzes } from "@/lib/mock-data";

export default async function TakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = mockQuizzes.find((q) => q.id === id);
  if (!quiz) notFound();

  // In production this comes from POST /api/quizzes/[id]/start, which
  // records the server-validated startedAt timestamp (CONTEXT.md Section 2).
  const startedAt = Date.now();

  return (
    <QuizTakingInterface
      quizId={quiz.id}
      title={quiz.title}
      questions={quiz.questions}
      startedAt={startedAt}
      durationMinutes={quiz.durationMinutes}
    />
  );
}
