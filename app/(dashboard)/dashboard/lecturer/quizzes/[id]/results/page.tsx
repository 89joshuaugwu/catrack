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
      <h1 className="font-display text-2xl mb-6">{quiz.title}</h1>
      <ClassResultsView quizTitle={quiz.title} maxScore={quiz.maxScore} results={results} />
    </AppShell>
  );
}
