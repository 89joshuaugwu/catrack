import AppShell from "@/components/shells/AppShell";
import ScoreHistoryView from "@/components/organisms/ScoreHistoryView";
import { demoUser, mockAttempts, mockCourses, mockQuizzes } from "@/lib/mock-data";

export default function ScoresPage() {
  const user = demoUser.student;
  const myAttempts = mockAttempts.filter((a) => a.uid === user.uid);

  return (
    <AppShell role="student" userName={user.displayName}>
      <h1 className="font-display text-2xl mb-6">My Scores</h1>

      <div className="grid gap-6">
        {mockCourses.map((course) => {
          const courseQuizzes = mockQuizzes.filter((q) => q.courseId === course.id);
          const courseAttempts = myAttempts.filter((a) =>
            courseQuizzes.some((q) => q.id === a.quizId)
          );
          return (
            <ScoreHistoryView
              key={course.id}
              studentName={user.displayName}
              course={course}
              quizzes={courseQuizzes}
              attempts={courseAttempts}
            />
          );
        })}
      </div>
    </AppShell>
  );
}
