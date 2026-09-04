import AppShell from "@/components/shells/AppShell";
import CAOverviewTable from "@/components/organisms/CAOverviewTable";
import { demoUser, mockAttempts, mockCourses, mockQuizzes } from "@/lib/mock-data";

export default function CAOverviewPage() {
  const user = demoUser.lecturer;
  const myCourses = mockCourses.filter((c) => c.lecturerId === user.uid);

  const studentDirectory = [
    { uid: "stu1", name: "Ada Obi", email: "ada.obi@esut.edu.ng" },
    { uid: "stu2", name: "Chike Nwosu", email: "chike.nwosu@esut.edu.ng" },
  ];

  return (
    <AppShell role="lecturer" userName={user.displayName}>
      <h1 className="font-display text-2xl mb-6">CA Overview</h1>

      <div className="grid gap-6">
        {myCourses.map((course) => {
          const courseQuizzes = mockQuizzes.filter((q) => q.courseId === course.id);
          const students = studentDirectory.map((s) => ({
            ...s,
            attempts: mockAttempts.filter(
              (a) => a.uid === s.uid && courseQuizzes.some((q) => q.id === a.quizId)
            ),
          }));

          return (
            <CAOverviewTable key={course.id} course={course} quizzes={courseQuizzes} students={students} />
          );
        })}
      </div>
    </AppShell>
  );
}
