import Link from "next/link";
import AppShell from "@/components/shells/AppShell";
import Button from "@/components/ui/Button";
import { demoUser, mockCourses, mockQuizzes } from "@/lib/mock-data";

export default function LecturerQuizzesPage() {
  const user = demoUser.lecturer;
  const myQuizzes = mockQuizzes.filter((q) => q.createdBy === user.uid);

  return (
    <AppShell role="lecturer" userName={user.displayName}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">My Quizzes</h1>
        <Link href="/dashboard/lecturer/quizzes/new">
          <Button>+ New quiz</Button>
        </Link>
      </div>

      <div className="ledger">
        {myQuizzes.map((quiz) => {
          const course = mockCourses.find((c) => c.id === quiz.courseId);
          return (
            <Link key={quiz.id} href={`/dashboard/lecturer/quizzes/${quiz.id}/results`}>
              <div className="ledger-row flex items-center justify-between py-4 group">
                <div>
                  <p className="text-xs text-text-secondary">{course?.code}</p>
                  <p className="font-medium group-hover:text-primary">{quiz.title}</p>
                </div>
                <span className="text-sm text-text-secondary capitalize">{quiz.status}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
