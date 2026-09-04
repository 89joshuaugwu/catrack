import AppShell from "@/components/shells/AppShell";
import QuizCard from "@/components/molecules/QuizCard";
import { demoUser, mockAttempts, mockCourses, mockQuizzes } from "@/lib/mock-data";

export default function StudentQuizzesPage() {
  const user = demoUser.student;
  const myAttempts = mockAttempts.filter((a) => a.uid === user.uid);

  return (
    <AppShell role="student" userName={user.displayName}>
      <h1 className="font-display text-2xl mb-6">Quizzes</h1>

      {mockQuizzes.length === 0 ? (
        <p className="text-text-secondary">No quizzes open right now</p>
      ) : (
        <div className="grid gap-4">
          {mockQuizzes.map((quiz) => {
            const course = mockCourses.find((c) => c.id === quiz.courseId);
            const attempt = myAttempts.find((a) => a.quizId === quiz.id);
            return (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                courseLabel={course ? `${course.code} — ${course.name}` : ""}
                ownScore={attempt?.score}
                maxScore={attempt ? quiz.maxScore : undefined}
              />
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
