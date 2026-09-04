import { notFound } from "next/navigation";
import AppShell from "@/components/shells/AppShell";
import ClassResultsView from "@/components/organisms/ClassResultsView";
import { demoUser, mockAttempts, mockQuizzes } from "@/lib/mock-data";

export default async function QuizResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = mockQuizzes.find((q) => q.id === id);
  if (!quiz) notFound();

  const results = mockAttempts
    .filter((a) => a.quizId === id)
    .map((a) => ({
      name: a.studentName,
      email: a.studentEmail,
      score: a.score,
      lateSubmission: a.lateSubmission,
    }));

  return (
    <AppShell role="lecturer" userName={demoUser.lecturer.displayName}>
      <div className="mb-8"><p className="eyebrow">Assessment results</p><h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{quiz.title}</h1><p className="mt-2 text-text-secondary">{quiz.questions.length} questions · {quiz.durationMinutes} minutes · {quiz.weight} CA marks</p></div>
      <div className="surface rounded-2xl p-5 sm:p-6"><ClassResultsView quizTitle={quiz.title} maxScore={quiz.maxScore} results={results} /></div>
    </AppShell>
  );
}
